import { Lucia, TimeSpan } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "../config/prismaClient.js";

//configration for lucia see the docs for more info https://lucia-auth.com/

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(1, "d"),

	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production",
		},
	},

	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			emailVerified: attributes.emailVerified,
			email: attributes.email,
		};
	},
});

// IMPORTANT!
declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
		DatabaseAccountAttributes: DatabaseAccountAttributes;
	}
}

interface DatabaseUserAttributes {
	username: string;
	emailVerified: boolean;
	email: string;
}

interface DatabaseAccountAttributes {
	provider: string;
	providerAccountId: string;
}
