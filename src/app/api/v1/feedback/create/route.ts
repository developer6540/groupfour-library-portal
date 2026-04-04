import { NextRequest, NextResponse } from "next/server";
import { createFeedback, FeedbackPayload } from "@/services/feedback.service";
import { successResponse, errorResponse } from "@/lib/response";
import Logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const body: FeedbackPayload = await req.json();
        const result = await createFeedback(body);
        return NextResponse.json(successResponse(result, "Feedback submitted successfully", 201));
    } catch (error: any) {
        Logger.error("API Error (createFeedback):", error);
        return NextResponse.json(errorResponse(error.message, error.status || 500), {
            status: error.status || 500,
        });
    }
}