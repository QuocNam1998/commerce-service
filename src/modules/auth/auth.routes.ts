import { Router } from "express";
import {
  handleGetCurrentUser,
  handleLogin,
  handleLogout,
  handleRegister
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", handleLogin);
authRouter.get("/me", handleGetCurrentUser);
authRouter.post("/logout", handleLogout);
authRouter.post("/register", handleRegister);
