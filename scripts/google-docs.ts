import { google } from "googleapis";

export const extractGoogleDocId = (urlOrId: string) => {
  const raw = urlOrId.trim();
  if (!raw) return null;
  if (!raw.includes("/")) return raw;

  // Typical format: https://docs.google.com/document/d/<DOC_ID>/edit
  const match = raw.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
};

const readServiceAccountJson = () => {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (inline?.trim()) {
    return JSON.parse(inline) as {
      client_email: string;
      private_key: string;
    };
  }

  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!path?.trim()) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS (service account)."
    );
  }

  // Lazy import to avoid bundler issues if used elsewhere
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("node:fs") as typeof import("node:fs");
  const raw = fs.readFileSync(path, "utf8");
  return JSON.parse(raw) as { client_email: string; private_key: string };
};

export const fetchGoogleDocPlainText = async (docUrlOrId: string) => {
  const docId = extractGoogleDocId(docUrlOrId);
  if (!docId) {
    throw new Error(`Cannot extract docId from: ${docUrlOrId}`);
  }

  const sa = readServiceAccountJson();
  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ["https://www.googleapis.com/auth/documents.readonly"],
  });

  const docs = google.docs({ version: "v1", auth });
  const res = await docs.documents.get({ documentId: docId });
  const body = res.data.body?.content ?? [];

  const lines: string[] = [];
  for (const element of body) {
    const paragraph = element.paragraph;
    if (!paragraph?.elements?.length) continue;

    let line = "";
    for (const pe of paragraph.elements) {
      const textRun = pe.textRun?.content;
      if (textRun) line += textRun;
    }

    const cleaned = line.replace(/\u000b/g, "").trimEnd();
    if (cleaned.trim().length > 0) {
      lines.push(cleaned.trim());
    }
  }

  return { docId, text: lines.join("\n") };
};

