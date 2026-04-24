import { Router } from "express";
import requireAuthenticatedUser from "../../middleware/require-authenticated-user.js";
import { revokeAuthorizedApp, showAccountPage, showAuthorizedAppsPage } from "./account.controller.js";

const router = Router();

router.use(requireAuthenticatedUser);
router.get("/", showAccountPage);
router.get("/apps", showAuthorizedAppsPage);
router.post("/apps/:clientId/revoke", revokeAuthorizedApp);

export default router;
