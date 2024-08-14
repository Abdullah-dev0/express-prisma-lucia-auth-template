import { Request, Response, NextFunction } from "express";

export const verifiedEmail = async (req: Request, res: Response, next: NextFunction) => {
	if (!res.locals.session) {
		return res.status(401).json({ error: "You must be logged in" });
	}
	console.log(res.locals.user);

	if (!res.locals.user?.emailVerified) {
		return res.status(403).json({ error: "Email not verified" });
	}

	next();
};
