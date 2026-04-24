import path from "path";
import { authenticateUser, registerUser } from "./auth.service.js";
import { viewsPath } from "../../utils/paths.js";
import { handleAuthenticatedLogin } from "../oauth/oauth.service.js";
import ApiError from "../../utils/ApiError.js";

function showLoginPage(req, res) {
    if (req.session.userId) {
        return res.redirect("/account");
    }
    console.log(req.originalUrl)
    res.sendFile(path.join(viewsPath, "login.html"));
}

function showRegisterPage(req, res) {
    if (req.session.userId) {
        return res.redirect("/account");
    }

    res.sendFile(path.join(viewsPath, "register.html"));
}

async function register(req, res) {
    await registerUser(req.body);
    login(req, res);
}

async function login(req, res) {
    const { flow: flowId, returnTo } = req.body;
    const user = await authenticateUser(req.body);
    req.session.userId = user.id;

    if (flowId) {
        const redirectUrl = await handleAuthenticatedLogin(req, {
            flowId,
            userId: user.id,
        });
        return res.redirect(redirectUrl);
    }

    if (returnTo) {
        res.redirect(returnTo);
    } else res.redirect("/account");
}

async function logout(req, res) {
    await req.session.destroy((error) => {
        if (error) {
            throw new Error("Failed to destroy session");
        }
        res.clearCookie("auth_sid");
        res.redirect("/");
    });
}

export { login, logout, register, showLoginPage, showRegisterPage };
