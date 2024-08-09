<<<<<<< HEAD
// purpose of this file is to define the routes for the user entity

import express from "express";

import { add, emailVerification, getCurrentUser } from "../controllers/user.js";
import { sessionManagementMiddleware } from "../middleware/auth.js";

export const userRouter = express.Router();

userRouter.use(sessionManagementMiddleware);

userRouter.post("/add", add);
userRouter.get("/getCurrentUser", getCurrentUser);
userRouter.post("/email-verification", emailVerification);
=======
import express from "express";

import { add, login, logout, signUp } from "../controllers/user.js";
import { originVerificationMiddleware, sessionManagementMiddleware } from "../middleware/auth.js";

export const userRouter = express.Router();

userRouter.post("/add", sessionManagementMiddleware, add);
userRouter.post("/auth/signup", signUp);
userRouter.post("/auth/login", login);
userRouter.get("/auth/logout", sessionManagementMiddleware, logout);
>>>>>>> 5c57b39619eb191d1007649ccc1b1116164a066e
