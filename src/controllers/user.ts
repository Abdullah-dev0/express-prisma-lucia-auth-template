// just for testing puposes feel free to delete this file

import { User } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../config/prismaClient.js";

export const getCurrentUser = async (req: Request, res: Response) => {
	// Check if user is logged in for secuery reasons you will do in frontend anyway
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
