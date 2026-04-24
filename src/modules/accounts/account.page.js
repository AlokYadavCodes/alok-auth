import { escapeAttribute, escapeHtml, renderSiteLayout } from "../shared/site-layout.js";

function renderAccountPage({ user, authorizedAppCount }) {
    authorizedAppCount = Number(authorizedAppCount) || 0;
    return renderAccountLayout({
        pageTitle: "Your account",
        heading: "Account",
        subtitle: "A minimal account view with your profile details and connected app summary.",
        user,
        sidebar: `
            <section class="mini-panel">
                <h2>Profile</h2>
                <p>${escapeHtml(user.email)}</p>
                <p>${escapeHtml(user.name || "No name on file")}</p>
            </section>
            <section class="mini-panel">
                <h2>Summary</h2>
                <p>${authorizedAppCount} authorized app${authorizedAppCount === 1 ? "" : "s"}</p>
                <p><a class="panel-link" href="/account/apps">Open authorized apps</a></p>
            </section>
        `,
        content: `
            <section class="content-grid account-grid">
                <article class="content-card">
                    <p class="section-label">Email</p>
                    <h2>${escapeHtml(user.email)}</h2>
                    <p class="supporting-text">Primary sign-in identity for this account.</p>
                </article>
                <article class="content-card">
                    <p class="section-label">Name</p>
                    <h2>${escapeHtml(user.name || "Not provided")}</h2>
                    <p class="supporting-text">Basic profile information available to OIDC clients when allowed.</p>
                </article>
                <article class="content-card">
                    <p class="section-label">Authorized apps</p>
                    <h2>${authorizedAppCount}</h2>
                    <p class="supporting-text">Applications with active consent recorded in the server.</p>
                    <a class="card-link" href="/account/apps">Review connected apps</a>
                </article>
            </section>
        `,
    });
}

function renderAuthorizedAppsPage({ user, apps, revoked }) {
    const notice = revoked
        ? `<div class="notice">Access was revoked. Consent and active tokens for that application were removed.</div>`
        : "";

    const sidebar = `
        <section class="mini-panel">
            <h2>User</h2>
            <p>${escapeHtml(user.email)}</p>
            <p>Authorized apps: ${apps.length}</p>
        </section>
        <section class="mini-panel">
            <h2>Source of truth</h2>
            <p>This list is driven by stored consent records, not inferred from tokens.</p>
        </section>
    `;

    const content = apps.length > 0
        ? `
            <section class="app-list">
                ${apps.map((app) => renderAuthorizedApp(app)).join("")}
            </section>
        `
        : `
            <section class="content-card empty-state">
                <p class="section-label">Authorized apps</p>
                <h2>No authorized apps</h2>
                <p class="supporting-text">This account does not currently have any active client consents.</p>
                <a class="card-link" href="/client/register">Register an app</a>
            </section>
        `;

    return renderAccountLayout({
        pageTitle: "Authorized apps",
        heading: "Authorized apps",
        subtitle: "Applications that currently have access to this account based on stored consent.",
        user,
        sidebar,
        notice,
        content,
    });
}

function renderAuthorizedApp(app) {
    return `
        <article class="content-card app-card">
            <div class="app-card-top">
                <div>
                    <p class="section-label">Application</p>
                    <h2>${escapeHtml(app.appName)}</h2>
                </div>
                <form method="post" action="/account/apps/${encodeURIComponent(app.clientId)}/revoke">
                    <button class="danger-button" type="submit">Revoke access</button>
                </form>
            </div>
            <dl class="detail-list">
                <div class="detail-item">
                    <dt>Website</dt>
                    <dd><a class="detail-link" href="${escapeAttribute(app.websiteUrl)}" target="_blank" rel="noreferrer">${escapeHtml(app.websiteUrl)}</a></dd>
                </div>
                <div class="detail-item">
                    <dt>Granted scopes</dt>
                    <dd>${app.grantedScopes.map((scope) => `<span class="scope-chip">${escapeHtml(scope)}</span>`).join("")}</dd>
                </div>
                <div class="detail-item">
                    <dt>Last updated</dt>
                    <dd>${escapeHtml(formatTimestamp(app.lastUpdated))}</dd>
                </div>
            </dl>
        </article>
    `;
}

function renderAccountLayout({ pageTitle, heading, subtitle, user, sidebar, content, notice = "" }) {
    const navHtml = `
        <a href="/">Home</a>
        <a href="/account">Account</a>
        <a href="/account/apps">Authorized apps</a>
        <a href="/client/register">Register app</a>
        <form method="post" action="/auth/logout">
            <button type="submit">Logout</button>
        </form>
    `;

    const frameContent = `
        <div class="hero">
            <div class="hero-main">
                <p class="section-label">Account area</p>
                <h1>${escapeHtml(heading)}</h1>
                <p class="hero-copy">${escapeHtml(subtitle)}</p>
                <div class="hero-meta">
                    <span>Signed in as</span>
                    <strong>${escapeHtml(user.email)}</strong>
                </div>
            </div>
            <aside class="hero-side">
                ${sidebar}
            </aside>
        </div>

        ${notice}
    `;

    return renderSiteLayout({
        pageTitle: `${pageTitle} - Alok Auth`,
        pageClassName: "account-layout",
        navClassName: "topbar-nav topbar-nav-authenticated",
        navHtml,
        frameContent,
        content,
        extraCss: `
            .hero h1 {
                font-size: clamp(2.3rem, 5vw, 4.2rem);
            }

            .hero-meta {
                margin-top: 22px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                border: 1px solid #1f1f1f;
                border-radius: 999px;
                color: #a1a1aa;
                font-size: 13px;
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
                font-size: 14px;
                font-weight: 600;
                color: #ededed;
                margin-bottom: 8px;
            }

            .mini-panel p,
            .supporting-text,
            .detail-list dt,
            .detail-list dd {
                color: #a1a1aa;
                font-size: 13px;
                line-height: 1.7;
            }

            .panel-link,
            .card-link,
            .detail-link {
                color: #ededed;
                text-decoration: underline;
                text-decoration-color: #27272a;
                text-underline-offset: 3px;
            }

            .notice {
                margin-top: 14px;
                padding: 14px 16px;
                background: #0d0d0d;
                border: 1px solid #1f3a27;
                border-radius: 14px;
                color: #d4d4d8;
                font-size: 13px;
                line-height: 1.7;
            }

            .content-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 14px;
                margin-top: 14px;
            }

            .account-grid .content-card h2 {
                font-size: 20px;
                margin-bottom: 10px;
                letter-spacing: -0.5px;
            }

            .card-link {
                display: inline-flex;
                margin-top: 12px;
                font-size: 13px;
                font-weight: 500;
            }

            .app-list {
                display: grid;
                gap: 14px;
                margin-top: 14px;
            }

            .app-card-top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 6px;
            }

            .app-card h2 {
                font-size: 20px;
                letter-spacing: -0.5px;
                margin-bottom: 0;
            }

            .danger-button {
                padding: 10px 12px;
                border: 1px solid rgba(239, 68, 68, 0.22);
                border-radius: 8px;
                background: transparent;
                color: #fca5a5;
                font-size: 13px;
                font-weight: 600;
                font-family: inherit;
                cursor: pointer;
                white-space: nowrap;
            }

            .detail-list {
                display: grid;
                gap: 0;
                margin-top: 8px;
            }

            .detail-item {
                padding-top: 12px;
                border-top: 1px solid #1a1a1a;
            }

            .detail-item + .detail-item {
                margin-top: 12px;
            }

            .detail-list dt {
                margin-bottom: 6px;
            }

            .detail-list dd {
                margin: 0;
            }

            .scope-chip {
                display: inline-flex;
                align-items: center;
                margin: 0 8px 8px 0;
                padding: 6px 10px;
                border: 1px solid #27272a;
                border-radius: 999px;
                background: #0a0a0a;
                color: #ededed;
                font-size: 12px;
                line-height: 1;
            }

            .empty-state {
                margin-top: 14px;
            }

            @media (max-width: 640px) {
                .app-card-top {
                    align-items: flex-start;
                }

                .danger-button {
                    width: 100%;
                }

                .account-layout .topbar-nav.topbar-nav-authenticated {
                    width: auto;
                }
            }
        `,
    });
}

function formatTimestamp(value) {
    return new Date(value).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export {
    renderAccountPage,
    renderAuthorizedAppsPage,
};
