import { successResponse, errorResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import {updateUserByCode} from "@/services/user.service";
import {NextRequest, NextResponse} from "next/server";

export async function PUT(req: NextRequest, context: { params: Promise<{ code: string }> }) {
    const { code } = await context.params;
    try {
        console.log(code);
        const body = await req.json();
        const updatedUser = await updateUserByCode(code, body);
        return NextResponse.json(successResponse(updatedUser, "User updated successfully"));
    } catch (error: any) {
        Logger.error("API Error  : ", error);
        return NextResponse.json(errorResponse(error.message, error.status || 500), {
            status: error.status || 500,
        });
    }
}