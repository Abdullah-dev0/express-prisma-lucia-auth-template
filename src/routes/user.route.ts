// purpose of this file is to define the routes for the user entity

import express from "express";

import { add, getCurrentUser } from "../controllers/user.js";
import { sessionManagementMiddleware } from "../middleware/auth.js";
import { verifiedEmail } from "../middleware/verified.js";

export const userRouter = express.Router();

userRouter.use(sessionManagementMiddleware);

userRouter.post("/add", verifiedEmail, add);
userRouter.get("/getCurrentUser", getCurrentUser);
