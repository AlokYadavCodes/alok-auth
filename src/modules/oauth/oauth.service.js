import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { buildRedirectUrlWithParams } from "../../lib/redirects.js";
import { isScopeSubset, getScopeArray, getScopeString, unionScopes } from "../../lib/scopes.js";
import { createToken, signIdToken } from "../../lib/tokens.js";
import {
    createAccessToken,
    createAuthorizationCode,
    createRefreshToken,
    deleteAccessToken,
    deleteAuthorizationCode,
    deleteRefreshToken,
    findAccessTokenWithUser,
    findAuthorizationCode,
    findConsent,
    findOAuthClientByCredentials,
    findOAuthClientById,
    findRefreshToken,
    findUserProfileById,
    upsertConsent,
} from "./oauth.repository.js";
import ApiError from "../../utils/ApiError.js";

const allowedScopes = ["openid", "offline_access", "email", "profile"];

function getOpenIdConfiguration() {
    return {
        issuer: env.issuer,
        authorization_endpoint: `${env.issuer}/authorization`,
        token_endpoint: `${env.issuer}/token`,
        userinfo_endpoint: `${env.issuer}/userinfo`,
        jwks_uri: `${env.issuer}/certs`,
        response_types_supported: ["code"],
        response_modes_supported: ["query"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
        scopes_supported: [...allowedScopes],
        token_endpoint_auth_methods_supported: ["client_secret_post"],
        claims_supported: [
            "aud",
            "email",
            "email_verified",
            "exp",
            "iat",
            "iss",
            "name",
            "picture",
            "sub",
        ],
        code_challenge_methods_supported: ["plain", "S256"],
        grant_types_supported: ["authorization_code", "refresh_token"],
    };
}

async function startAuthorization(req) {
    const {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType = "code",
        scope,
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
    } = req.query;

    if (!clientId || !redirectUri || !responseType || !scope) {
        throw ApiError.badRequest("Missing required query parameters: client_id, redirect_uri, response_type, scope");
    }

    const oauthClient = await findOAuthClientById(clientId);
    if (!oauthClient) {
        throw ApiError.badRequest("Invalid client_id");
    }

    if (redirectUri !== oauthClient.redirect_uri) {
        throw ApiError.badRequest("Invalid redirect_uri");
    }

    if (responseType !== "code") {
        throw ApiError.badRequest("Unsupported response_type. Only 'code' is supported");
    }

    const requestedScopes = getScopeArray(scope);
    if (!requestedScopes.includes("openid")) {
        throw ApiError.badRequest("The 'openid' scope is required");
    }

    const validScope = requestedScopes.every((item) => allowedScopes.includes(item));
    if (!validScope) {
        throw ApiError.badRequest("Invalid scope requested");
    }

    const flowId = createToken(16);
    req.session.flows = req.session.flows || {};
    req.session.flows[flowId] = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope: requestedScopes,
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        created_at: Date.now(),
    };

    if (req.session.userId) {
        return handleAuthenticatedLogin(req, {
            flowId,
            userId: req.session.userId,
        });
    }

    return `/auth/login?flow=${flowId}`;
}

async function handleAuthenticatedLogin(req, { flowId, userId }) {
    const flow = validateFlow(req, flowId);
    const existingConsent = await findConsent(userId, flow.client_id);

    if (existingConsent && isScopeSubset(flow.scope, getScopeArray(existingConsent.scope))) {
        const code = await issueAuthorizationCode(flow, userId);
        const redirectUrl = buildRedirectUrlWithParams(flow.redirect_uri, {
            code,
            state: flow.state,
        });
        clearFlowState(req, flowId);
        return redirectUrl;
    }

    req.session.pendingConsents = req.session.pendingConsents || {};
    req.session.pendingConsents[flowId] = {
        user_id: userId,
        created_at: Date.now(),
    };

    return `/auth/consent?flow=${flowId}`;
}

async function getConsentPageData(req, flowId) {
    const flow = validateFlow(req, flowId);
    const pendingConsent = req.session.pendingConsents?.[flowId];

    if (!pendingConsent) {
        throw ApiError.badRequest("Invalid flow");
    }

    const oauthClient = await findOAuthClientById(flow.client_id);
    if (!oauthClient) {
        clearFlowState(req, flowId);
        throw ApiError.badRequest("Invalid client");
    }

    return {
        appName: oauthClient.app_name,
        websiteUrl: oauthClient.website_url,
        scopes: flow.scope,
        flowId,
    };
}

async function handleConsentDecision(req, { flowId, decision }) {
    const flow = validateFlow(req, flowId);
    const pendingConsent = req.session.pendingConsents?.[flowId];

    if (!pendingConsent) {
        throw ApiError.badRequest("Invalid request");
    }

    if (decision !== "approve") {
        const deniedRedirect = buildRedirectUrlWithParams(flow.redirect_uri, {
            error: "access_denied",
            state: flow.state,
        });
        clearFlowState(req, flowId);
        return deniedRedirect;
    }

    const existingConsent = await findConsent(pendingConsent.user_id, flow.client_id);
    const grantedScopes = unionScopes(
        getScopeArray(existingConsent?.scope),
        flow.scope
    );

    await upsertConsent({
        userId: pendingConsent.user_id,
        clientId: flow.client_id,
        scope: grantedScopes.join(" "),
    });

    const code = await issueAuthorizationCode(flow, pendingConsent.user_id);
    const redirectUrl = buildRedirectUrlWithParams(flow.redirect_uri, {
        code,
        state: flow.state,
    });
    clearFlowState(req, flowId);
    return redirectUrl;
}

async function exchangeToken({
    client_id: clientId,
    client_secret: clientSecret,
    scope,
    code,
    refresh_token: refreshToken,
    redirect_uri: redirectUri,
    grant_type: grantType,
    code_verifier: codeVerifier,
}) {
    if (!clientId || !clientSecret || !grantType) {
        throw ApiError.badRequest("Missing required parameters: client_id, client_secret, grant_type");
    }

    const oauthClient = await findOAuthClientByCredentials(clientId, clientSecret);
    if (!oauthClient) {
        throw ApiError.unauthorized("Invalid client credentials");
    }

    if (!["authorization_code", "refresh_token"].includes(grantType)) {
        throw ApiError.badRequest("Unsupported grant_type. Supported types are 'authorization_code' and 'refresh_token'");
    }

    let authorizationCode = null;
    let userId;
    let finalScopes;
    let finalScopeString;
    let accessToken;
    let rotatedRefreshToken;

    if (grantType === "refresh_token") {
        if (!refreshToken) {
            throw ApiError.badRequest("Missing refresh_token for refresh_token grant type");
        }

        const refreshTokenRecord = await findRefreshToken(refreshToken, clientId);
        if (!refreshTokenRecord) {
            throw ApiError.badRequest("Invalid refresh token");
        }

        userId = refreshTokenRecord.user_id;

        if (new Date() > refreshTokenRecord.expires_at) {
            await deleteRefreshToken(refreshToken);
            throw ApiError.badRequest("Refresh token expired");
        }

        const originalScopes = getScopeArray(refreshTokenRecord.scope);
        finalScopes = scope ? getScopeArray(scope) : originalScopes;

        if (!isScopeSubset(finalScopes, originalScopes)) {
            throw ApiError.badRequest("Invalid scope: requested scopes exceed those granted by the original refresh token");
        }

        finalScopeString = finalScopes.join(" ");
        await deleteRefreshToken(refreshToken);

        accessToken = createToken(32);
        rotatedRefreshToken = createToken(32);

        await createAccessToken({
            token: accessToken,
            scope: finalScopeString,
            clientId,
            userId,
            expiresAt: new Date(Date.now() + (60 * 60 * 1000)), // 1 hour
        });

        await createRefreshToken({
            token: rotatedRefreshToken,
            scope: finalScopeString,
            clientId,
            userId,
            expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
        });
    } else {
        if (!code || !redirectUri) {
            throw ApiError.badRequest("Missing required parameters for authorization_code grant type: code, redirect_uri");
        }

        if (redirectUri !== oauthClient.redirect_uri) {
            throw ApiError.badRequest("Invalid redirect_uri");
        }

        authorizationCode = await findAuthorizationCode(code, clientId);
        if (!authorizationCode) {
            throw ApiError.badRequest("Invalid authorization code");
        }

        if (new Date() > authorizationCode.expires_at) {
            throw ApiError.badRequest("Authorization code expired");
        }

        userId = authorizationCode.user_id;

        if (authorizationCode.code_challenge) {
            if (!codeVerifier) {
                throw ApiError.badRequest("Missing code_verifier for PKCE flow");
            }

            let expectedChallenge;
            if (authorizationCode.code_challenge_method === "S256") {
                expectedChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
            } else if (authorizationCode.code_challenge_method === "plain") {
                expectedChallenge = codeVerifier;
            } else {
                throw ApiError.badRequest("Unsupported code_challenge_method");
            }

            if (expectedChallenge !== authorizationCode.code_challenge) {
                throw ApiError.badRequest("Invalid code_verifier");
            }
        }

        finalScopeString = authorizationCode.scope;
        finalScopes = getScopeArray(finalScopeString);
        accessToken = createToken(32);

        await createAccessToken({
            token: accessToken,
            scope: finalScopeString,
            clientId,
            userId,
            expiresAt: new Date(Date.now() + (60 * 60 * 1000)), // 1 hour
        });

        if (finalScopes.includes("offline_access")) {
            rotatedRefreshToken = createToken(32);
            await createRefreshToken({
                token: rotatedRefreshToken,
                scope: finalScopeString,
                clientId,
                userId,
                expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
            });
        }

        await deleteAuthorizationCode(code);
    }

    const user = await findUserProfileById(userId);
    const idToken = signIdToken({
        issuer: env.issuer,
        clientId,
        userId,
        nonce: authorizationCode?.nonce,
        scopes: finalScopes,
        user,
        privateKeyBase64: env.privateKey,
    });

    const responsePayload = {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        id_token: idToken,
    };

    if (rotatedRefreshToken) {
        responsePayload.refresh_token = rotatedRefreshToken;
    }

    return responsePayload;
}

async function getUserInfo(authHeader) {
    if (!authHeader?.startsWith("Bearer ")) {
        throw ApiError.unauthorized("Missing or invalid Authorization header");
    }

    const accessToken = authHeader.slice("Bearer ".length).trim();
    if (!accessToken) {
        throw ApiError.unauthorized("Missing access token");
    }

    const tokenRecord = await findAccessTokenWithUser(accessToken);
    if (!tokenRecord) {
        throw ApiError.unauthorized("Invalid access token");
    }

    if (new Date() > tokenRecord.expires_at) {
        await deleteAccessToken(accessToken);
        throw ApiError.unauthorized("Access token expired");
    }

    const scopes = getScopeArray(tokenRecord.scope);
    const userInfo = {
        sub: String(tokenRecord.user_id),
    };

    if (scopes.includes("email")) {
        userInfo.email = tokenRecord.email;
    }
    if (scopes.includes("profile")) {
        userInfo.name = tokenRecord.name;
        if (tokenRecord.profile_image_url) {
            userInfo.picture = tokenRecord.profile_image_url;
        }
    }

    return userInfo;
}

function getCerts() {
    const publicKey = Buffer.from(env.publicKey, "base64").toString("utf-8");
    const jwk = crypto.createPublicKey(publicKey).export({ format: "jwk" });

    return {
        keys: [
            {
                kty: "RSA",
                use: "sig",
                kid: "alok-auth-key-id",
                alg: "RS256",
                n: jwk.n,
                e: jwk.e,
            },
        ],
    };
}

function validateFlow(req, flowId) {
    const flow = flowId ? req.session.flows?.[flowId] : null;
    if (!flowId || !flow) {
        throw ApiError.badRequest("Invalid flow");
    }

    if (Date.now() - flow.created_at > 5 * 60 * 1000) {
        clearFlowState(req, flowId);
        throw ApiError.badRequest("Flow expired");
    }

    return flow;
}

async function issueAuthorizationCode(flow, userId) {
    const code = createToken(8);
    await createAuthorizationCode({
        code,
        scope: getScopeString(flow.scope),
        nonce: flow.nonce,
        codeChallenge: flow.code_challenge,
        codeChallengeMethod: flow.code_challenge_method,
        clientId: flow.client_id,
        userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return code;
}

function clearFlowState(req, flowId) {
    if (req.session.flows) {
        delete req.session.flows[flowId];
    }
    if (req.session.pendingConsents) {
        delete req.session.pendingConsents[flowId];
    }
}

export {
    exchangeToken,
    getCerts,
    getConsentPageData,
    getOpenIdConfiguration,
    getUserInfo,
    handleAuthenticatedLogin,
    handleConsentDecision,
    startAuthorization,
};
