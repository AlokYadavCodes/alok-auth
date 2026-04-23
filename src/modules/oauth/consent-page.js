function renderConsentPage({ appName, websiteUrl, scopes, flowId }) {
    const scopeItems = scopes.map((scope) => `<li>${escapeHtml(scope)}</li>`).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consent — Alok Auth</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        body::before {
            content: '';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
            pointer-events: none;
        }
        .container {
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 12px;
            padding: 48px 40px 40px;
            width: 100%;
            max-width: 420px;
            position: relative;
            color: #ededed;
        }
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        }
        .brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 32px;
        }
        .brand-logo {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: 600;
            font-size: 14px;
        }
        .brand-name {
            font-size: 15px;
            font-weight: 600;
            color: #ededed;
            letter-spacing: -0.3px;
        }
        h1 {
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.5px;
            text-align: center;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #71717a;
            text-align: center;
            font-size: 14px;
            margin-bottom: 28px;
            line-height: 1.5;
        }
        .card {
            border: 1px solid #1f1f1f;
            background: #111;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 24px;
        }
        .card strong {
            display: block;
            font-size: 15px;
            margin-bottom: 6px;
        }
        .card a {
            color: #a1a1aa;
            text-decoration: none;
            font-size: 13px;
        }
        .card a:hover {
            color: #ededed;
        }
        .scope-label {
            font-size: 13px;
            color: #a1a1aa;
            margin-bottom: 10px;
        }
        ul {
            list-style: none;
            display: grid;
            gap: 10px;
            margin-bottom: 28px;
        }
        li {
            border: 1px solid #27272a;
            border-radius: 8px;
            padding: 12px;
            background: #0a0a0a;
            font-size: 14px;
        }
        .actions {
            display: flex;
            gap: 10px;
        }
        button {
            flex: 1;
            padding: 10px 0;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }
        .approve {
            background: #ededed;
            color: #0a0a0a;
            border: none;
        }
        .approve:hover { background: #fff; }
        .deny {
            background: transparent;
            color: #ededed;
            border: 1px solid #27272a;
        }
        .deny:hover { border-color: #52525b; }
        @media (max-width: 440px) {
            .container { margin: 16px; padding: 36px 24px 32px; }
            .actions { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="brand">
            <div class="brand-logo">A</div>
            <span class="brand-name">Alok Auth</span>
        </div>
        <h1>Approve access</h1>
        <p class="subtitle">${escapeHtml(appName)} wants permission to access your account.</p>
        <div class="card">
            <strong>${escapeHtml(appName)}</strong>
            <a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noreferrer">${escapeHtml(websiteUrl)}</a>
        </div>
        <p class="scope-label">Requested scopes</p>
        <ul>${scopeItems}</ul>
        <form method="post" action="/auth/consent">
            <input type="hidden" name="flow" value="${escapeHtml(flowId)}">
            <div class="actions">
                <button class="deny" type="submit" name="decision" value="deny">Deny</button>
                <button class="approve" type="submit" name="decision" value="approve">Allow</button>
            </div>
        </form>
    </div>
</body>
</html>`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export { renderConsentPage };
