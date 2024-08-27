import { transporter } from "../../config/emailConfig.js";

export async function sendVerificationCode(to: string, code: string) {
	console.log("Sending code: ", code);
	const info = await transporter.sendMail({
		from: process.env.EMAIL_HOST,
		to: to,
		subject: "Email Verification",
		text: `Your verification code is ${code}`,
		html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
        }
        .code {
            display: inline-block;
            padding: 10px 20px;
            font-size: 24px;
            font-weight: bold;
            border-radius: 4px;
            margin-top: 20px;
        }
        p {
            font-size: 16px;
            line-height: 1.5;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Verification</h1>
        <p>Thank you for registering! Please use the following code to verify your email address:</p>
        <div class="code">${code}</div>
        <p>If you didn't create an account, please ignore this email.</p>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
	});

	console.log("Message sent: %s", info.messageId);
	return true;
}
