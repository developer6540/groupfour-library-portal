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
</head>
<body style="margin: 0; padding: 0; background-color: #eeedff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

    <div style="width: 100%; background-color: #eeedff; padding-bottom: 50px;">
        
        <br /><br />
        
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            
            <div style="padding: 40px; text-align: left;">
                
                <div style="background-color: #6856cb; height: 100px; width: 100%; text-align: center; box-sizing: border-box;">
                    <div style="display: inline-block; color: #ffffff; font-size: 60px; font-weight: bold;">
                        ✉
                    </div>
                </div>
                <br />
                <h1 style="color: #333333; font-size: 28px; font-weight: 500; margin: 0 0 20px 0; text-align: center;">
                    Reset Password
                </h1>
                
                <p style="color: #717171; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hello ${userName},
                </p>
                
                <p style="color: #717171; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    We received a request to reset your account password. Use the temporary password below to log back in. For security, please change it immediately after signing in.
                </p>
                
                <div style="background-color: #f3f2ff; border: 2px dashed #6856cb; padding: 20px; text-align: center; margin: 25px 0;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: bold; letter-spacing: 3px; color: #333333;">
                        ${tempPassword}
                    </span>
                </div>

                <div style="text-align: center; padding: 20px 0 30px 0;">
                    <a href="${actionUrl}" style="background-color: #6856cb; color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: 600;">
                        Confirm & Sign In
                    </a>
                </div>
                
                <p style="color: #717171; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                    If you have any questions, just reply to this email—we're always happy to help out.
                </p>
                
                <div style="border-top: 1px solid #eeeeee; padding-top: 20px; color: #717171; font-size: 14px;">
                    <strong>The GroupFour Library Team</strong>
                </div>

            </div>
        </div>

        <div style="text-align: center; padding-top: 30px; color: #999999; font-size: 12px;">
            &copy; ${new Date().getFullYear()} GroupFour Library. All rights reserved.
        </div>

    </div>

</body>
</html>
    `;
}


