import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import { getMemberFineSummary } from "@/services/book.service";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const memberCode = searchParams.get("member")?.trim() || "";

    try {
        if (!memberCode) {
            return NextResponse.json(
                successResponse({ totalFine: 0, totalPaid: 0, totalBalance: 0 }, "No member code provided")
            );
        }

        const data = await getMemberFineSummary(memberCode);

        return NextResponse.json(
            successResponse(data, "Fine summary retrieved successfully")
        );
    } catch (error: any) {
        Logger.error("API Error (getMemberFineSummary): ", error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", error.status || 500),
            { status: error.status || 500 }
        );
    }
}
