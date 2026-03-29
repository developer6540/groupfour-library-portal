import sgMail from "@sendgrid/mail";
import logger from "@/lib/logger";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export interface SendEmailPayload {
    to: string;
    subject: string;
    html: string;
}

/**
 * Send via SendGrid
 */
async function sendWithSendGrid({ to, subject, html }: SendEmailPayload) {
    if (!to || !subject || !html) {
        throw new Error("Missing email fields for SendGrid");
    }

    const msg = {
        to,
        from: process.env.EMAIL_FROM || "no-reply@example.com",
        subject,
        html,
    };

    await sgMail.send(msg);
    return { success: true, source: "sendgrid" };
}

/**
 * Send via GoogieHost PHP API
 */
async function sendWithGoogieHost({ to, subject, html }: SendEmailPayload) {
    if (!to || !subject || !html) {
        throw new Error("Missing email fields for GoogieHost");
    }

    const response = await fetch(process.env.GOOGIEHOST_MAIL_API_URL || "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message: html }),
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "GoogieHost API failed");
    }

    return { success: true, source: "googiehost" };
}

/**
 * Main sendEmail function
 */
export async function sendEmail(payload: SendEmailPayload) {
    try {
        const res = await sendWithGoogieHost(payload);

        if (res && res.success === true) {
            console.log("Mail sent by GoogieHost");
            return res;
        }

        throw new Error("GoogieHost returned unsuccessful response");

    } catch (googieError: any) {
        logger.warn("GoogieHost failed:", googieError);

        try {
            const res = await sendWithSendGrid(payload);

            if (res && res.success === true) {
                console.log("Mail sent by SendGrid");
                return res;
            }

            throw new Error("SendGrid returned unsuccessful response");

        } catch (sendGridError: any) {
            logger.error("SendGrid failed:", sendGridError);

            throw new Error("Both email providers failed");
        }
    }
}