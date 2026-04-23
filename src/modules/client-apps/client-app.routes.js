import { Router } from "express";
import { register, showRegisterPage } from "./client-app.controller.js";

const router = Router();

router.get("/register", showRegisterPage);
router.post("/register", register);

export default router;
