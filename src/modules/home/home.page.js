import { escapeAttribute, escapeHtml, renderSiteLayout } from "../shared/site-layout.js";

const authServerRepoUrl = "https://github.com/AlokYadavCodes/alok-auth";
const testClientRepoUrl = "https://github.com/AlokYadavCodes/alok-auth";
const testClientLiveUrl = "https://github.com/AlokYadavCodes/alok-auth";

function renderHomepage({ currentUser }) {
    const topbarNavClassName = currentUser
        ? "topbar-nav topbar-nav-home topbar-nav-authenticated"
        : "topbar-nav topbar-nav-home";
    const githubNavLink = `
        <a class="github-nav-link" href="${escapeAttribute(authServerRepoUrl)}" target="_blank" rel="noreferrer" aria-label="Auth server GitHub repository" title="Auth server GitHub repository">
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.29 6.8 5.47 7.9.4.08.55-.18.55-.4 0-.2-.01-.87-.01-1.58-2.01.45-2.53-.51-2.69-.98-.09-.24-.48-.98-.82-1.18-.28-.16-.68-.56-.01-.57.63-.01 1.08.6 1.23.85.72 1.25 1.87.9 2.33.69.07-.54.28-.9.5-1.11-1.78-.21-3.64-.92-3.64-4.1 0-.91.31-1.65.82-2.23-.08-.21-.36-1.06.08-2.2 0 0 .67-.22 2.2.85a7.26 7.26 0 0 1 4 0c1.53-1.08 2.2-.85 2.2-.85.44 1.14.16 1.99.08 2.2.51.58.82 1.31.82 2.23 0 3.19-1.87 3.88-3.65 4.09.29.26.54.75.54 1.52 0 1.1-.01 1.98-.01 2.25 0 .22.15.49.55.4A8.36 8.36 0 0 0 16 8.33C16 3.73 12.42 0 8 0Z"></path>
            </svg>
        </a>
    `;
    const topbarNav = currentUser
        ? `
            <a href="/client/register">Register app</a>
            <a href="/account">Account</a>
            <a href="/account/apps">Authorized apps</a>
            ${githubNavLink}
            <form method="post" action="/auth/logout">
                <button type="submit">Logout</button>
            </form>
        `
        : `
            <a href="/client/register">Register app</a>
            <a href="/auth/login">Sign in</a>
            <a href="/auth/register">Create account</a>
            ${githubNavLink}
        `;

    const heroActions = currentUser
        ? `
            <a class="button-primary" href="/account">Go to account</a>
            <a class="button-secondary" href="/account/apps">Authorized apps</a>
        `
        : `
            <a class="button-primary" href="/client/register">Register app</a>
            <a class="button-secondary" href="/auth/login">Sign in</a>
            <a class="button-secondary" href="/auth/register">Create account</a>
        `;

    const userBanner = currentUser
        ? `
            <section class="user-banner">
                <div class="user-banner-copy">
                    <p class="section-label">Signed in</p>
                    <p class="user-email">${escapeHtml(currentUser.email)}</p>
                </div>
                <div class="user-banner-links">
                    <a href="/account">Account</a>
                    <a href="/account/apps">Authorized apps</a>
                    <form method="post" action="/auth/logout">
                        <button type="submit">Logout</button>
                    </form>
                </div>
            </section>
        `
        : "";

    const frameContent = `
        <div class="hero">
            <div class="hero-main">
                <p class="section-label">OAuth 2.0 + OpenID Connect</p>
                <h1>Alok Auth</h1>
                <p class="hero-copy">
                    I built this project to understand how an auth server actually works under the hood. Instead of
                    only reading about OAuth 2.0 and OpenID Connect, I wanted to implement the moving parts myself:
                    login, consent, authorization codes, ID tokens, access tokens, refresh tokens, sessions, and the
                    redirects that hold the whole flow together.
                </p>
                <p class="hero-copy hero-copy-secondary">
                    This is a working OpenID Connect-first server. The flow requires the <code>openid</code> scope, 
                    as it is designed around OIDC's identity layer on top of OAuth 2.0. It follows standard OIDC 
                    behavior closely, so a client can switch between this server and providers like Google just by 
                    changing configuration (issuer, client ID, client secret), without modifying application logic.                </p>
                <div class="hero-actions">
                    ${heroActions}
                </div>
            </div>

	            <aside class="hero-side">
	                <section class="mini-panel demo-panel">
	                    <h2>Try it practically</h2>
	                    <p>
	                        I also built a small demo client that uses this auth server to run the full OIDC flow end-to-end. It handles login, 
	                        exchanges the authorization code for tokens, and displays basic user profile details like name, email, and avatar.

	                    </p>
	                    <div class="demo-ctas" aria-label="Try it live links">
	                        <a class="demo-cta demo-cta-primary" href="${escapeAttribute(testClientLiveUrl)}" target="_blank" rel="noreferrer">Try it live</a>
	                        <a class="demo-cta demo-cta-secondary" href="${escapeAttribute(testClientRepoUrl)}" target="_blank" rel="noreferrer">GitHub</a>
	                    </div>
	                </section>
	                <section class="mini-panel">
	                    <h2>What it supports</h2>
	                    <ul>
	                        <li>Authorization Code Flow</li>
	                        <li>PKCE, state, and nonce</li>
	                        <li>ID tokens, access tokens, and refresh tokens</li>
	                        <li>OIDC discovery and userinfo</li>
                        <li>Consent-based access control</li>
                        <li>Client registration</li>
                    </ul>
                </section>
            </aside>
        </div>

        ${userBanner}
    `;

    const content = `
        <section class="story-grid">
            <article class="content-card content-card-wide">
                <p class="section-label">What this is</p>
                <h2>I wanted to learn the system by building the system.</h2>
                <p>
                    I've always found OAuth and OpenID Connect interesting, and at some point I wanted to go beyond just reading about them 
                    and actually build one myself.
                </p>
                <p>
                    So this server became my way of learning the protocol by implementing it end to end covering login, consent, tokens,
                     and the full flow behind the scenes.
                </p>
            </article>

            <article class="content-card">
                <p class="section-label">How it works</p>
                <h2>The flow</h2>
                <ol>
                    <li>A client app registers and gets credentials.</li>
                    <li>It sends the user to <code>/authorization</code>.</li>
                    <li>If the user is not logged in, I send them to login.</li>
                    <li>If they are logged in, I skip login.</li>
                    <li>If consent is missing, I show consent.</li>
                    <li>If consent already exists, I skip that too.</li>
                    <li>The server issues an authorization code.</li>
                    <li>The client exchanges that code at <code>/token</code>.</li>
                    <li>The response includes an ID token, an access token, and a refresh token when offline access is requested.</li>
                    <li>The client can call <code>/userinfo</code> for user claims.</li>
                </ol>
            </article>

            <article class="content-card">
                <p class="section-label">Runtime details</p>
                <h2>How it behaves in practice</h2>
                <ul>
                    <li>Sessions are server-side and stored in Postgres.</li>
                    <li>Each <code>/authorization</code> request creates a separate flow object in session.</li>
                    <li>A single user can have multiple client flows active in parallel.</li>
                    <li>Consent is persisted and reused.</li>
                    <li>Revoking access removes stored consent and invalidates issued tokens.</li>
                </ul>
            </article>

            <article class="content-card">
                <p class="section-label">User side</p>
                <h2>What a user can do after signing in</h2>
                <p>
                    When signed in to this server:
                    <ul>
                        <li> View all apps that have been granted access </li>
                        <li> Review scopes and permissions </li>
                        <li> Revoke access for any app </li>
                        <li> Manage basic profile details </li>
                    </ul>
                </p>
                <p>
                    Revoking access removes both stored consent and issued tokens for that app.
                </p>
            </article>

            <article class="content-card">
                <p class="section-label">Limitations</p>
                <h2>Current constraints of the implementation</h2>
                <ul>
                    <li>Sessions are stored in Postgres instead of Redis or a faster dedicated session store.</li>
                    <li>Client registration does not require authentication, to keep the setup simple.</li>
                    <li>Signing keys are static and there is no JWKS rotation.</li>
                    <li>The server's public and private signing keys are currently stored in <code>.env</code> instead of a proper secret manager.</li>
                    <li>There is no rate limiting or abuse protection.</li>
                </ul>
            </article>

            <article class="content-card content-card-wide">
                <p class="section-label">Why I built it</p>
                <h2>I had already gone through the theory things like scopes, PKCE (code challenge), and the backend-to-backend token exchange, and I found the whole flow genuinely cool.</h2>
                <p>
                    That was enough reason for me to try building it myself and see how it actually works when everything is wired together.
                    <ul>
                        <li>How does <code>state</code> survive across multiple redirects?</li>
                        <li>Where do <code>nonce</code> and PKCE actually fit in the flow?</li>
                        <li>What happens when multiple auth flows run in parallel for the same user?</li>
                    </ul>
                </p>
                <p>
                    This project is my way of learning those answers by implementing them, seeing the edge cases in code, and making the system behave the way I expect a real OIDC server to behave.
                </p>
            </article>
        </section>
    `;

    return renderSiteLayout({
        pageTitle: "Alok Auth",
        navClassName: topbarNavClassName,
        navHtml: topbarNav,
        frameContent,
        content,
        extraCss: `
            .hero-copy-secondary {
                margin-top: 14px;
            }

            .hero-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 26px;
            }

            .button-primary,
            .button-secondary,
            .user-banner-links a,
            .user-banner-links button {
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
            }

            .button-primary {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 42px;
                padding: 0 16px;
                background: #ededed;
                color: #0a0a0a;
            }

            .button-secondary {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 42px;
                padding: 0 16px;
                border: 1px solid #27272a;
                color: #ededed;
                background: transparent;
            }

            .mini-panel,
            .content-card {
                background: #0d0d0d;
                border: 1px solid #1a1a1a;
                border-radius: 14px;
                padding: 16px;
            }

            .mini-panel h2,
            .content-card h2 {
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #ededed;
            }

            .mini-panel p,
            .mini-panel li,
            .content-card p,
            .content-card li {
                color: #a1a1aa;
                font-size: 14px;
                line-height: 1.75;
            }

            .mini-panel ul,
            .content-card ul,
            .content-card ol {
                padding-left: 18px;
            }

            .mini-panel li + li,
            .content-card li + li,
            .content-card p + p {
                margin-top: 8px;
            }

            .mini-panel code,
            .content-card code {
                color: #ededed;
                font-size: 12px;
            }

            .demo-panel {
                border-color: #2a2a2a;
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 0 18px rgba(255, 255, 255, 0.03);
            }

            .demo-panel h2 {
                font-size: 17px;
                letter-spacing: -0.2px;
            }

            .github-nav-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
            }

            .github-nav-link svg {
                width: 16px;
                height: 16px;
                fill: currentColor;
            }

	            .repo-link {
	                color: #ededed;
	                text-decoration: underline;
	                text-decoration-color: #27272a;
	                text-underline-offset: 3px;
	            }

	            .demo-ctas {
	                display: flex;
	                flex-wrap: wrap;
	                gap: 10px;
	                margin-top: 12px;
	            }

	            .demo-cta {
	                display: inline-flex;
	                align-items: center;
	                justify-content: center;
	                min-height: 34px;
	                padding: 0 12px;
	                border-radius: 999px;
	                text-decoration: none;
	                text-underline-offset: 0;
	                font-size: 14px;
	                font-weight: 600;
	                border: 1px solid transparent;
	                transition: transform 120ms ease, filter 120ms ease;
	                will-change: transform;
	            }

	            .demo-cta:hover {
	                transform: translateY(-1px);
	                filter: brightness(1.03);
	            }

	            .demo-cta:focus-visible {
	                outline: 2px solid rgba(255, 255, 255, 0.65);
	                outline-offset: 2px;
	            }

	            .demo-cta-primary {
	                background: #ffffff;
	                border-color: #ffffff;
	                color: #0b0b0b;
	            }

	            .demo-cta-secondary {
                	background: #0b0b0b;
	                border-color: #1f1f1f;
	                color: #ffffff;
	            }

            .user-banner {
                margin-top: 18px;
                padding: 16px;
                background: #0d0d0d;
                border: 1px solid #1a1a1a;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 14px;
            }

            .user-banner-copy {
                min-width: 0;
            }

            .user-email {
                font-size: 14px;
                color: #ededed;
                word-break: break-word;
            }

            .user-banner-links {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .user-banner-links a,
            .user-banner-links button {
                padding: 10px 12px;
                border: 1px solid #27272a;
                background: transparent;
                color: #ededed;
                cursor: pointer;
                font-family: inherit;
            }

            .user-banner-links form {
                margin: 0;
            }

            .story-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 14px;
                margin-top: 14px;
            }

            .content-card-wide {
                grid-column: span 2;
            }

            @media (max-width: 900px) {
                .story-grid {
                    grid-template-columns: 1fr;
                }

                .content-card-wide {
                    grid-column: span 1;
                }
            }

	            @media (max-width: 640px) {
	                .topbar-nav-home {
	                    width: auto;
	                    margin-left: auto;
	                }

	                .topbar-nav-home:not(.topbar-nav-authenticated) a:not(.github-nav-link) {
	                    display: none;
	                }

	                .user-banner {
	                    flex-direction: column;
	                    align-items: flex-start;
	                }

                .topbar-nav,
                .user-banner-links {
                    width: 100%;
                }

	                .topbar-nav:not(.topbar-nav-authenticated) a:not(.github-nav-link),
	                .button-primary,
	                .button-secondary,
	                .user-banner-links a,
	                .user-banner-links button {
	                    width: 100%;
	                    justify-content: center;
	                }

                .hero-actions {
                    flex-direction: column;
                }

                .topbar-nav.topbar-nav-authenticated {
                    width: auto;
                }

                .user-banner-links form {
                    width: 100%;
                }
            }
        `,
    });
}

export { renderHomepage };
