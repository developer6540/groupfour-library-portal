import { NextRequest, NextResponse } from "next/server";
import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";
import {getDashboardCounts} from "@/services/dashboard.service";

export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
    const { code } = await context.params;
    try {
        const dashboardData = await getDashboardCounts(code);
        return NextResponse.json(
            successResponse(dashboardData, "Dashboard statistics retrieved successfully")
        );
    } catch (error: any) {
        const status = error.status || 500;
        Logger.error(`API Error (getDashboardCounts) for code ${code}: `, error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", status),
            { status }
        );
    }
}
