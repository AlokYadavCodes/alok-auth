import { Router } from "express";
import requireAuthenticatedUser from "../../middleware/require-authenticated-user.js";
import { upload } from "../../middleware/multer.js";
import { revokeAuthorizedApp, showAccountPage, showAuthorizedAppsPage, updateProfileImage } from "./account.controller.js";

const router = Router();

router.use(requireAuthenticatedUser);
router.get("/", showAccountPage);
router.get("/apps", showAuthorizedAppsPage);
router.post("/apps/:clientId/revoke", revokeAuthorizedApp);
router.post("/profile/image", upload.single("profileImage"), updateProfileImage);

export default router;
