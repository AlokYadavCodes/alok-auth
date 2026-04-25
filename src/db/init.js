import { pool, ensureDBConnected } from "./pool.js";

ensureDBConnected()
.then(async ()=>{
    const usersResult = await pool.query(
        `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(256) NOT NULL,
            email VARCHAR(256) NOT NULL UNIQUE,
            password VARCHAR(256),
            profile_image_url VARCHAR(512)
        )`
    )
    console.log("Users table:", usersResult.command);

    const clientsResult = await pool.query(
        `CREATE TABLE IF NOT EXISTS oauth_clients (
            id SERIAL PRIMARY KEY,
            app_name VARCHAR(256) NOT NULL,
            website_url VARCHAR(512) NOT NULL,
            redirect_uri VARCHAR(512) NOT NULL,
            client_id VARCHAR(64) NOT NULL UNIQUE,
            client_secret VARCHAR(128) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )`
    )
    console.log("OAuth clients table:", clientsResult.command);

    const authCodesResult = await pool.query(
        `CREATE TABLE IF NOT EXISTS auth_short_codes (
            id SERIAL PRIMARY KEY,
            code VARCHAR(64) NOT NULL UNIQUE,
            scope VARCHAR(256),
            nonce VARCHAR(64),
            code_challenge VARCHAR(256),
            code_challenge_method VARCHAR(16),
            client_id VARCHAR(64) NOT NULL,
            user_id INTEGER NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    )
    console.log("Auth short codes table:", authCodesResult.command);

    const accessTokensResult = await pool.query(
        `CREATE TABLE IF NOT EXISTS access_tokens (
            id SERIAL PRIMARY KEY,
            token VARCHAR(128) NOT NULL UNIQUE,
            scope VARCHAR(256) NOT NULL,
            client_id VARCHAR(64) NOT NULL,
            user_id INTEGER NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    )
    console.log("Access tokens table:", accessTokensResult.command);
    
    const refreshTokensResult = await pool.query(
        `CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            token VARCHAR(128) NOT NULL UNIQUE,
            scope VARCHAR(256) NOT NULL,
            client_id VARCHAR(64) NOT NULL,
            user_id INTEGER NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    )
    console.log("Refresh tokens table:", refreshTokensResult.command);

    const consentResult = await pool.query(
        `CREATE TABLE IF NOT EXISTS oauth_consents (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            client_id VARCHAR(64) NOT NULL,
            scope VARCHAR(256) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (client_id) REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (user_id, client_id)
        )`
    )
    console.log("OAuth consents table:", consentResult.command);

    console.log("All tables seeded successfully.");
    process.exit(0);
})
