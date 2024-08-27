import { emailVerificationCode } from "@prisma/client";
import { Request, Response } from "express";
import { lucia } from "../config/luciaAuth.js";
import { prisma } from "../config/prismaClient.js";
import { generateEmailVerificationCode } from "../utils/email/generateVerificationCode.js";
import { sendVerificationCode } from "../utils/email/sendVerificationCode.js";
import { verifyVerificationCode } from "../utils/email/verifyVerificationCode.js";

export const emailVerification = async (req: Request, res: Response) => {
	try {
		// Extract and validate the verification code from the request body
		const code: string = req.body.pin;
		if (!code) {
			return res.status(400).json({ error: "Code is required" });
		}

		// Find the verification code in the database
		const user: emailVerificationCode | null = await prisma.emailVerificationCode.findFirst({
			where: {
				code: code,
			},
		});

		// Check if the code is valid
		const validCode = await verifyVerificationCode(user, code);

		if (!validCode) {
			return res.status(400).json({ error: "The verification code you entered is incorrect" });
		}

		// Update user's email verification status
		console.log("updating email verification status");
		try {
			await prisma.user.update({
				where: {
					id: user?.user_id,
				},
				data: {
					emailVerified: true,
				},
			});
		} catch (error) {
			console.log(error);
		}

		// Create a new session and set the session cookie
		const session = await lucia.createSession(user?.user_id!, {});
		res.setHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());

		// Respond with success
		return res.status(200).json({ message: "Email verified successfully" });
	} catch (error) {
		console.error("Error during email verification:", error);
		// Handle unexpected errors
		return res.status(500).json({ error: "An unexpected error occurred. Please try again." });
	}
};

export const resendVerification = async (req: Request, res: Response) => {
	const { user } = res.locals;

	// Find the user's email verification code

	const existingUser = await prisma.user.findFirst({
		where: {
			id: user?.id,
		},
	});

	if (!existingUser) {
		return res.status(404).json({ error: "User not found" });
	}

	const verificationCode = await generateEmailVerificationCode(existingUser.id, existingUser.email!);

	const sentVerificationCode = await sendVerificationCode(existingUser.email!, verificationCode);

	// Respond with success
	if (sentVerificationCode) {
		return res.status(201).json({ message: "Verification code sent successfully" });
	} else {
		return res.status(500).json({ error: "An unexpected error occurred. Please try again." });
	}
};
