// purpose of this file is to define the routes for the user entity

import express from "express";

import { add, emailVerification, getCurrentUser } from "../controllers/user.js";
import { sessionManagementMiddleware } from "../middleware/auth.js";

export const userRouter = express.Router();

userRouter.use(sessionManagementMiddleware);

userRouter.post("/add", add);
userRouter.get("/getCurrentUser", getCurrentUser);
userRouter.post("/email-verification", emailVerification);
