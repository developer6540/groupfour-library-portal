export function forgotPasswordEmailTemplate(params: {
    userName: string;
    tempPassword?: string;
    actionUrl?: string;
}) {
    const { userName, tempPassword, actionUrl } = params;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #f0f2f5;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #eeedff;
                padding-bottom: 40px;
            }
            .header-strip {
                background-color: #6856cb;
                height: 150px;
                text-align: center;
            }
            .container {
                max-width: 500px;
                margin: -80px auto 0;
                background: #ffffff;
                padding: 40px;
                text-align: left;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            }
            h1 {
                color: #333333;
                font-size: 32px;
                margin-top: 0;
                text-align: center;
                font-weight: 400;
            }
            p {
                color: #717171;
                font-size: 15px;
                line-height: 1.6;
                margin: 20px 0;
            }
            .btn-container {
                text-align: center;
                padding: 20px 0;
            }
            .btn {
                background-color: #6856cb;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 28px;
                border-radius: 4px;
                display: inline-block;
                font-size: 16px;
                font-weight: 500;
            }
            .temp-pass-box {
                background-color: #eeedff;
                border: 1px dashed #6856cb;
                padding: 15px;
                text-align: center;
                font-size: 18px;
                font-family: monospace;
                letter-spacing: 2px;
                color: #333;
                margin: 10px 0;
            }
            .signature {
                margin-top: 30px;
                color: #717171;
                font-size:14px;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #999999;
                margin-top: 30px;
                line-height: 1.8;
            }
            .footer a {
                color: #333;
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header-strip">
                <div style="padding-top: 20px;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                </div>
            </div>
            
            <div class="container">
                <h1>Reset Password</h1>
                
                <p>Hello ${userName},</p>
                <p>We received a request to reset your account password. Use the temporary password below to log back in. For security, please change it immediately after signing in.</p>
                
                <div class="temp-pass-box">
                    <strong>${tempPassword}</strong>
                </div>

                <div class="btn-container">
                    <a href="${actionUrl}" class="btn">Confirm & Sign In</a>
                </div>
                
                <p>If you have any questions, just reply to this email—we're always happy to help out.</p>
                
                <div class="signature">
                    The GroupFour Library Team
                </div>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} GroupFour Library. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}


