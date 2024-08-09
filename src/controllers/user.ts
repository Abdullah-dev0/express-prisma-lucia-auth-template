// just for testing puposes feel free to delete this file

import { Request, Response } from "express";
import { prisma } from "../config/prismaClient.js";
import { emailVerificationCode, User } from "@prisma/client";
import { lucia } from "../config/luciaAuth.js";
import { verifyVerificationCode } from "../utils/email/verifyVerificationCode.js";

export const add = async (req: Request, res: Response) => {
	if (!res.locals.session) {
		return res
			.status(401)
			.json({
				error: "You must be logged in to create a post",
			})
			.end();
	}
	const post: string = req.body.message;
	if (!post) {
		return res.status(400).json({ error: "Message is required" });
	}

	await prisma.post.create({
		data: {
			userId: res.locals!.user!.id,
			message: post,
		},
	});

	return res.status(201).json({ message: "Post created successfully" });
};

export const getCurrentUser = async (req: Request, res: Response) => {
	// Check if user is logged in for secuery reasons you will do in frontend anyway
	if (!res.locals.session) {
		return res.status(200).json({ error: "You must be logged in" }).end();
	}

	const { id } = res.locals.user!;

	const user: User | null = await prisma.user.findUnique({
		where: {
			id: id,
		},
	});

	user!.password = undefined as any;

	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}

	return res.status(200).json({ user });
};

export const emailVerification = async (req: Request, res: Response) => {
	if (res.locals.session || res.locals.user?.emailVerified) {
		return res.redirect("/");
	}

	const code: string = req.body.code;

	if (!req.body.code) {
		return res.status(400).json({ error: "Code is required" });
	}

	const user: emailVerificationCode | null = await prisma.emailVerificationCode.findFirst({
		where: {
			code: code,
		},
	});

	const validCode = await verifyVerificationCode(user, code);

	if (!validCode) {
		return res.status(400).json({ error: "Invalid code or wrong code" });
	}

	await prisma.user.update({
		where: {
			id: user?.user_id,
		},
		data: {
			emailVerified: true,
		},
	});

	const session = await lucia.createSession(user?.user_id!, {});
	res.setHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
	return res.redirect("/");
};
