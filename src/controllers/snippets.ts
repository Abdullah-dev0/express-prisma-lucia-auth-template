import { Snippet, User } from "@prisma/client";
import { prisma } from "../config/prismaClient.js";
import { Request, Response } from "express";

export const addSnippet = async (req: Request, res: Response) => {
	const { title, description, code, language } = req.body;
	const user = res.locals.user as User;
	try {
		const snippet: Snippet = await prisma.snippet.create({
			data: {
				userId: user.id,
				title,
				description,
				code,
				language,
			},
		});

		if (!snippet) {
			return res.status(400).json({ error: "There was An error while adding a snippet" }).end();
		}

		return res
			.status(201)
			.json({
				message: "Snippet added successfully",
				data: snippet,
			})
			.end();
	} catch (error) {
		console.log("Error adding snippet:", error);
	}
};

export const getAllSnippets = async (req: Request, res: Response) => {
	const { user } = res.locals;
	try {
		const snippets = await prisma.snippet.findMany({
			where: {
				userId: user?.id,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		if (snippets.length === 0) {
			return res.status(404).json({ error: "No snippets found" });
		}

		return res.status(200).json(snippets).end();
	} catch (error) {
		console.log("Error getting snippets:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteSnippetById = async (req: Request, res: Response) => {
	const { id } = req.body;

	try {
		const snippet = await prisma.snippet.delete({
			where: {
				id: id,
			},
		});

		if (!snippet) {
			return res.status(404).json({ error: "Snippet not found" });
		}

		return res
			.status(200)
			.json({
				message: "Snippet deleted successfully",
			})
			.end();
	} catch (error) {
		console.log("Error deleting snippet:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const updateSnippetById = async (req: Request, res: Response) => {
	const { id, title, description, code, language } = req.body;

	try {
		const snippet = await prisma.snippet.update({
			where: {
				id: id,
			},
			data: {
				title,
				description,
				code,
				language,
			},
		});

		if (!snippet) {
			return res.status(404).json({ error: "Snippet not found" });
		}

		return res
			.status(200)
			.json({
				message: "Snippet updated successfully",
			})
			.end();
	} catch (error) {
		console.log("Error updating snippet:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const getSnippetById = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const snippet = await prisma.snippet.findUnique({
			where: {
				id: id,
			},
		});

		if (!snippet) {
			return res.status(404).json({ error: "Snippet not found" });
		}

		return res
			.status(200)
			.json({
				data: snippet,
			})
			.end();
	} catch (error) {
		console.log("Error getting snippet:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};
