import express from "express";
import { loadIndexFromFile } from "./vectorStore.js";

async function main() {
  loadIndexFromFile();

  const app = express();
  app.use(express.json());

  // /query 用上一次写的 answerQuestion()

  app.listen(3000, () => {
    console.log("RAG service listening on http://localhost:3000");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
