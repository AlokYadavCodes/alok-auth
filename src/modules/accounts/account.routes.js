import { Router } from "express";
import { login, register, showLoginPage, showRegisterPage } from "./account.controller.js";

const router = Router();

router.get("/login", showLoginPage);
router.get("/register", showRegisterPage);
router.post("/login", login);
router.post("/register", register);

export default router;
