import { pool } from "../../db/pool.js";

async function createClientApp({ appName, websiteUrl, redirectUri, clientId, clientSecret }) {
    await pool.query(
        `INSERT INTO oauth_clients (app_name, website_url, redirect_uri, client_id, client_secret)
         VALUES ($1, $2, $3, $4, $5)`,
        [appName, websiteUrl, redirectUri, clientId, clientSecret]
    );
}

export { createClientApp };
