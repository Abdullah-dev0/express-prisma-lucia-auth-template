import { transporter } from "../../config/emailConfig.js";

export async function sendVerificationCode(to: string, code: string, html: string) {
	console.log("Sending code: ", code);
	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: process.env.EMAIL_HOST, // sender address
		to: to, // list of receivers
		subject: "Hello ✔", // Subject line
		text: "email verification", // plain text body
		html: code.toString(), // html body
	});

	console.log("Message sent: %s", info.messageId);
}
