import sgMail from "@sendgrid/mail";
import logger from "@/lib/logger";
import { throwException } from "@/lib/exceptions";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

interface SendEmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailPayload) {
    try {
        // Validation
        if (!to || !subject || !html) {
            throwException("Missing email fields", 400);
        }

        const msg = {
            to,
            from: process.env.EMAIL_FROM || "",
            subject,
            html,
        };

        await sgMail.send(msg);

        return {
            success: true,
            message: "Email sent successfully",
        };

    } catch (error: any) {
        logger.error("SENDGRID ERROR:", error);

        throwException(
            error?.response?.body || error.message || "Failed to send email",
            500
        );
    }
}