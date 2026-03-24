import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { to, subject, html } = await req.json();

        // Validation
        if (!to || !subject || !html) {
            return NextResponse.json(
                { success: false, error: "Missing fields" },
                { status: 400 }
            );
        }

        const msg = {
            to,
            from: process.env.EMAIL_FROM || '',
            subject,
            html,
        };

        await sgMail.send(msg);

        return NextResponse.json({
            success: true,
            message: "Email sent successfully",
        });

    } catch (error: any) {
        console.error("SENDGRID ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error: error?.response?.body || error.message,
            },
            { status: 500 }
        );
    }
}