import { renderConsentPage } from "./consent-page.js";
import {
    exchangeToken,
    getCerts,
    getConsentPageData,
    getOpenIdConfiguration,
    getUserInfo,
    handleConsentDecision,
    startAuthorization,
} from "./oauth.service.js";

function healthCheck(req, res) {
    res.json({ status: "ok" });
}

function openIdConfiguration(req, res) {
    res.json(getOpenIdConfiguration());
}

async function authorization(req, res) {
    const redirectUrl = await startAuthorization(req);
    res.redirect(redirectUrl);
}

async function token(req, res) {
    const payload = await exchangeToken(req.body);
    res.json(payload);
}

async function userInfo(req, res) {
    const payload = await getUserInfo(req.headers.authorization);
    res.json(payload);
}

function certs(req, res) {
    res.json(getCerts());
}

async function showConsent(req, res) {
    const pageData = await getConsentPageData(req, req.query.flow);
    res.send(renderConsentPage(pageData));
}

async function submitConsent(req, res) {
    const redirectUrl = await handleConsentDecision(req, {
        flowId: req.body.flow,
        decision: req.body.decision,
    });
    res.redirect(redirectUrl);
}

export {
    authorization,
    certs,
    healthCheck,
    openIdConfiguration,
    showConsent,
    submitConsent,
    token,
    userInfo,
};
