// Code to handle the authentication routes

import express from "express";
import { login, logout, signUp } from "../../controllers/auth.js";
import { sessionManagementMiddleware } from "../../middleware/auth.js";

export const authRouter = express.Router();

authRouter.use(sessionManagementMiddleware);

authRouter.post("/signup", signUp);
authRouter.post("/signin", login);
authRouter.get("/logout", logout);
