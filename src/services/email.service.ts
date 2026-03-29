import sgMail from "@sendgrid/mail";
import logger from "@/lib/logger";
import nodemailer from 'nodemailer';
import { throwException } from "@/lib/exceptions";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

interface SendEmailPayload {
    to: string;
    subject: string;
    html: string;
}

// export async function sendEmail({ to, subject, html }: SendEmailPayload) {
//     try {
//         // Validation
//         if (!to || !subject || !html) {
//             throwException("Missing email fields", 400);
//         }
//
//         const msg = {
//             to,
//             from: process.env.EMAIL_FROM || "",
//             subject,
//             html,
//         };
//
//         await sgMail.send(msg);
//
//         return [];
//
//     } catch (error: any) {
//         logger.error("SENDGRID ERROR:", error);
//
//         throwException(
//             error?.response?.body || error.message || "Failed to send email",
//             500
//         );
//     }
// }

export async function sendEmail({ to, subject, html }: SendEmailPayload) {
    try {
        // 1. Validation
        if (!to || !subject || !html) {
            throw new Error("Missing email fields (to, subject, or html)");
        }

        // 2. Create the Gmail Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASS, // Your 16-char code
            },
        });

        // 3. Define the Message
        const msg = {
            from: `GroupFour Library <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        };

        // 4. Send
        const info = await transporter.sendMail(msg);
        console.log("Email sent successfully:", info.messageId);

        return info;

    } catch (error: any) {
        console.error("GMAIL SMTP ERROR:", error);
        // If you have a custom throwException helper, use it here:
        throw new Error(error.message || "Failed to send email via Gmail");
    }
}