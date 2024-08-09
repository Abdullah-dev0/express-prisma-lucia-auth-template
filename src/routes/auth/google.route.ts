// Purpose: Define the routes for the google authentication.

import express from "express";
import { googleCallback, googleLogin } from "../../controllers/auth.js";
import { sessionManagementMiddleware } from "../../middleware/auth.js";

export const googleRouter = express.Router();

googleRouter.use(sessionManagementMiddleware);

googleRouter.get("/login/google", googleLogin);
googleRouter.get("/login/google/callback", googleCallback);
