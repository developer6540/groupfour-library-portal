import { throwException } from "@/lib/exceptions";
import Groq from "groq-sdk";
import { getDbConnection } from "@/lib/db";
import sql from "mssql";

const openai = new Groq({ apiKey: process.env.OPENAI_API_KEY });

export async function getChat(message: string) {
    if (!message) {
        return throwException("No message provided.", 400);
    }

    const tools: any[] = [{
        type: "function",
        function: {
            name: "query_library_db",
            description: "Search for books or authors in the library MSSQL database.",
            parameters: {
                type: "object",
                properties: {
                    searchTerm: {
                        type: "string",
                        description: "The name of the book or author to search for."
                    },
                },
                required: ["searchTerm"],
            },
        },
    }];

    const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: "You are a library assistant for LibraryMS. Use query_library_db to check the collection. If B_ACTIVE is 0, the book is unavailable."
            },
            { role: "user", content: message }
        ],
        tools,
    });

    const assistantMessage = response.choices[0].message;

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolCallsResults = [];

        for (const toolCall of assistantMessage.tool_calls) {
            if (toolCall.type === 'function') {
                const args = JSON.parse(toolCall.function.arguments);
                const searchTerm = args.searchTerm;

                const pool = await getDbConnection();
                const result = await pool.request()
                    .input("search", sql.VarChar, `%${searchTerm}%`)
                    .query(`
                        SELECT TOP 5
                            [B_TITLE], [B_AUTHOR], [B_PUBLISHER], [B_CATEGORY], [B_ACTIVE]
                        FROM [LibraryMS].[dbo].[M_TBLBOOKS]
                        WHERE [B_TITLE] LIKE @search OR [B_AUTHOR] LIKE @search OR [B_CATEGORY] LIKE @search
                    `);

                toolCallsResults.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result.recordset),
                });
            }
        }

        const finalResponse = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "Analyze the database results and provide a helpful, natural answer." },
                { role: "user", content: message },
                assistantMessage,
                ...toolCallsResults as any[],
            ],
        });
        return finalResponse.choices[0].message.content;
    }

    return assistantMessage.content;
}