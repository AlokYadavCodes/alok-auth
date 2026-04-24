import { Router } from "express";
import { showHomepage } from "./home.controller.js";

const router = Router();

router.get("/", showHomepage);

export default router;
