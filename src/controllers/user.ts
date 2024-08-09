<<<<<<< HEAD
// just for testing puposes feel free to delete this file

import { Request, Response } from "express";
import { prisma } from "../config/prismaClient.js";
import { emailVerificationCode, User } from "@prisma/client";
import { lucia } from "../config/luciaAuth.js";
import { verifyVerificationCode } from "../utils/email/verifyVerificationCode.js";
=======
import { hash, verify } from "@node-rs/argon2";
import { Request, Response } from "express";
import { generateIdFromEntropySize } from "lucia";
import { lucia } from "../config/luciaAuth.js";
import { prisma } from "../config/prismaClient.js";
import { SignupData } from "../utils/dataValidation.js";

export const signUp = async (req: Request, res: Response) => {
	const signupData = SignupData.safeParse(req.body);

	if (!signupData.success) {
		return res.status(400).json({ error: signupData.error });
	}

	const passwordHash = await hash(signupData.data.password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	//cheack if username already exists
	try {
		const existingUser = await prisma.user.findFirst({
			where: {
				username: signupData.data.username,
			},
		});

		if (existingUser) {
			return res.status(400).json({ error: "Username already used" });
		}
	} catch (error: any) {
		console.log(error.message);
	}

	const userId = generateIdFromEntropySize(10); // 16 characters long

	try {
		const user = await prisma.user.create({
			data: {
				id: userId,
				username: signupData.data.username,
				password: passwordHash,
			},
		});

		if (user) {
			const session = await lucia.createSession(userId, {});
			return res
				.status(201)
				.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
				.json({
					message: "User created successfully",
					userData: {
						id: user.id,
						username: user.username,
					},
				});
		}

		return res.status(400).json({ error: "Failed to create user" });
	} catch (error: any) {
		console.error(error.message);
	}
};

export const login = async (req: Request, res: Response) => {
	const username: string = req.body.username;

	const password: string = req.body.password;
	console.log("username", username);

	const existingUser = await prisma.user.findFirst({
		where: {
			username: username,
		},
	});

	if (!existingUser) {
		return res.status(400).json({ error: "Incorrect username or password" });
	}

	const validPassword = await verify(existingUser.password, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	if (!validPassword) {
		return res.status(400).json({ error: "Incorrect username or password" });
	}

	const session = await lucia.createSession(existingUser.id, {});
	res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize()).json({
		message: "Logged in successfully",
		userData: {
			id: existingUser.id,
			username: existingUser.username,
		},
	});
};

export const logout = async (req: Request, res: Response) => {
	if (!res.locals.session) {
		return res.status(401).json({ error: "You must be logged in to logout" }).end();
	}


	await lucia.invalidateSession(res.locals.session.id);

	return res.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
};
>>>>>>> 5c57b39619eb191d1007649ccc1b1116164a066e

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
<<<<<<< HEAD
=======
			id: generateIdFromEntropySize(10),
>>>>>>> 5c57b39619eb191d1007649ccc1b1116164a066e
			userId: res.locals!.user!.id,
			message: post,
		},
	});

	return res.status(201).json({ message: "Post created successfully" });
};
<<<<<<< HEAD

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
=======
>>>>>>> 5c57b39619eb191d1007649ccc1b1116164a066e
