// All the funcitons related to authentication are here login, signup, logout, github login, github callback, google login, google callback

import { hash, verify } from "@node-rs/argon2";
import { generateCodeVerifier, generateState, OAuth2RequestError } from "arctic";
import { Request, Response } from "express";
import { parseCookies, serializeCookie } from "oslo/cookie";
import { github, googleAuth } from "../config/oAuthInitialize.js";
import { lucia } from "../config/luciaAuth.js";
import { prisma } from "../config/prismaClient.js";
import { LoginData, SignupData } from "../utils/dataValidation.js";
import { User } from "@prisma/client";
import { sendVerificationCode } from "../utils/email/sendVerificationCode.js";
import { generateEmailVerificationCode } from "../utils/email/generateVerificationCode.js";

export const signUp = async (req: Request, res: Response) => {
	if (res.locals.session) {
		return res.status(400).json({ error: "You are already logged in" });
	}

	//form validation using zod

	const signupData = SignupData.safeParse(req.body);

	if (!signupData.success) {
		return res.status(400).json({ error: signupData.error });
	}

	//password hashing

	const passwordHash = await hash(signupData.data.password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	//cheack if username already exists
	try {
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [
					{
						username: signupData.data.username,
					},
					{
						email: signupData.data.email,
					},
				],
			},
		});

		if (existingUser) {
			return res.status(409).json({ error: "Username or email already Taken" });
		}
	} catch (error: any) {
		console.log(error.message);
	}

	try {
		const user = await prisma.user.create({
			data: {
				username: signupData.data.username,
				email: signupData.data.email,
				password: passwordHash,
				emailVerified: false,
			},
		});

		// if the user is created successfully, create a session and send the session cookie

		user.password = undefined as any;

		const verificationCode = await generateEmailVerificationCode(user.id, user.email!);

		await sendVerificationCode(user.email!, verificationCode);

		if (user) {
			const session = await lucia.createSession(user.id, {});
			return res
				.status(201)
				.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
				.redirect("/dashboard");
		}

		return res.status(400).json({ error: "Failed to create user" });
	} catch (error: any) {
		console.error(error);
	}
};

export const login = async (req: Request, res: Response) => {
	if (res.locals.session) {
		return res.status(400).json({ error: "You are already logged in" });
	}

	const loginData = LoginData.safeParse(req.body);

	if (!loginData.success) {
		return res.status(400).json({ error: loginData.error });
	}

	const existingUser: User | null = await prisma.user.findFirst({
		where: {
			email: loginData.data.email,
		},
	});

	if (!existingUser) {
		return res.status(400).json({ error: "Incorrect username or password" });
	}

	const validPassword = await verify(existingUser.password!, loginData.data.password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});

	if (!validPassword) {
		return res.status(400).json({ error: "Incorrect username or password" });
	}

	const session = await lucia.createSession(existingUser.id, {});

	existingUser.password = undefined as any;

	res.setHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
	return res.status(200).json({
		message: "Logged in successfully",
	});
};

// todo : don't sent post , Get  resqust to this route just redirect to the url ie. window.location.href = login/google and then the google callback will be called

export const githubLogin = async (req: Request, res: Response) => {
	if (res.locals.session) {
		return res.status(200).json({ error: "You are login" }).end();
	}

	const state = generateState();
	const url = await github.createAuthorizationURL(state, {
		scopes: ["user:email"],
	});

	res
		.status(302)
		.appendHeader(
			"Set-Cookie",
			serializeCookie("github_oauth_state", state, {
				path: "/",
				secure: process.env.NODE_ENV === "production",
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: "lax",
			}),
		)
		.redirect(url.toString());
};

export const githubCallback = async (req: Request, res: Response) => {
	const code = req.query.code?.toString() ?? null;
	const state = req.query.state?.toString() ?? null;
	const storedState = parseCookies(req.headers.cookie ?? "").get("github_oauth_state") ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		return res
			.status(400)
			.json({
				error: "Invalid request",
			})
			.end();
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);

		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});

		const githubUser: User & Github = await githubUserResponse.json();

		const existingUser = await prisma.account.findFirst({
			where: {
				providerAccountId: githubUser.id.toString(),
			},
		});

		if (existingUser) {
			const session = await lucia.createSession(existingUser.userId, {});
			return res
				.status(201)
				.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
				.redirect("/dashboard");
		}

		const registeredEmail = await prisma.user.findFirst({
			where: {
				email: githubUser.email,
			},
		});

		if (registeredEmail) {
			const errorMessage = encodeURIComponent("This email is already registered.");
			return res.redirect(`/auth/sign-up?error=${errorMessage}`);
		}

		const user = await prisma.user.create({
			data: {
				username: githubUser.login,
				email: githubUser.email,
				avatar: githubUser.avatar_url,
				emailVerified: true,
				Account: {
					create: {
						providerAccountId: githubUser.id.toString(),
						provider: "github",
					},
				},
			},
		});

		const session = await lucia.createSession(user.id, {});
		return res
			.status(201)
			.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
			.redirect("/dashboard");
	} catch (e) {
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			res.status(400).end();
			return;
		}
		console.log(e);
		res.status(500).end();
	}
};

// todo :  don't sent post , Get  resqust to this route just redirect to the url ie. window.location.href = login.google and then the google callback will be called

export const googleLogin = async (req: Request, res: Response) => {
	if (res.locals.session) {
		return res.status(200).json({ error: "You must be logged out to login" }).end;
	}

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
		scopes: ["profile", "email"],
	});

	res
		.status(302)
		.appendHeader(
			"Set-Cookie",
			serializeCookie("google_oauth_state", state, {
				path: "/",
				secure: process.env.NODE_ENV === "production",
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: "lax",
			}),
		)
		.appendHeader(
			"Set-Cookie",
			serializeCookie("google_code_verifier", codeVerifier, {
				path: "/",
				secure: process.env.NODE_ENV === "production",
				httpOnly: true,
				maxAge: 60 * 10,
				sameSite: "lax",
			}),
		)
		.redirect(url.toString());
};

export const googleCallback = async (req: Request, res: Response) => {
	const code = req.query.code?.toString() ?? null;
	const state = req.query.state?.toString() ?? null;
	const storedState = parseCookies(req.headers.cookie ?? "").get("google_oauth_state") ?? null;
	const codeVerifier = parseCookies(req.headers.cookie ?? "").get("google_code_verifier") ?? null;

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return res
			.status(400)
			.json({
				error: "Invalid request",
			})
			.end();
	}

	try {
		const tokens = await googleAuth.validateAuthorizationCode(code, codeVerifier);

		const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});

		const googleUser: User & GoogleUser = await response.json();

		const existingUser = await prisma.account.findFirst({
			where: {
				providerAccountId: googleUser.sub,
			},
		});

		if (existingUser) {
			const session = await lucia.createSession(existingUser.userId, {});

			res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());

			return res.status(309).redirect("/dashboard");
		}

		const registeredEmail = await prisma.user.findFirst({
			where: {
				email: googleUser.email,
			},
		});

		if (registeredEmail) {
			const errorMessage = encodeURIComponent("This email is already registered.");
			return res.redirect(`/auth/sign-up?error=${errorMessage}`);
		}

		const user = await prisma.user.create({
			data: {
				username: googleUser.name,
				email: googleUser.email,
				avatar: googleUser.picture,
				emailVerified: googleUser.email_verified,
				Account: {
					create: {
						providerAccountId: googleUser.sub,
						provider: "google",
					},
				},
			},
		});

		const session = await lucia.createSession(user.id, {});
		res.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize()).redirect("/dashboard");
	} catch (e) {
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			console.log("bad_verification_code", e);
			res.status(400).end();
			return;
		}
		console.log(e);
		res.status(500).end();
	}
};

export const logout = async (req: Request, res: Response) => {
	if (!res.locals.session) {
		return res.status(401).json({ error: "Already Logout" }).end();
	}

	await lucia.invalidateSession(res.locals.session.id);

	return res
		.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize())
		.status(200)
		.json({
			message: "Logged out successfully",
		})
		.end();
};

interface Github {
	login: string;
	avatar_url: string;
	email_verified: boolean;
	github_id: number;
}

interface GoogleUser {
	sub: string;
	email: string;
	name: string;
	picture: string;
	email_verified: boolean;
}
