import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import { checkUserEligibility } from "@/services/user.service";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ code: string }> }
) {
    const { code } = await context.params;
    try {
        const eligibilityData = await checkUserEligibility(code);
        return NextResponse.json(
            successResponse(
                eligibilityData,
                "User eligibility retrieved successfully"
            )
        );
    } catch (error: any) {
        const status = error.status || 500;
        const message = error.message || "Internal Server Error";
        Logger.error(`API Error (checkUserEligibility) for code ${code}: `, error);
        return NextResponse.json(
            errorResponse(message, status),
            { status }
        );
    }
}