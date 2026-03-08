import { NextRequest, NextResponse } from "next/server";
import { getChat } from "@/services/chatbot.service";
import Logger from "@/lib/logger";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        // Logic handled in service
        const chatReply = await getChat(message);

        return NextResponse.json(
            successResponse({ reply: chatReply }, "Chat processed successfully")
        );
    } catch (error: any) {
        Logger.error("Chatbot Error:", error);
        const statusCode = error.status || 500;
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", statusCode),
            { status: statusCode }
        );
    }
}