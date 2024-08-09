import { emailVerificationCode } from "@prisma/client";
import { isWithinExpirationDate } from "oslo";
import { prisma } from "../../config/prismaClient.js";

export async function verifyVerificationCode(user: emailVerificationCode | null, code: string): Promise<boolean> {
	const databaseCode = await prisma.emailVerificationCode.findFirst({
		where: {
			user_id: user?.user_id,
		},
	});

	if (!databaseCode || databaseCode.code !== code) {
		return false;
	}

	if (!isWithinExpirationDate(databaseCode.expires_at)) {
		return false;
	}

	if (databaseCode.email !== user!.email) {
		console.log("email is incorrect");
		return false;
	}

	try {
		await prisma.emailVerificationCode.delete({
			where: {
				id: databaseCode.id,
			},
		});
	} catch (error: any) {
		console.log(error.message);
	}

	return true;
}
