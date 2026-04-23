import "dotenv/config";

const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    issuer: process.env.ISSUER || "http://localhost:3000",
    sessionSecret: process.env.SESSION_SECRET,
    sessionMaxAgeMs: Number(process.env.SESSION_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000),
    databaseUrl: process.env.DATABASE_URL,
    privateKey: process.env.PRIVATE_KEY,
    publicKey: process.env.PUBLIC_KEY,
};

export { env };
