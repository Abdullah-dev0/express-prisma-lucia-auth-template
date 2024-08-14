import { emailVerification, resendVerification } from "../../controllers/email.js";
import express from "express";
import { sessionManagementMiddleware } from "../../middleware/auth.js";
export const emailRouter = express.Router();

emailRouter.use(sessionManagementMiddleware);

emailRouter.post("/email-verification", emailVerification);
emailRouter.post("/resent-verification", resendVerification);
