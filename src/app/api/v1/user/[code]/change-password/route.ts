import { successResponse, errorResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import {changePassword} from "@/services/user.service";
import {NextRequest, NextResponse} from "next/server";

export async function PUT(req: NextRequest, context: { params: Promise<{ code: string }> }) {
    const { code } = await context.params;
    try {
        const body = await req.json();
        const updatedUser = await changePassword(code, body);
        return NextResponse.json(successResponse(updatedUser, "Password successfully changed"));
    } catch (error: any) {
        Logger.error("API Error (changePassword): ", error);
        return NextResponse.json(errorResponse(error.message, error.status || 500), {
            status: error.status || 500,
        });
    }
}