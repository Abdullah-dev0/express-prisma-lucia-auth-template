// purpose of this file is to define the routes for the user entity

import express from "express";

import { getCurrentUser } from "../controllers/user.js";
import { sessionManagementMiddleware } from "../middleware/auth.js";

export const userRouter = express.Router();

userRouter.use(sessionManagementMiddleware);

userRouter.get("/getCurrentUser", getCurrentUser);
