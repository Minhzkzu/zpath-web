import { supabase } from "@/app/lib/supabase";

export type AdmissionsChunkMatch = {
  id: string;
  source_id: string;
  source_title: string;
  source_url: string | null;
  school_name: string | null;
  year: number | null;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

export const searchAdmissionsContext = async (args: {
  queryEmbedding: number[];
  matchCount?: number;
  filter?: { school_name?: string; year?: number };
}): Promise<AdmissionsChunkMatch[]> => {
  const { queryEmbedding, matchCount = 8, filter } = args;

  const { data, error } = await supabase.rpc("match_admissions_chunks", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    filter: filter ?? {},
  });

  if (error) {
    throw new Error(`Supabase RPC match_admissions_chunks failed: ${error.message}`);
  }

  return (data ?? []) as AdmissionsChunkMatch[];
};

export const buildAdmissionsContextBlock = (matches: AdmissionsChunkMatch[]) => {
  const top = matches
    .filter((m) => Number.isFinite(m.similarity))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 8);

  if (top.length === 0) {
    return { context: "", citations: [] as { title: string; url?: string | null }[] };
  }

  const citations = top.reduce<{ title: string; url?: string | null }[]>((acc, m) => {
    const key = `${m.source_title}__${m.source_url ?? ""}`;
    if (acc.some((c) => `${c.title}__${c.url ?? ""}` === key)) return acc;
    acc.push({ title: m.source_title, url: m.source_url });
    return acc;
  }, []);

  const context = top
    .map((m, i) => {
      const headerParts = [
        `#${i + 1}`,
        m.school_name ? `Trường: ${m.school_name}` : null,
        m.year ? `Năm: ${m.year}` : null,
        `Nguồn: ${m.source_title}`,
      ].filter(Boolean);
      return `${headerParts.join(" | ")}\n${m.content}`.trim();
    })
    .join("\n\n---\n\n");

  return { context, citations };
};

