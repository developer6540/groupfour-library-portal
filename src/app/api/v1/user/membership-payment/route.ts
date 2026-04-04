import { NextRequest, NextResponse } from "next/server";
import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";
import {membershipPayment} from "@/services/user.service";

export async function GET() {
    try {
        const dashboardData = await membershipPayment();
        return NextResponse.json(
            successResponse(dashboardData, "Membership amount retrieved successfully")
        );
    } catch (error: any) {
        const status = error.status || 500;
        Logger.error(`API Error (getUserByCode)`, error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", status),
            { status }
        );
    }
}
