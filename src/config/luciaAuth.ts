import { Lucia, TimeSpan } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "../config/prismaClient.js";

<<<<<<< HEAD
//configration for lucia see the docs for more info https://lucia-auth.com/

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(1, "d"),
=======
const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
>>>>>>> 5c57b39619eb191d1007649ccc1b1116164a066e
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production",
		},
	},
<<<<<<< HEAD
	getUserAttributes: (attributes) => {
		return {
			githubId: attributes.github_id,
			username: attributes.username,
			emailVerified: attributes.email_verified,
			email: attributes.email,
		};
	},
=======
>>>>>>> 5c57b39619eb191d1007649ccc1b1116164a066e
});

// IMPORTANT!
declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
<<<<<<< HEAD
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	github_id: number;
	username: string;
	email_verified: boolean;
	email: string;
}
=======
	}
}
>>>>>>> 5c57b39619eb191d1007649ccc1b1116164a066e
