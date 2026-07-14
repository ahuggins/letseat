<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>LetsEat Privacy Policy</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #fff7f6;
            --card: #ffffff;
            --ink: #18181b;
            --muted: #52525b;
            --line: #fecaca;
            --brand: #dc2626;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: "Avenir Next", "Segoe UI", Arial, sans-serif;
            color: var(--ink);
            background: radial-gradient(circle at top right, #ffe4e6, var(--bg));
            line-height: 1.55;
        }

        .wrap {
            width: min(860px, 100%);
            margin: 0 auto;
            padding: 28px 16px 48px;
        }

        .card {
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 24px;
        }

        h1,
        h2 {
            margin: 0 0 10px;
            line-height: 1.2;
        }

        h1 {
            font-size: 2rem;
        }

        h2 {
            margin-top: 24px;
            font-size: 1.2rem;
            color: var(--brand);
        }

        p,
        li {
            color: var(--ink);
        }

        .muted {
            color: var(--muted);
            margin-top: 6px;
        }

        ul {
            margin: 0;
            padding-left: 18px;
        }

        a {
            color: var(--brand);
        }

        .footer {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid var(--line);
            color: var(--muted);
            font-size: 0.95rem;
        }
    </style>
</head>

<body>
    <main class="wrap">
        <article class="card">
            <h1>LetsEat Privacy Policy</h1>
            <p class="muted">Last updated: July 14, 2026</p>

            <p>
                This Privacy Policy explains how LetsEat processes information when you use the LetsEat website and the
                "LetsEat - Add Recipes" Chrome extension.
            </p>

            <h2>Information We Process</h2>
            <ul>
                <li>Your LetsEat account information (such as name and email) when you create or use an account.</li>
                <li>Recipe URLs you choose to import through the extension.</li>
                <li>Recipe content parsed from URLs you submit for preview/import.</li>
                <li>Extension authentication token created by you in LetsEat.</li>
            </ul>

            <h2>How the Chrome Extension Works</h2>
            <ul>
                <li>The extension reads the current tab URL only when you use the extension popup.</li>
                <li>The extension sends that URL to LetsEat API endpoints to preview parseability and import recipes.</li>
                <li>Your personal access token is stored in your browser local extension storage.</li>
                <li>The token is used only to authenticate requests to LetsEat.</li>
            </ul>

            <h2>How We Use Information</h2>
            <ul>
                <li>Authenticate your requests.</li>
                <li>Import and store recipes in your LetsEat account.</li>
                <li>Operate, secure, and improve LetsEat services.</li>
            </ul>

            <h2>Data Sharing</h2>
            <p>
                LetsEat does not sell your personal information. We only share data with service providers when needed to
                operate the service, or when required by law.
            </p>

            <h2>Data Retention and Controls</h2>
            <ul>
                <li>You can revoke extension tokens from your LetsEat profile at any time.</li>
                <li>You can remove the stored extension token using the extension Disconnect action.</li>
                <li>You may request account deletion through LetsEat account settings.</li>
            </ul>

            <h2>Security</h2>
            <p>
                We apply reasonable technical and organizational safeguards to protect your information. No method of
                transmission or storage is completely secure.
            </p>

            <h2>Children's Privacy</h2>
            <p>
                LetsEat is not directed to children under 13, and we do not knowingly collect personal information from
                children under 13.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
                We may update this policy from time to time. We will update the "Last updated" date when changes are
                made.
            </p>

            <h2>Contact</h2>
            <p>
                If you have privacy questions or requests, contact us at
                <a href="mailto:privacy@andrewhuggins.com">privacy@andrewhuggins.com</a>.
            </p>

            <p class="footer">
                Company/Controller: LetsEat<br>
                Service URL: <a href="https://recipes.andrewhuggins.com">https://recipes.andrewhuggins.com</a>
            </p>
        </article>
    </main>
</body>

</html>
