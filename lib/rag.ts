import { getChunks, DocumentChunk } from "./document-store";

// BM25 constants — well-tested defaults from the literature
const K1 = 1.5;
const B = 0.75;
const MAX_CONTEXT_CHARS = 4000; // keep well within Claude's useful range

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function bm25(
  queryTerms: string[],
  chunk: DocumentChunk,
  avgDocLen: number,
  idf: Map<string, number>
): number {
  const docLen = chunk.tokens.length;
  const freq = new Map<string, number>();
  for (const t of chunk.tokens) freq.set(t, (freq.get(t) ?? 0) + 1);

  let score = 0;
  for (const term of queryTerms) {
    const tf = freq.get(term) ?? 0;
    if (tf === 0) continue;
    const idfVal = idf.get(term) ?? 0;
    score +=
      idfVal *
      (tf * (K1 + 1)) /
      (tf + K1 * (1 - B + B * (docLen / avgDocLen)));
  }
  return score;
}

/**
 * Retrieve the most relevant document chunks for a given query string.
 * Returns a formatted context block ready to prepend to a Claude prompt.
 * Returns an empty string when the knowledge-base folder is empty.
 */
export function retrieveContext(query: string, topK = 5): string {
  const chunks = getChunks();
  if (chunks.length === 0) return "";

  const queryTerms = tokenise(query);
  if (queryTerms.length === 0) return "";

  const avgDocLen =
    chunks.reduce((sum, c) => sum + c.tokens.length, 0) / chunks.length;

  // IDF computed only over terms that appear in the query — fast and sufficient
  const N = chunks.length;
  const idf = new Map<string, number>();
  for (const term of queryTerms) {
    const df = chunks.filter((c) => c.tokens.includes(term)).length;
    idf.set(term, Math.log((N - df + 0.5) / (df + 0.5) + 1));
  }

  const ranked = chunks
    .map((chunk) => ({ chunk, score: bm25(queryTerms, chunk, avgDocLen, idf) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (ranked.length === 0) return "";

  // Build the context block, respecting the character budget
  const parts: string[] = [];
  let totalChars = 0;

  for (const { chunk } of ranked) {
    const label = chunk.heading
      ? `[${chunk.source} › ${chunk.heading}]`
      : `[${chunk.source}]`;
    const block = `${label}\n${chunk.content}`;
    if (totalChars + block.length > MAX_CONTEXT_CHARS) break;
    parts.push(block);
    totalChars += block.length;
  }

  if (parts.length === 0) return "";

  return (
    `<internal_documents>\n` +
    `The following excerpts are from your organisation's internal Guidewire knowledge base.\n` +
    `Prioritise this information when it is relevant to the request.\n\n` +
    parts.join("\n\n---\n\n") +
    `\n</internal_documents>\n\n`
  );
}
