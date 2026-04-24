function renderSiteLayout({
    pageTitle,
    pageClassName = "",
    navClassName = "topbar-nav",
    navHtml,
    frameContent,
    content = "",
    extraCss = "",
}) {
    const pageClasses = ["page", pageClassName].filter(Boolean).join(" ");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(pageTitle)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        *,
        *::before,
        *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
            min-height: 100%;
        }

        body {
            min-height: 100vh;
            background: #000;
            color: #ededed;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background:
                radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.05), transparent 28%),
                radial-gradient(circle at 80% 0%, rgba(255, 255, 255, 0.03), transparent 24%);
            pointer-events: none;
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        .page {
            width: 100%;
            max-width: 1040px;
            margin: 0 auto;
            padding: 28px 20px 56px;
            position: relative;
        }

        .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 18px;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
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
            font-size: 14px;
            font-weight: 600;
            line-height: 1;
        }

        .brand-name {
            font-size: 15px;
            font-weight: 600;
            color: #ededed;
            letter-spacing: -0.3px;
            white-space: nowrap;
        }

        .topbar-nav {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
        }

        .topbar-nav a,
        .topbar-nav button {
            padding: 9px 12px;
            border: 1px solid transparent;
            border-radius: 999px;
            color: #a1a1aa;
            font-size: 13px;
            font-weight: 500;
            background: transparent;
            font-family: inherit;
            cursor: pointer;
            transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
        }

        .topbar-nav a:hover,
        .topbar-nav button:hover {
            color: #ededed;
            border-color: #1f1f1f;
            background: rgba(255, 255, 255, 0.02);
        }

        .topbar-nav form {
            margin: 0;
        }

	        .frame {
	            background: #0a0a0a;
	            border: 1px solid #1a1a1a;
	            border-radius: 20px;
            padding: 24px;
            position: relative;
            overflow: hidden;
        }

        .frame::before {
            content: '';
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        }

        .hero {
            display: grid;
            grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.9fr);
            gap: 18px;
            align-items: stretch;
        }

        .hero-main {
            padding: 16px 8px 8px 4px;
        }

        .section-label {
            font-size: 11px;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 0.9px;
            margin-bottom: 12px;
        }

        .hero h1 {
            font-size: clamp(2.3rem, 5vw, 4.4rem);
            line-height: 0.96;
            letter-spacing: -1.8px;
            max-width: 560px;
        }

        .hero-copy {
            max-width: 560px;
            margin-top: 18px;
            color: #a1a1aa;
            font-size: 15px;
            line-height: 1.75;
        }

	        .hero-side {
	            display: flex;
	            flex-direction: column;
	            gap: 12px;
	        }

	        .footer {
	            margin-top: 34px;
	            padding-top: 18px;
	            border-top: 1px solid #1a1a1a;
	            text-align: center;
	            color: #a1a1aa;
	            font-size: 13px;
	            line-height: 1.6;
	        }

	        .footer a {
	            color: #ededed;
	            text-decoration: underline;
	            text-decoration-color: #27272a;
	            text-underline-offset: 3px;
	        }

	        .footer a:hover {
	            text-decoration-color: #3f3f46;
	        }

	        @media (max-width: 900px) {
	            .hero,
	            .content-grid {
	                grid-template-columns: 1fr;
            }

            .hero-main {
                padding-right: 0;
            }
        }

        @media (max-width: 640px) {
            .page {
                padding: 16px 16px 40px;
            }

            .frame {
                padding: 18px;
                border-radius: 16px;
            }

            .hero h1 {
                letter-spacing: -1.2px;
            }

            .topbar-nav {
                width: 100%;
            }

            .topbar-nav a,
            .topbar-nav button {
                width: auto;
                justify-content: center;
            }

            .topbar-nav form {
                width: auto;
            }

            .topbar-nav.topbar-nav-authenticated {
                justify-content: flex-start;
                width: auto;
                margin-left: auto;
            }

	            .topbar-nav.topbar-nav-authenticated a:not(.github-nav-link) {
	                display: none;
	            }

            .topbar-nav.topbar-nav-authenticated form {
                width: auto;
                margin: 0;
            }

            .topbar-nav.topbar-nav-authenticated button {
                display: inline-flex;
                min-width: 96px;
                max-width: 140px;
                width: auto;
                justify-content: center;
            }
        }

        ${extraCss}
    </style>
</head>
<body>
	    <main class="${pageClasses}">
	        <header class="topbar">
	            <a class="brand" href="/">
	                <div class="brand-logo">A</div>
	                <span class="brand-name">Alok Auth</span>
	            </a>
	            <nav class="${escapeAttribute(navClassName)}">
	                ${navHtml}
	            </nav>
	        </header>

	        <section class="frame">
	            ${frameContent}
	        </section>

	        ${content}
	        <footer class="footer">
	            Made with ❤️ by
	            <a href="https://x.com/alokcodes" target="_blank" rel="noreferrer" aria-label="Alok on X (@alokcodes)">Alok</a>
	        </footer>
	    </main>
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

function escapeAttribute(value) {
    return escapeHtml(value);
}

export { escapeAttribute, escapeHtml, renderSiteLayout };
