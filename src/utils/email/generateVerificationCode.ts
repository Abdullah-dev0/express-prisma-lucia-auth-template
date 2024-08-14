import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { prisma } from "../../config/prismaClient.js";

export async function generateEmailVerificationCode(userId: string, email: string): Promise<string> {
	// delete any existing codes
	const deleteCodes = await prisma.emailVerificationCode.deleteMany({
		where: {
			user_id: userId,
		},
	});

	if (deleteCodes) {
		console.log("Deleted existing codes");
	}

	// generate a new code
	const code = generateRandomString(4, alphabet("0-9"));

	const expires_at = createDate(new TimeSpan(1, "m"));

	const newCode = await prisma.emailVerificationCode.create({
		data: {
			code,
			expires_at,
			user_id: userId,
			email,
		},
	});

	if (newCode) {
		console.log("Generated new code");
	}

	return code;
}
