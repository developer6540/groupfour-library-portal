import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";
import {registerUser} from "@/services/auth.service";
import {NextRequest, NextResponse} from "next/server";
import {pushNotification} from "@/services/notification.service";
import {setSessionServer} from "@/lib/session-server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const updatedUser = await registerUser(body);
        console.log(updatedUser);
        await pushNotification({
            user_code: body.U_CODE,
            title: "Registration",
            message: "Account created successfully",
        })
        await setSessionServer("user-info", {
            U_CODE: body.U_CODE
        });
        return NextResponse.json(successResponse(updatedUser, "Account registered successfully", 201));
    } catch (error: any) {
        Logger.error("API Error (registerUser): ", error);
        return NextResponse.json(errorResponse(error.message, error.status || 500), {
            status: error.status || 500,
        });
    }
}