import { NextRequest, NextResponse } from "next/server";
import {getUserByCode} from "@/services/user.service";
import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";

export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
    const { code } = await context.params;
    try {
        console.log(code);
        const user = await getUserByCode(code);
        return NextResponse.json(successResponse(user, "User retrieved successfully"));
    } catch (error: any) {
        Logger.error("API Error  : ", error);
        return NextResponse.json(errorResponse(error.message, error.status || 500), {
            status: error.status || 500,
        });
    }
}
