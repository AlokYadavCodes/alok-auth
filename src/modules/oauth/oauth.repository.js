import { pool } from "../../db/pool.js";

async function findOAuthClientById(clientId) {
    const result = await pool.query("SELECT * FROM oauth_clients WHERE client_id = $1", [clientId]);
    return result.rows[0] || null;
}

async function findOAuthClientByCredentials(clientId, clientSecret) {
    const result = await pool.query(
        "SELECT * FROM oauth_clients WHERE client_id = $1 AND client_secret = $2",
        [clientId, clientSecret]
    );
    return result.rows[0] || null;
}

async function findConsent(userId, clientId) {
    const result = await pool.query(
        "SELECT scope FROM oauth_consents WHERE user_id = $1 AND client_id = $2",
        [userId, clientId]
    );
    return result.rows[0] || null;
}

async function upsertConsent({ userId, clientId, scope }) {
    await pool.query(
        `INSERT INTO oauth_consents (user_id, client_id, scope)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, client_id)
         DO UPDATE SET scope = EXCLUDED.scope, updated_at = NOW()`,
        [userId, clientId, scope]
    );
}

async function createAuthorizationCode({
    code,
    scope,
    nonce,
    codeChallenge,
    codeChallengeMethod,
    clientId,
    userId,
    expiresAt,
}) {
    const result = await pool.query(
        `INSERT INTO auth_short_codes
         (code, scope, nonce, code_challenge, code_challenge_method, client_id, user_id, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [code, scope, nonce, codeChallenge, codeChallengeMethod, clientId, userId, expiresAt]
    );
}

async function findAuthorizationCode(code, clientId) {
    const result = await pool.query(
        "SELECT * FROM auth_short_codes WHERE code = $1 AND client_id = $2",
        [code, clientId]
    );
    return result.rows[0] || null;
}

async function deleteAuthorizationCode(code) {
    await pool.query("DELETE FROM auth_short_codes WHERE code = $1", [code]);
}

async function createAccessToken({ token, scope, clientId, userId, expiresAt }) {
    await pool.query(
        `INSERT INTO access_tokens (token, scope, client_id, user_id, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [token, scope, clientId, userId, expiresAt]
    );
}

async function findAccessTokenWithUser(token) {
    const result = await pool.query(
        `SELECT at.scope, at.user_id, at.expires_at, u.email, u.name
         FROM access_tokens at
         JOIN users u ON u.id = at.user_id
         WHERE at.token = $1`,
        [token]
    );
    return result.rows[0] || null;
}

async function deleteAccessToken(token) {
    await pool.query("DELETE FROM access_tokens WHERE token = $1", [token]);
}

async function createRefreshToken({ token, scope, clientId, userId, expiresAt }) {
    await pool.query(
        `INSERT INTO refresh_tokens (token, scope, client_id, user_id, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [token, scope, clientId, userId, expiresAt]
    );
}

async function findRefreshToken(token, clientId) {
    const result = await pool.query(
        `SELECT user_id, expires_at, scope FROM refresh_tokens WHERE token = $1 AND client_id = $2`,
        [token, clientId]
    );
    return result.rows[0] || null;
}

async function deleteRefreshToken(token) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
}

async function findUserProfileById(userId) {
    const result = await pool.query(
        "SELECT id, email, name, profile_image_url FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0] || null;
}

export {
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
};
