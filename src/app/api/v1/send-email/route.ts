import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { to, subject, html } = await req.json();

        console.error(process.env.GMAIL_USER, process.env.GMAIL_APP_PASS);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            html,
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, error: (error as Error).message }), { status: 500 });
    }
}