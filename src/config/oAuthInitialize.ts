//Initialize the OAuth providers see the docs for more info https://arctic.js.org/

import { GitHub } from "arctic";
import { Google } from "arctic";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be provided in the environment variables");
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
	throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided in the environment variables");
}

export const github = new GitHub(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET);

export const googleAuth = new Google(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,

	//please change this to your own callback url

	`http://localhost:5173/api/login/google/callback`,
);
