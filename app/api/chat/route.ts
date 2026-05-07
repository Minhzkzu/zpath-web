import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { embedText } from '@/app/lib/gemini-embeddings';
import { buildAdmissionsContextBlock, searchAdmissionsContext } from '@/app/lib/admissions-rag';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type ChatMentorRole = 'user' | 'ai';
type ChatMentorMessage = { role: ChatMentorRole; content: string };

const isRetryableGeminiError = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /\[503 Service Unavailable\]|\b503\b|high demand|spikes in demand/i.test(msg) ||
    /\b429\b|rate limit|Too Many Requests|quota exceeded|exceeded your current quota/i.test(msg)
  );
};

const isQuotaExceededError = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  return /quota exceeded|exceeded your current quota|generate_content_free_tier_requests/i.test(msg);
};

const extractRetryAfterSeconds = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  const m = msg.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
  if (!m) return null;
  const v = Number(m[1]);
  return Number.isFinite(v) ? Math.max(1, Math.ceil(v)) : null;
};

const generateWithFallback = async (args: {
  genAI: GoogleGenerativeAI;
  systemPrompt: string;
  models?: string[];
  maxAttemptsPerModel?: number;
}) => {
  const models =
    args.models ??
    ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
  const maxAttemptsPerModel = args.maxAttemptsPerModel ?? 3;

  let lastErr: unknown;
  for (const modelName of models) {
    const model = args.genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt += 1) {
      try {
        const result = await model.generateContent(args.systemPrompt);
        return { text: result.response.text(), modelName };
      } catch (err) {
        lastErr = err;
        if (!isRetryableGeminiError(err)) throw err;
        const backoffMs = Math.min(2500, 300 * 2 ** (attempt - 1));
        await sleep(backoffMs);
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
};

const sanitizeHistory = (history: unknown): ChatMentorMessage[] => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && typeof m === 'object')
    .map((m) => {
      const role = (m as { role?: unknown }).role;
      const content = (m as { content?: unknown }).content;
      return {
        role: role === 'user' ? 'user' : 'ai',
        content: typeof content === 'string' ? content : '',
      } satisfies ChatMentorMessage;
    })
    .filter((m) => m.content.trim().length > 0)
    .slice(-12)
    .map((m) => ({
      ...m,
      content: m.content.trim().slice(0, 1200),
    }));
};

const extractFilter = (message: string) => {
  const yearMatch = message.match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : undefined;

  const schoolMatch =
    message.match(/(?:đại học|dh|trường)\s+([^\n,.;:]{3,60})/i) ??
    message.match(/bách khoa[^\n,.;:]{0,60}/i);
  const school_name = schoolMatch ? schoolMatch[1]?.trim() ?? schoolMatch[0]?.trim() : undefined;

  return { year, school_name };
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Thiếu GEMINI_API_KEY trong .env.local' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = (await request.json()) as {
      message?: string;
      history?: unknown;
      userProfile?: unknown;
    };

    const msg = typeof body.message === 'string' ? body.message.trim() : '';
    if (!msg) {
      return NextResponse.json({ error: 'Thiếu message' }, { status: 400 });
    }

    const userProfile = body.userProfile as
      | { personality?: string; scores?: { math?: number; physics?: number; third?: number } }
      | undefined;

    const scores = userProfile?.scores;
    const totalScore = scores
      ? Number(scores.math ?? 0) + Number(scores.physics ?? 0) + Number(scores.third ?? 0)
      : 0;

    const safeHistory = sanitizeHistory(body.history);
    const historyBlock =
      safeHistory.length > 0
        ? safeHistory
            .map((m, i) => `${i + 1}. ${m.role === 'user' ? 'Học sinh' : 'AI'}: ${m.content}`)
            .join('\n')
        : '(Chưa có lịch sử hội thoại)';

    let context = '';
    let citations: { title: string; url?: string | null }[] = [];

    try {
      const embedding = await embedText(msg);
      const derived = extractFilter(msg);
      const matches = await searchAdmissionsContext({
        queryEmbedding: embedding.values,
        matchCount: 10,
        filter:
          derived.school_name || derived.year
            ? { school_name: derived.school_name, year: derived.year }
            : undefined,
      });
      const built = buildAdmissionsContextBlock(matches);
      context = built.context;
      citations = built.citations;
    } catch (ragErr) {
      // If RAG isn't ready (missing RPC / schema cache / empty data), still answer without it.
      console.warn('Admissions RAG unavailable, continuing without context.', ragErr);
      context = '';
      citations = [];
    }

    const systemPrompt = `
Bạn là ZPATH AI Mentor, chuyên gia tuyển sinh & hướng nghiệp tại Việt Nam.

Thông tin học sinh:
- Tính cách: ${userProfile?.personality || 'Chưa rõ'}
- Tổng điểm tham khảo: ${totalScore}

Lịch sử hội thoại gần đây (để giữ ngữ cảnh, không được bịa thêm):
${historyBlock}

Ngữ cảnh dữ liệu tuyển sinh (trích từ kho nội bộ). Ưu tiên thông tin trong ngữ cảnh; không bịa số liệu.
${context ? `\n${context}\n` : '\n(Không có ngữ cảnh từ kho nội bộ.)\n'}

Câu hỏi mới nhất của học sinh: "${msg}"

Yêu cầu:
- Trả lời tiếng Việt, thân thiện, thực tế.
- Nếu thiếu dữ kiện (ngành, trường, năm, phương thức), hãy hỏi lại tối đa 2 câu hỏi ngắn.
- Ưu tiên cấu trúc: (1) Kết luận ngắn, (2) Chi tiết, (3) Việc bạn nên làm tiếp theo.
- Nếu có dùng dữ kiện từ kho, cuối phần trả lời thêm dòng "Nguồn: <tên nguồn>" (1-2 nguồn tiêu biểu).
    `.trim();

    const { text: reply } = await generateWithFallback({ genAI, systemPrompt });

    return NextResponse.json({ reply, citations });
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const retryAfterSec = extractRetryAfterSeconds(error);
    const status = isQuotaExceededError(error) ? 429 : isRetryableGeminiError(error) ? 503 : 500;
    return NextResponse.json(
      {
        error:
          status === 429
            ? `Bạn đã vượt quota Gemini (429).${retryAfterSec ? ` Thử lại sau ~${retryAfterSec}s.` : ''}`
            : status === 503
              ? 'Model đang quá tải (Gemini 503). Bạn thử lại sau 10-30s nhé.'
              : 'AI Mentor đang bận, vui lòng thử lại sau!',
        debug: process.env.NODE_ENV === 'development' ? msg : undefined,
      },
      { status, headers: retryAfterSec ? { 'Retry-After': String(retryAfterSec) } : undefined }
    );
  }
}