import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

import { fetchGoogleDocPlainText } from "./google-docs";

type AdmissionsSource = {
  source_id: string;
  source_title: string;
  source_url?: string;
  school_name?: string;
  year?: number;
  google_doc_url?: string;
  text?: string;
  metadata?: Record<string, unknown>;
};

type SourcesFile = {
  sources: AdmissionsSource[];
};

const embedText = async (text: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${encodeURIComponent(
      apiKey
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: 768,
        title: "Admissions reference",
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini embed failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { embedding?: { values?: number[] } };
  const values = data.embedding?.values;
  if (!values?.length) throw new Error("Missing embedding values");
  return values;
};

const chunkText = (text: string, opts?: { maxChars?: number; overlapChars?: number }) => {
  const maxChars = opts?.maxChars ?? 1200;
  const overlapChars = opts?.overlapChars ?? 120;

  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + maxChars, normalized.length);
    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= normalized.length) break;
    start = Math.max(0, end - overlapChars);
  }
  return chunks;
};

const main = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const sourcesPath = process.argv[2] ?? path.join(process.cwd(), "scripts", "admissions-sources.mvp.json");
  const raw = fs.readFileSync(sourcesPath, "utf8");
  const parsed = JSON.parse(raw) as SourcesFile;

  if (!parsed.sources?.length) {
    throw new Error("No sources found in admissions-sources.mvp.json");
  }

  console.log(`Ingesting ${parsed.sources.length} sources...`);

  for (const source of parsed.sources) {
    let sourceText = source.text?.trim() ?? "";
    if (!sourceText) {
      const docUrl = source.google_doc_url ?? source.source_url;
      if (!docUrl) {
        throw new Error(
          `Source ${source.source_id} is missing text and google_doc_url/source_url.`
        );
      }

      console.log(`  fetching Google Doc for ${source.source_id}...`);
      const fetched = await fetchGoogleDocPlainText(docUrl);
      sourceText = fetched.text;
    }

    const chunks = chunkText(sourceText);
    console.log(`- ${source.source_id}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i += 1) {
      const content = chunks[i]!;
      const embedding = await embedText(content);

      const { error } = await supabase.from("admissions_chunks").insert({
        source_id: source.source_id,
        source_title: source.source_title,
        source_url: source.source_url ?? source.google_doc_url ?? null,
        school_name: source.school_name ?? null,
        year: source.year ?? null,
        chunk_index: i,
        content,
        metadata: source.metadata ?? {},
        embedding,
      });

      if (error) {
        throw new Error(`Insert failed for ${source.source_id} chunk ${i}: ${error.message}`);
      }
    }
  }

  console.log("Done.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

