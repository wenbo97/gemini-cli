import { connect, type Table } from "vectordb";
import OpenAI from "openai";
import { log, warn } from "console";
import * as dotenv from 'dotenv';
import { AzureKeyCredential } from "@azure/core-auth";
import ModelClient, { isUnexpected, type GetEmbeddings200Response, type GetEmbeddingsDefaultResponse } from "@azure-rest/ai-inference";
import * as fs from 'fs';
const vectorDBPath = "C:/src/myGemini-cli/gemini-cli/packages/rag-server/vectordb";

export interface DocumentChunk {
  id: string;
  rule: string;
  title: string;
  text: string;
  vector: number[];
  source: string;
  createdAt: string;
  [key: string]: unknown;
}

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const githubEmbedApiEndpoint: string = process.env["GITHUB_EMBED_API"] ?? "";
const gitubPat: string = process.env["GITHUB_TOKEN"] ?? "";
const githubEmbedModel: string = process.env["GITHUB_EMBED_MODEL"] ?? "";

openai.logLevel = "info";

/**
 * Open ai embedding model.
 * @param text 
 * @returns 
 */
async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small", // great value for the price.
    input: text,
  });
  return res.data[0].embedding;
}

/**
 * Github Copilot embedding model.
 * @param text 
 * @returns 
 */
async function embedFromGithubCopilotApi(text: string): Promise<number[]> {
  const client = ModelClient(githubEmbedApiEndpoint, new AzureKeyCredential(gitubPat));

  const response: GetEmbeddingsDefaultResponse | GetEmbeddings200Response = await client.path("/embeddings").post({
    body: {
      input: [text],
      model: githubEmbedModel
    }
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  const embedding = response.body.data[0]?.embedding ?? [];

  if (typeof embedding === "string") {
    const decoded = atob(embedding);
    const numberArray = JSON.parse(decoded);
    return numberArray;
  } else if (Array.isArray(embedding)) {
    if (embedding.length === 0) {
      throw new Error("embedding number array is empty.");
    }
    return embedding;
  } else {
    throw new Error("Invalid embedding format.");
  }
}

/**
 * Struct doc gen.
 * @returns 
 */
export async function structDocGeneration(): Promise<DocumentChunk[]> {
  const docModels: DocumentChunk[] = [];
  const model = "openai/gpt-5-mini";
  const client = ModelClient(githubEmbedApiEndpoint, new AzureKeyCredential(gitubPat));

  const sysPrompt = `
  You are an assistant to help struct all 'DocumentChunk' objects:
  export interface DocumentChunk {
    id: string;
    title: string;
    text: string;
    vector: number[];
    source: string;
    createdAt: string;
  }
  You should get:
  ## [Id:<number>]
  ## [Rule:<RuleName>]
  ### Title: <TitleDescription>
  from a file top lines. and always return in this format:
  {
    id: <number>;
    rule: <RuleName>;
    title: <TitleDescription>;
    text: "";
    vector: [];
    source: "";
    createdAt: "";
  }
  `;

  const mdFileRoot = "C:/src/myGemini-cli/gemini-cli/packages/rag-server/rules";
  try {
    // Read the files in the specified directory

    const files = fs.readdirSync(mdFileRoot, { recursive: true });


    for (const file of files) {
      if (file.indexOf(".md") === -1) {
        log("Not a md file, skip. Path: " + file);
        continue;
      }

      log(`Generating vector for doc: ${file}`);
      // Process each file here, e.g., read file content, extract details
      const filePath = `${mdFileRoot}/${file}`;
      const fileContent = (await fs.promises.readFile(filePath, 'utf-8')).toString();

      // Parse the file content to extract necessary data
      const idMatch = fileContent.match(/## \[Id:(\d+)\]/);
      const ruleMatch = fileContent.match(/## \[Rule:(.*?)\]/);
      const titleMatch = fileContent.match(/### Title: (.*?)\n/);

      if (idMatch && ruleMatch && titleMatch) {
        const id = idMatch[1];
        const rule = ruleMatch[1];
        const title = titleMatch[1];

        // Call OpenAI API to generate the embedding vector (for illustration)
        // const response = await client.path("/chat/completions").post({
        //   body: {
        //     messages: [
        //       { role: "system", content: sysPrompt },
        //       { role: "user", content: fileContent }
        //     ],
        //     model: model
        //   }
        // });

        // if (isUnexpected(response)) {
        //   throw response.body.error;
        // }

        const vector = await embedFromGithubCopilotApi(fileContent);

        // Create the document chunk object
        const docChunk: DocumentChunk = {
          id,
          title,
          rule: rule,
          text: fileContent,
          vector,
          source: filePath,
          createdAt: new Date().toISOString(),
        };

        // Push the chunk into the result array
        docModels.push(docChunk);
      }
    }

    // Return the generated document chunks
    return docModels;
  } catch (err) {
    console.error('Error processing files:', err);
    throw err;  // Propagate error if something goes wrong
  }
}

/**
 * Gen action.
 */
async function main() {
  const db = await connect(vectorDBPath);

  let table: Table;
  try {
    table = await db.openTable("rules");
    log("Open rules table.");
  } catch {
    warn("Table 'rules' not found, creating and inserting docs...");

    const genDcos = await structDocGeneration();

    table = await db.createTable("rules", genDcos);
    log("Table 'rules' created with example docs.");
  }

  const query = "What should we do before first build?";

  // const queryEmbedding = await embed(query);
  const queryEmbedding = await embedFromGithubCopilotApi(query);

  const searchResult = await table.search(queryEmbedding).execute();

  log(`query: ${query}`);
  log("Top match:");

  for (const row of searchResult) {
    log(`Doc: ${row["title"]}-${row["rule"]}-${row["source"]}`)
    log(`distance: ${row["_distance"]}`)
    log("---");
  }
}

main().catch((err) => {
  console.error("❌ Fatal error in main:", err);
});
