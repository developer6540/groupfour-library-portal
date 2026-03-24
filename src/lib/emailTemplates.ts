import {getBaseUrl} from "@/lib/server-utility";

export function forgotPasswordEmailTemplate(params: {
    userName: string;
    tempPassword?: string;
    actionUrl?: string;
}) {
    const { userName, tempPassword, actionUrl} = params;

    return `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Library Notification</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f4f7;
                    margin: 0;
                    padding: 0;
                }
                .container{
                    max-width: 600px;
                    margin: 30px auto;
                    background: #fcfcfc;
                    border-radius: 31px;
                    padding: 30px;
                    border: 10px solid #cccccc42;
                }
                .logo {
                    display: block;
                    margin: 0 auto 20px;
                    max-width: 180px;
                }
                h1 {
                    color: #333333;
                    font-size: 20px;
                    text-align: center;
                }
                p {
                    color: #555555;
                    font-size: 16px;
                    line-height: 1.5;
                }
                .temp-password {
                    font-weight: bold;
                    font-size: 20px;
                    color: #655cc8;
                    background-color: #e8e6ffa6;
                    padding: 14px;
                    border-radius: 18px;
                    margin: 10px 0;
                    text-align: center;
                    border: 4px solid #655cc87d;
                }
                .btn {
                    display: inline-block;
                    background-color: #715cc8;
                    color: #ffffff !important;
                    text-decoration: none;
                    padding: 8px 54px;
                    border-radius: 6px;
                    margin-top: 0px;
                    font-weight: bold;
                    font-size: 16px;
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #d3d3d3;
                    margin-top: 30px;
                    background: #000;
                    padding: 10px;
                    border-radius: 20px;
                }
            </style>
        </head>
        <body>
        <div class="container">
        
            <h2>Hello ${userName},</h2>
        
            <p>You requested a password reset. Please use the temporary password below. </p>
        
            <div class="temp-password">${tempPassword}</div>
        
            <p style="text-align:center;">
                <a href="${actionUrl}" class="btn">Sign In Now</a>
            </p>
        
            <p>Thank you for using GroupFour Library!</p>
        
            <div class="footer">
                &copy; ${new Date().getFullYear()} GroupFour Library. All rights reserved.
            </div>
        </div>
        </body>
        </html>
    `;
}