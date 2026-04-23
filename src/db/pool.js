import "../config/env.js";
import pg from "pg";
import { env } from "../config/env.js";

const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  }
});

pool.on("error", (err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});

const ensureDBConnected = async () => {
  try {
    const client = await pool.connect();
    console.log(
      `PostgreSQL connected | DB: ${client.database}`
    );
    client.release();
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

export { pool, ensureDBConnected };
