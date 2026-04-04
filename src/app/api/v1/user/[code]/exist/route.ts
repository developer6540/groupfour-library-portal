import { NextRequest, NextResponse } from "next/server";
import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";
import {checkUserCodeExist} from "@/services/user.service";

export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
    const { code } = await context.params;
    try {
        const exists = await checkUserCodeExist(code);
        return NextResponse.json(
            successResponse(exists, "User code validation completed")
        );
    } catch (error: any) {
        const status = error.status || 500;
        Logger.error(`API Error (checkUserCodeExist) for code ${code}: `, error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", status),
            { status }
        );
    }
}
