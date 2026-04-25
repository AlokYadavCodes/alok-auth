import {
    getAccountOverview,
    getAuthorizedApps,
    revokeAuthorizedAppAccess,
    setUserProfileImage,
} from "./account.service.js";
import { renderAccountPage, renderAuthorizedAppsPage } from "./account.page.js";

async function showAccountPage(req, res) {
    const pageData = await getAccountOverview(req.session.userId);
    res.send(renderAccountPage({
        ...pageData,
        profileImageUpdated: req.query.profileImageUpdated === "1",
    }));
}

async function showAuthorizedAppsPage(req, res) {
    const pageData = await getAuthorizedApps(req.session.userId);
    res.send(renderAuthorizedAppsPage({
        ...pageData,
        revoked: req.query.revoked === "1",
    }));
}

async function revokeAuthorizedApp(req, res) {
    await revokeAuthorizedAppAccess(req.session.userId, req.params.clientId);
    res.redirect(303, "/account/apps?revoked=1");
}

async function updateProfileImage(req, res) {
    await setUserProfileImage(req.session.userId, req.file);
    res.redirect(303, "/account?profileImageUpdated=1");
}

export {
    revokeAuthorizedApp,
    showAccountPage,
    showAuthorizedAppsPage,
    updateProfileImage,
};
