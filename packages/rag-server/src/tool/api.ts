import { AzureKeyCredential } from "@azure/core-auth";
import ModelClient, { isUnexpected, type GetEmbeddings200Response, type GetEmbeddingsDefaultResponse } from "@azure-rest/ai-inference";
import * as dotenv from 'dotenv';

/***
 * Chunk document model.
 */
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
const githubEmbedApiEndpoint: string = process.env["GITHUB_EMBED_API"] ?? "";
const gitubPat: string = process.env["GITHUB_TOKEN"] ?? "";
const githubEmbedModel: string = process.env["GITHUB_EMBED_MODEL"] ?? "";

/**
 * Github Copilot embedding model.
 * @param text 
 * @returns 
 */
export async function embedFromGithubCopilotApi(text: string): Promise<number[]> {
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