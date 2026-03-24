
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/services/email.service";
import { successResponse, errorResponse } from "@/lib/response";
import Logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { to, subject, html } = body;

        if (!to || !subject || !html) {
            return NextResponse.json(
                errorResponse("Missing required fields", 400),
                { status: 400 }
            );
        }

        const result = await sendEmail({ to, subject, html });

        return NextResponse.json(
            successResponse(result, "Email sent successfully")
        );

    } catch (error: any) {
        Logger.error("API Error (sendEmail): ", error);

        return NextResponse.json(
            errorResponse(error.message, error.status || 500),
            { status: error.status || 500 }
        );
    }
}