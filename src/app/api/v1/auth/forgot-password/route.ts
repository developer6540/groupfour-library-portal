import {NextRequest, NextResponse} from "next/server";
import {forgotPassword} from "@/services/auth.service";
import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const updatedUser = await forgotPassword(body);
        return NextResponse.json(successResponse(updatedUser, "Temporary password sent to your email. Please sign in and change it immediately.", 201));
    } catch (error: any) {
        Logger.error("API Error (forgotPassword): ", error);
        return NextResponse.json(errorResponse(error.message, error.status || 500), {
            status: error.status || 500,
        });
    }
}