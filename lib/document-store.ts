import fs from "fs";
import path from "path";

export interface DocumentChunk {
  id: string;
  source: string;   // relative path within knowledge-base/
  heading: string;  // nearest markdown heading above this chunk
  content: string;
  tokens: string[]; // pre-tokenised for BM25 scoring
}

const KB_DIR = path.join(process.cwd(), "knowledge-base");
const CHUNK_CHARS = 700;

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function chunkDocument(text: string, source: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const lines = text.split("\n");
  let heading = "";
  let buffer = "";
  let idx = 0;

  const flush = () => {
    const trimmed = buffer.trim();
    if (trimmed.length < 60) return;
    chunks.push({
      id: `${source}#${idx++}`,
      source,
      heading,
      content: trimmed,
      tokens: tokenise(trimmed),
    });
    // 30-word overlap so chunks share context at boundaries
    const words = trimmed.split(/\s+/);
    buffer = words.slice(-30).join(" ") + "\n";
  };

  for (const line of lines) {
    if (/^#{1,3}\s/.test(line)) {
      if (buffer.trim().length > 80) flush();
      heading = line.replace(/^#+\s*/, "").trim();
    }
    buffer += line + "\n";
    if (buffer.length >= CHUNK_CHARS) flush();
  }
  flush();
  return chunks;
}

function readDirectory(dir: string, base: string): DocumentChunk[] {
  if (!fs.existsSync(dir)) return [];
  const results: DocumentChunk[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...readDirectory(full, base));
    } else if (/\.(md|txt)$/.test(entry.name)) {
      const rel = path.relative(base, full);
      const text = fs.readFileSync(full, "utf8");
      results.push(...chunkDocument(text, rel));
    }
  }
  return results;
}

// Module-level cache — loaded once per serverless function cold start
let _chunks: DocumentChunk[] | null = null;

export function getChunks(): DocumentChunk[] {
  if (!_chunks) _chunks = readDirectory(KB_DIR, KB_DIR);
  return _chunks;
}

/** Call this in tests or when you add new documents during development */
export function invalidateCache(): void {
  _chunks = null;
}
