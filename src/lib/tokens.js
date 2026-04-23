import crypto from "node:crypto";

function createToken(size) {
    return crypto.randomBytes(size).toString("base64url");
}

function base64UrlEncode(obj) {
    return Buffer.from(JSON.stringify(obj))
        .toString("base64url")
}

function signIdToken({ issuer, clientId, userId, nonce, scopes, user, privateKeyBase64 }) {
    const header = {
        alg: "RS256",
        typ: "JWT",
        kid: "alok-auth-key-id",
    };

    const payload = {
        iss: issuer,
        sub: String(userId),
        aud: clientId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        iat: Math.floor(Date.now() / 1000),
    };

    if (nonce) {
        payload.nonce = nonce;
    }
    if (scopes.includes("email")) {
        payload.email = user.email;
    }
    if (scopes.includes("profile")) {
        payload.name = user.name;
    }

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf-8");
    const signature = crypto.sign("sha256", Buffer.from(signingInput), privateKey);
    const encodedSignature = signature.toString("base64url");

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export { createToken, signIdToken };
