class ApiError extends Error {
    constructor(statusCode, message, data = null) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }

    static badRequest(message, data = null) {
        return new ApiError(400, message, data);
    }

    static unauthorized(message, data = null) {
        return new ApiError(401, message, data);
    }

    static forbidden(message, data = null) {
        return new ApiError(403, message, data);
    }

    static notFound(message, data = null) {
        return new ApiError(404, message, data);
    }

    static conflict(message, data = null) {
        return new ApiError(409, message, data);
    }

    static internal(message = "Internal Server Error", data = null) {
        return new ApiError(500, message, data);
    }
}

export default ApiError;