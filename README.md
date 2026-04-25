# Alok Auth

A minimal OAuth 2.0 + OpenID Connect authorization server built from scratch with Node.js, Express, and PostgreSQL.

---

## What it does

This is a working OIDC provider that implements the Authorization Code flow end to end. A third-party app can register itself, redirect users here for login and consent, receive an authorization code, exchange it for tokens, and use those tokens to fetch user information.

---

## Demo Client

There is also a separate demo client app that uses this server to run the full OIDC flow end to end. It logs in with Alok Auth, exchanges the authorization code for tokens, stores the access token, and fetches basic user profile data from `userinfo`.

- Live app: `https://alok-auth-test-client-app.vercel.app`
- Repo: `https://github.com/AlokYadavCodes/alok-auth-test-client-app`

---

## Discovery

The standard `/.well-known/openid-configuration` endpoint is available. All supported endpoints, scopes, grant types, and capabilities can be found there.

---

## Client Registration

A client registers an app by providing a name, a website URL, and a redirect URI. In return it receives a client ID and a client secret. There is a simple UI for this as well.

---

## Authorization

When a client redirects a user here, the server validates the request upfront. The client ID must exist, the redirect URI must be an exact match against what was registered, and every requested scope must be one of the supported ones. If `openid` is missing from the scopes, the request is rejected. Only the `code` response type is supported.

Once validation passes, the server creates a flow object in the user's session that captures the full context: client ID, redirect URI, requested scopes, nonce, PKCE challenge, and a creation timestamp. Each flow gets a unique ID and lives for 5 minutes. If the user doesn't finish in time, the flow expires.

From here, one of three things happens:

1. **User is not logged in.** The user gets redirected to the login page. After logging in (or registering, which logs them in automatically), the flow picks back up.

2. **User is logged in but hasn't fully consented.** The user sees a consent page showing what the app wants. They can approve or deny.

3. **User is logged in and has already consented** to everything the client is asking for. Consent is skipped entirely, an authorization code is issued, and the user is redirected back to the client immediately.

---

## Consent

Consent is stored per user/client pair. When a user approves a request, the server doesn't replace their old consent with the new one. It merges them. If a user previously granted `email` and now the app asks for `profile`, the stored consent becomes `openid email profile`. Consent grows by union, not by replacement.

If the user denies, they get redirected back to the client with an `access_denied` error and the original state value. No code is issued.

---

## Authorization Code

After consent is granted or skipped, the server generates a random authorization code and stores it with the granted scopes, the nonce, the PKCE challenge (if any), and a 10-minute expiration. The user is redirected back to the client's redirect URI with this code and the state parameter.

The code is single-use. It gets deleted the moment it's successfully exchanged for tokens.

---

## Token Exchange

The server supports two grant types: `authorization_code` and `refresh_token`. Client authentication is done via `client_secret_post`, meaning the client sends its ID and secret in the request body.

### Authorization code exchange

The client sends the code, its credentials, and the redirect URI. The server checks that the code exists, belongs to the right client, hasn't expired, and that the redirect URI matches. If PKCE was used during authorization, the client must also send the code verifier, which is validated against the original challenge. On success, the server issues an access token, an ID token, and optionally a refresh token, then deletes the authorization code.

### Refresh token exchange

The client sends an existing refresh token along with its credentials. The server checks the token is valid and not expired, then performs **refresh token rotation**: the old token is deleted and a brand new access token + refresh token pair is issued. Each refresh token is single-use. If someone tries to replay an old one, it simply won't exist anymore.

If the client sends a `scope` parameter during refresh, every requested scope must be a subset of the original refresh token's scopes. You can narrow your scopes on refresh but you can never escalate them.

---

## PKCE

PKCE is supported with both `plain` and `S256` methods.

During the authorization request, the client can include a code challenge and a method. These get stored alongside the authorization code. At token exchange time, the client sends the code verifier. For `plain`, the verifier must exactly equal the stored challenge. For `S256`, the server computes `BASE64URL(SHA256(verifier))` and compares it to the stored challenge. If the verifier is missing or doesn't match, the exchange fails.

---

## ID Token

ID tokens are RS256-signed JWTs.

Every ID token includes the issuer, subject (user ID), audience (client ID), expiration (1 hour), and issued-at timestamp. Beyond that, extra claims are added based on which scopes were granted:

- `email` scope adds `email` and `email_verified`
- `profile` scope adds `name` and `picture`
- If a `nonce` was provided during authorization, it's included in the token

---

## JWKS

The server exposes the public half of its RSA signing key in JWK format. Clients use this to verify ID token signatures without needing the private key. The key is identified by a `kid` so clients can match it to the `kid` in the JWT header.

---

## UserInfo

Clients can fetch user claims by presenting a valid access token. The server looks up the token, checks if it's expired (deleting it if so), and returns claims based on the token's granted scopes. At minimum you always get the `sub` claim. With `email` you also get the email. With `profile` you get the name and profile picture.

---

## Scopes

| Scope | What it does |
|---|---|
| `openid` | Required on every request. Enables the OIDC layer and ID token issuance |
| `email` | Includes email claims in the ID token and userinfo |
| `profile` | Includes name and picture claims in the ID token and userinfo |
| `offline_access` | Causes a refresh token to be issued alongside the access token |

If any scope outside this list is requested, the authorization request is rejected.

---

## Token Lifetimes

| What | How long |
|---|---|
| Authorization flow (session state) | 5 minutes |
| Authorization code | 10 minutes |
| Access token | 1 hour |
| Refresh token | 7 days |

---

## Access Revocation

Users can see which apps they've authorized from their account dashboard and revoke access for any of them. Revoking an app wipes everything tied to that user/client pair: the consent record, all access tokens, all refresh tokens, and any pending authorization codes. The app would need to go through the full authorization and consent flow again.
