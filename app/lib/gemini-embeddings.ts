export type GeminiEmbedding = {
  values: number[];
};

const GEMINI_EMBEDDING_MODEL = "models/gemini-embedding-001";
const GEMINI_EMBED_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

export const embedText = async (text: string): Promise<GeminiEmbedding> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const res = await fetch(`${GEMINI_EMBED_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GEMINI_EMBEDDING_MODEL,
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: 768,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini embed failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    embedding?: { values?: number[] };
    embeddings?: { values?: number[] }[];
  };

  const values = data.embedding?.values ?? data.embeddings?.[0]?.values;
  if (!values?.length) {
    throw new Error("Gemini embed response missing embedding values");
  }

  return { values };
};

