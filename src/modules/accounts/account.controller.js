import path from "path";
import { authenticateUser, registerUser } from "./account.service.js";
import { viewsPath } from "../../utils/paths.js";
import { handleAuthenticatedLogin } from "../oauth/oauth.service.js";

function showLoginPage(req, res) {
    res.sendFile(path.join(viewsPath, "login.html"));
}

function showRegisterPage(req, res) {
    res.sendFile(path.join(viewsPath, "register.html"));
}

async function register(req, res) {
    await registerUser(req.body);
    res.status(201).send("User registered successfully");
}

async function login(req, res) {
    const { flow: flowId } = req.body;
    const user = await authenticateUser(req.body);

    if (flowId) {
        const redirectUrl = await handleAuthenticatedLogin(req, {
            flowId,
            userId: user.id,
        });
        return res.redirect(redirectUrl);
    }

    res.status(200).send("user logged in successfully");
}

export { login, register, showLoginPage, showRegisterPage };
