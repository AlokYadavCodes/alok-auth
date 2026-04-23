import path from "path";
import { viewsPath } from "../../utils/paths.js";
import { registerClientApp } from "./client-app.service.js";

function showRegisterPage(req, res) {
    res.sendFile(path.join(viewsPath, "client-register.html"));
}

async function register(req, res) {
    const result = await registerClientApp(req.body);
    res.status(201).json(result);
}

export { register, showRegisterPage };
