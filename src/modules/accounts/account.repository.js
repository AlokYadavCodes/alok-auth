import { pool } from "../../db/pool.js";

async function findUserByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
}

async function findUserById(userId) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    return result.rows[0] || null;
}

async function findAuthorizedAppCountByUserId(userId) {
    const result = await pool.query(
        "SELECT COUNT(*) AS total FROM oauth_consents WHERE user_id = $1",
        [userId]
    );
    return result.rows[0]?.total || 0;
}

async function findAuthorizedAppsByUserId(userId) {
    const result = await pool.query(
        `SELECT
            oc.client_id,
            oc.scope,
            oc.updated_at,
            c.app_name,
            c.website_url
         FROM oauth_consents oc
         JOIN oauth_clients c ON c.client_id = oc.client_id
         WHERE oc.user_id = $1
         ORDER BY oc.updated_at DESC, c.app_name ASC`,
        [userId]
    );
    return result.rows;
}

async function createUser({ name, email, passwordHash, profileImageUrl }) {
    await pool.query(
        "INSERT INTO users (name, email, password, profile_image_url) VALUES ($1, $2, $3, $4)",
        [name, email, passwordHash, profileImageUrl]
    );
}

async function updateUserProfileImage({ userId, profileImageUrl }) {
    const result = await pool.query(
        "UPDATE users SET profile_image_url = $2 WHERE id = $1",
        [userId, profileImageUrl]
    );
}

async function revokeClientAccess({ userId, clientId }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await client.query(
            "DELETE FROM access_tokens WHERE user_id = $1 AND client_id = $2",
            [userId, clientId]
        );
        await client.query(
            "DELETE FROM refresh_tokens WHERE user_id = $1 AND client_id = $2",
            [userId, clientId]
        );
        await client.query(
            "DELETE FROM auth_short_codes WHERE user_id = $1 AND client_id = $2",
            [userId, clientId]
        );

        const result = await client.query(
            "DELETE FROM oauth_consents WHERE user_id = $1 AND client_id = $2 RETURNING id",
            [userId, clientId]
        );

        await client.query("COMMIT");
        return result.rowCount > 0;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export {
    createUser,
    findAuthorizedAppCountByUserId,
    findAuthorizedAppsByUserId,
    findUserByEmail,
    findUserById,
    revokeClientAccess,
    updateUserProfileImage,
};
