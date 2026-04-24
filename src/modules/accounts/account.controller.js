import {
    getAccountOverview,
    getAuthorizedApps,
    revokeAuthorizedAppAccess,
} from "./account.service.js";
import { renderAccountPage, renderAuthorizedAppsPage } from "./account.page.js";

async function showAccountPage(req, res) {
    const pageData = await getAccountOverview(req.session.userId);
    res.send(renderAccountPage(pageData));
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

export {
    revokeAuthorizedApp,
    showAccountPage,
    showAuthorizedAppsPage,
};
