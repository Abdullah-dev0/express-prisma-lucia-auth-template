import { NextFunction, Request, Response } from "express";
import type { Session, User } from "lucia";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "../config/luciaAuth.js";

// Middleware to verify the origin of the request and prevent CSRF attacks eg. POST requests from other domains.

export function originVerificationMiddleware(req: Request, res: Response, next: NextFunction) {
	if (req.method === "GET") {
		return next();
	}
	const originHeader = req.headers.origin ?? null;
	const hostHeader = req.headers.host ?? null;
	if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
		return res.status(403).end();
	}
	next();
}

// Middleware to manage sessions and cookies

export async function sessionManagementMiddleware(req: Request, res: Response, next: NextFunction) {
	const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");

	if (!sessionId) {
		res.locals.user = null;
		res.locals.session = null;
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);

	if (session && session.fresh) {
		res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
	}

	if (!session) {
		res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
	}

	res.locals.user = user;
	res.locals.session = session;

	if (!res.locals.session) {
		return res.status(401).json({ error: "You must be logged in" }).end();
	}

	next();
}

// Augment the Express namespace to include custom properties

declare global {
	namespace Express {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}
