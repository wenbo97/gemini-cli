import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { randomUUID } from "crypto";

const client = new OpenAI({ apiKey: "" });

type IndexItem = {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    filePath: string;
    ruleId?: string;
    section?: string;
  };
};

function simpleSplit(text: string, maxLen = 800): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";

  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > maxLen) {
      if (current) chunks.push(current);
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function buildIndexFromMarkdown(rootDir: string): Promise<IndexItem[]> {
  const files: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name.endsWith(".md")) files.push(full);
    }
  }

  walk(rootDir);

  const allItems: IndexItem[] = [];

  for (const f of files) {
    console.log(`[build-index] processing ${f}`);
    const content = fs.readFileSync(f, "utf8");

    const chunks = simpleSplit(content);

    const embeddings = await embedBatch(chunks);

    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      const embedding = embeddings[i];

      const item: IndexItem = {
        id: randomUUID(),
        text,
        embedding,
        metadata: {
          filePath: path.relative(rootDir, f),
        },
      };

      allItems.push(item);
    }
  }

  return allItems;
}

async function main() {
  const ruleMarkdownRoot = path.resolve(__dirname, "../rules");
  const indexPath = path.resolve(__dirname, "../data/rag-index.json");

  const indexItems = await buildIndexFromMarkdown(ruleMarkdownRoot);

  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(indexItems), "utf8");

  console.log(`[build-index] wrote ${indexItems.length} chunks to ${indexPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
