import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { to, subject, html } = await req.json();
        console.log(to, subject, html);
        const data = await resend.emails.send({
            from: "onboarding@resend.dev", // change after domain verification
            to,
            subject,
            html,
        });

        return Response.json({ success: true, data });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, error }, { status: 500 });
    }
}