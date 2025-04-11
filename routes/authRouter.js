import express from "express";
import { register, login, logout, getCurrent } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { updateSubscription } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/current", authMiddleware, getCurrent);
authRouter.patch("/subscription", authMiddleware, updateSubscription);

export default authRouter;
