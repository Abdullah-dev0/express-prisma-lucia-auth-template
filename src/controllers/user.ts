// just for testing puposes feel free to delete this file

import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prismaClient.js";

export const add = async (req: Request, res: Response) => {
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
	// Check if user is logged in for security reasons you will do in frontend anyway
	if (!res.locals.session) {
		return res.status(401).json({ error: "You must be logged in" }).end();
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
