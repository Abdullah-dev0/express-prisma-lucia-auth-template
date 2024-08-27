import cron from "node-cron";

import { prisma } from "../../config/prismaClient.js";

import { lucia } from "../../config/luciaAuth.js";

// Cron job to clean expired sessions every Sunday at midnight.
export const cleanExpiredSessionJob = () => {
	cron.schedule("0 2 * * *", async () => {
		console.log("Running cron job to clean cookies");
		await lucia.deleteExpiredSessions();
	});
};

//cros job to delete all the expire email verification tokens

export const cleanExpiredTokensJob = () => {
	cron.schedule("*/3 * * * *", async () => {
		console.log("Running cron job to clean email verification tokens");
		await prisma.emailVerificationCode.deleteMany({
			where: {
				expires_at: {
					lte: new Date(),
				},
			},
		});
		console.log("Expired tokens cleaned up");
	});
};
