function requireAuthenticatedUser(req, res, next) {
    if (!req.session?.userId) {
        const params = new URLSearchParams();
        const returnTo = req.originalUrl;
        params.set("returnTo", returnTo);
        return res.redirect(`/auth/login?${params.toString()}`);
    }

    next();
}

export default requireAuthenticatedUser;
