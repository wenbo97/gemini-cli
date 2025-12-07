// src/server.ts
import { connect, type Table } from "vectordb";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from "zod";
import * as dotenv from 'dotenv';
import { embedFromGithubCopilotApi } from './tool/api.js';
import logger from "./tool/logger.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

dotenv.config();

const vectorDBPath = process.env["VECTOR_DB_PATH"] ?? "";

const server = new McpServer(
  {
    title: "Dotnet Upgrade Mcp",
    name: "dotnet-upgrade-mcp",
    version: "1.0.0",
  },
);

/***
 * TO DO - figure out best practice for plan generation.
 */
// Plan tool
// server.registerTool(
//   'generate-plan',
//   {
//     title: 'Generate Execution Plan',
//     description: 'Generate a sequence of steps for the task.',
//     inputSchema: { task: z.string(), context: z.any() },
//     outputSchema: { steps: z.array(z.string()) }
//   },
//   async ({ task, context }) => {
//     const steps = await generateExecutionPlan(task, context);
//     return {
//       content: [{ type: 'text', text: JSON.stringify({ steps }) }],
//       structuredContent: { steps },
//     };
//   }
// );

// known issue and solution query tool
server.registerTool(
  'query-known-issues-and-solutions',
  {
    title: 'Query Known Issues',
    description: 'Query known issues and solutions based on the provided topic.',
    inputSchema: { 
      topic: z.string(),
      enhanced: z.boolean().optional().default(false)
    },
    outputSchema: { result: z.string() }
  },
  async ({ topic, enhanced }) => {
    logger.info(`[query-known-issues-and-solutions] Starting query for topic: "${topic}", enhanced: ${enhanced}`);
    const result: any[] = [];
    
    try {
      const vectorTable = await getVectorTable();
      if (vectorTable) {
        logger.debug("Vector table retrieved successfully");
        const searchResults = await queryKnownIssues(topic, vectorTable);
        
        if (enhanced) {
          logger.debug("Processing results in enhanced mode");
          const fs = await import('fs/promises');
          
          for (const item of searchResults) {
            const sourcePath = (item as any).source;
            const related: string[] = [];
            
            if (sourcePath && typeof sourcePath === 'string') {
              try {
                // Read the actual markdown file content from disk
                const content = await fs.readFile(sourcePath, 'utf-8');
                const relatedMatches = content.matchAll(/\[Rule:([^\]]+)\]/g);
                related.push(...Array.from(relatedMatches).map(m => m[1]));
              } catch (err: any) {
                logger.debug(`Could not read file ${sourcePath}: ${err.message}`);
              }
            }
            
            result.push({
              ...item,
              relatedRules: related,
              hint: related.length > 0 ? 
                `Consider also checking: ${related.join(', ')}` : 
                null
            });
          }
        } else {
          result.push(...searchResults);
        }
      } else {
        logger.warn("Vector table not available, returning empty results");
      }
    } catch (error: any) {
      logger.error("Error during query: " + error.message);
    }

    logger.info(`[query-known-issues-and-solutions] Returning ${result.length} results`);
    const resultContent = JSON.stringify(result);
    return {
      content: [{ type: 'text', text: resultContent }],
      structuredContent: { result: resultContent }
    };
  }
);

/**
 * Register via prompt style
 */
// server.registerPrompt(
//   'query-issues',
//   {
//     title: 'Query Known Issues',
//     description: 'Query known issues and solutions based on the provided topic.',
//     argsSchema: { topic: z.string() }
//   },
//   async ({ topic }) => {
//     let result: DocumentChunk[] = [];
//     try {
//       const vectorTable = await getVectorTable();
//       if (vectorTable) {
//         result = await queryKnownIssues(topic, vectorTable);
//       } else {
//         result = [];
//         logger.warn("No vector table found.");
//       }
//     } catch (error: any) {
//       logger.error("Error during query: " + error.message);
//       result = [];
//     }

//     // content return back to gemini-cli
//     return {
//       messages: [
//         {
//           role: 'user',
//           content: {
//             type: 'text',
//             text: `Results for known issues related to topic: ${topic}\n\n${JSON.stringify(result)}`
//           }
//         }
//       ]
//     };
//   }
// );


// Get vector table
async function getVectorTable(): Promise<Table | undefined> {
  try {
    logger.debug(`Connecting to vector DB at path: ${vectorDBPath}`);
    const db = await connect(vectorDBPath);
    const table = await db.openTable("rules");
    return table;
  } catch (err) {
    logger.error("Cannot open table: rules");
    logger.error(JSON.stringify(err));
    return undefined;
  }
}

// Query known issues based on topic
async function queryKnownIssues(topic: string, table: Table): Promise<object[]> {
  const result = [];

  try {
    logger.debug(`Generating embedding for topic: "${topic}"`);
    const vectorNumber = await embedFromGithubCopilotApi(topic);
    logger.debug(`Embedding generated with dimension: ${vectorNumber?.length || 0}`);

    // Ensure vectorNumber is valid
    if (!vectorNumber || vectorNumber.length === 0) {
      throw new Error("Received an empty vector array.");
    }

    logger.debug("Executing vector similarity search");
    const searchResult = await table.search(vectorNumber).execute();
    logger.debug(`Vector search returned ${searchResult.length} results`);

    for (const record of searchResult) {
      let score = record["_distance"] as number;

      score = parseFloat(score.toFixed(2));;

      const documentChunk = {
        id: record["id"] as string,
        rule: record["rule"] as string,
        title: record["title"] as string,
        source: record["source"] as string,
        score: score,
        createdAt: record["createdAt"] as string
      };
      result.push(documentChunk);
    }
  } catch (err: any) {
    logger.error("Error querying known issues: " + err.message);
  }

  result.sort((r1, r2) => r2.score - r1.score);
  return result;
}

/**
 * 
 * @param task 
 * @param context 
 * @returns 
 */
// async function generateExecutionPlan(task: string, context: any): Promise<string[]> {
//   if (task === "dotnet-upgrade") {
//     return [
//       "Step 1: Update .csproj for multi-targeting.",
//       "Step 2: Update references to match net472 and net8.0.",
//       "Step 3: Perform a quick build for validation.",
//       "Step 4: Run unit tests to ensure compatibility.",
//     ];
//   }
//   return ["No plan available for the specified task"];
// }

logger.info("Starting mcp");
const transport = new StdioServerTransport();
await server.connect(transport);
