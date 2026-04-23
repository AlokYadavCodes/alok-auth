function errorHandler(err, req, res, next) {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const data = err.data || null;
    res.status(statusCode).send({
        error: {
            message,
            data,
        },
    });
}

export default errorHandler;
