import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import { recordFinePayment } from "@/services/book.service";

const CORS = {
    "Access-Control-Allow-Origin":  "http://localhost:3001",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { memberCode, amount, payMode, refNo } = body;

        if (!memberCode || !amount || amount <= 0) {
            return NextResponse.json(
                errorResponse("memberCode and a positive amount are required", 400),
                { status: 400, headers: CORS }
            );
        }

        const result = await recordFinePayment(
            memberCode,
            parseFloat(amount),
            payMode || "CARD",
            refNo || null
        );

        return NextResponse.json(
            successResponse(result, `Payment of LKR ${amount} recorded. ${result.finesSettled} fine(s) fully settled.`),
            { headers: CORS }
        );
    } catch (error: any) {
        Logger.error("API Error (recordFinePayment): ", error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", error.status || 500),
            { status: error.status || 500, headers: CORS }
        );
    }
}
