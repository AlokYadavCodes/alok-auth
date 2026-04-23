function requireSessionUser(req, res, next) {
    if (!req.session?.userId) {
        return res.status(401).send("Authentication required");
    }

    next();
}

export default requireSessionUser;
