import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import errorHandler from "./middleware/error-handler.js";
import accountRoutes from "./modules/accounts/account.routes.js";
import clientAppRoutes from "./modules/client-apps/client-app.routes.js";
import oauthRoutes from "./modules/oauth/oauth.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    name: "oauth_sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 10 * 60 * 1000,
        httpOnly: true,
        sameSite: true,
    },
}));

app.use("/", oauthRoutes);
app.use("/auth", accountRoutes);
app.use("/client", clientAppRoutes);
app.use(errorHandler);

export default app;
