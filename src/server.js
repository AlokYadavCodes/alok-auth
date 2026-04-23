import app from "./app.js";
import { env } from "./config/env.js";
import { ensureDBConnected } from "./db/pool.js";

ensureDBConnected().then(() => {
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
});
