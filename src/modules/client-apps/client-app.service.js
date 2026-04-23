import { env } from "../../config/env.js";
import { createToken } from "../../lib/tokens.js";
import ApiError from "../../utils/ApiError.js";
import { createClientApp } from "./client-app.repository.js";

async function registerClientApp({ app_name: appName, website_url: websiteUrl, redirect_uri: redirectUri }) {
    if (!appName || !websiteUrl || !redirectUri) {
        throw ApiError.badRequest("Missing required fields: app_name, website_url, redirect_uri");
    }

    try {
        new URL(websiteUrl);
        new URL(redirectUri);
    } catch {
        throw ApiError.badRequest("Invalid URL format for website_url or redirect_uri")
    }

    const clientId = createToken(16);
    const clientSecret = createToken(32);

    await createClientApp({
        appName,
        websiteUrl,
        redirectUri,
        clientId,
        clientSecret,
    });

    const authorizationUrl = new URL(`${env.issuer}/authorization`);
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email profile");
    authorizationUrl.searchParams.set("state", "STATE_PLACEHOLDER");
    authorizationUrl.searchParams.set("nonce", "NONCE_PLACEHOLDER");

    return {
        app_name: appName,
        client_id: clientId,
        client_secret: clientSecret,
        authorization_url: authorizationUrl.toString(),
    };
}

export { registerClientApp };
