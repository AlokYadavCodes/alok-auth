import { getHomepageData } from "./home.service.js";
import { renderHomepage } from "./home.page.js";

async function showHomepage(req, res) {
    const pageData = await getHomepageData(req.session?.userId);
    res.send(renderHomepage(pageData));
}

export { showHomepage };
