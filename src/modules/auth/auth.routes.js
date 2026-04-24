import { Router } from "express";
import { login, logout, register, showLoginPage, showRegisterPage } from "./auth.controller.js";

const router = Router();

router.get("/login", showLoginPage);
router.get("/register", showRegisterPage);
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

export default router;
