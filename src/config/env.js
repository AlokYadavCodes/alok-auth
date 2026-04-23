import "dotenv/config";

const env = {
    port: process.env.PORT || 3000,
    issuer: process.env.ISSUER || "http://localhost:3000",
    sessionSecret: process.env.SESSION_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    privateKey: process.env.PRIVATE_KEY,
    publicKey: process.env.PUBLIC_KEY,
};

export { env };
