import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";
import {registerUser} from "@/services/auth.service";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const updatedUser = await registerUser(body);
        return NextResponse.json(successResponse(updatedUser, "Account registered successfully"));
    } catch (error: any) {
        Logger.error("API Error (registerUser): ", error);
        return NextResponse.json(errorResponse(error.message, error.status || 500), {
            status: error.status || 500,
        });
    }
}