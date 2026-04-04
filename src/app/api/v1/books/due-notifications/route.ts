import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import { getDueNotifications } from "@/services/book.service";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const memberCode = searchParams.get("member")?.trim() || "";

    try {
        if (!memberCode) {
            return NextResponse.json(successResponse([], "No member code provided"));
        }
        const data = await getDueNotifications(memberCode);
        return NextResponse.json(successResponse(data, "Due notifications fetched"));
    } catch (error: any) {
        Logger.error("API Error (getDueNotifications): ", error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", error.status || 500),
            { status: error.status || 500 }
        );
    }
}
