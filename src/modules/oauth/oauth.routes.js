import { Router } from "express";
import {
    authorization,
    certs,
    healthCheck,
    openIdConfiguration,
    showConsent,
    submitConsent,
    token,
    userInfo,
} from "./oauth.controller.js";

const router = Router();

router.get("/health-check", healthCheck);
router.get("/.well-known/openid-configuration", openIdConfiguration);
router.get("/authorization", authorization);
router.post("/token", token);
router.get("/userinfo", userInfo);
router.get("/certs", certs);
router.get("/auth/consent", showConsent);
router.post("/auth/consent", submitConsent);

export default router;
