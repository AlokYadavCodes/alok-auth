import { pool } from "../../db/pool.js";

async function findUserByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
}

async function findUserById(userId) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    return result.rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
    await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        [name, email, passwordHash]
    );
}

export { createUser, findUserByEmail, findUserById };
