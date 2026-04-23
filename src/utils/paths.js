import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(__dirname, "..");
const viewsPath = path.join(srcPath, "views");

export { srcPath, viewsPath };
