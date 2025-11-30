// src/server.ts
import { connect, type Table } from "vectordb";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from "zod";
import { embedFromGithubCopilotApi } from './tool/api.js';
import logger from "./tool/logger.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const vectorDBPath = "C:/src/myGemini-cli/gemini-cli/packages/rag-server/vectordb";

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
    inputSchema: { topic: z.string() },
    outputSchema: { result: z.string() }
  },
  async ({ topic }) => {
    const result = [];
    try {
      const vectorTable = await getVectorTable();
      if (vectorTable) {
        result.push(...await queryKnownIssues(topic, vectorTable));
      } else {
        logger.warn("No vector table found.");
      }
    } catch (error: any) {
      logger.error("Error during query: " + error.message);
    }

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
    const vectorNumber = await embedFromGithubCopilotApi(topic);

    // Ensure vectorNumber is valid
    if (!vectorNumber || vectorNumber.length === 0) {
      throw new Error("Received an empty vector array.");
    }

    const searchResult = await table.search(vectorNumber).execute();

    for (const record of searchResult) {
      const documentChunk = {
        id: record["id"] as string,
        rule: record["rule"] as string,
        title: record["title"] as string,
        source: record["source"] as string,
        createdAt: record["createdAt"] as string
      };
      result.push(documentChunk);
    }
  } catch (err: any) {
    logger.error("Error querying known issues: " + err.message);
  }

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