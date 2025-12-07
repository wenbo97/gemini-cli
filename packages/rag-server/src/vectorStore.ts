import fs from "fs";
import path from "path";

export interface StoredChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

let chunks: StoredChunk[] = [];

export function loadIndexFromFile() {
  const indexPath = path.resolve(__dirname, "../data/rag-index.json");
  const raw = fs.readFileSync(indexPath, "utf8");
  const parsed = JSON.parse(raw) as StoredChunk[];
  chunks = parsed;
  console.log(`[vectorStore] loaded ${chunks.length} chunks from index`);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function search(embedding: number[], topK: number): StoredChunk[] {
  return chunks
    .map((c) => ({
      c,
      score: cosineSimilarity(embedding, c.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.c);
}