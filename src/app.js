import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db/pool.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import { env } from "./config/env.js";
import errorHandler from "./middleware/error-handler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import accountRoutes from "./modules/accounts/account.routes.js";
import clientAppRoutes from "./modules/client-apps/client-app.routes.js";
import homeRoutes from "./modules/home/home.routes.js";
import oauthRoutes from "./modules/oauth/oauth.routes.js";

const app = express();
const PgSessionStore = connectPgSimple(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    name: "auth_sid",
    secret: env.sessionSecret,
    store: new PgSessionStore({
        pool,
        tableName: "auth_sessions",
        createTableIfMissing: true,
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: env.sessionMaxAgeMs,
        httpOnly: true,
        sameSite: "lax",
        secure: env.nodeEnv === "production",
    },
}));

app.use("/", homeRoutes);
app.use("/", oauthRoutes);
app.use("/auth", authRoutes);
app.use("/account", accountRoutes);
app.use("/client", clientAppRoutes);
app.use(errorHandler);

export default app;
