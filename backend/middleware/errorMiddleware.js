const errorHandler = (err, req, res, next) => {
    let statusCode =
        err.statusCode ||
        (res.statusCode === 200 ? 500 : res.statusCode);

    let message = err.message || "Internal Server Error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;

        message = Object.values(err.errors)
            .map((error) => {
                if (
                    error.name === "CastError" &&
                    error.path === "transactionDate"
                ) {
                    return "Invalid transaction date";
                }

                return error.message;
            })
            .join(", ");
    }

    // Direct Mongoose cast error
    if (err.name === "CastError") {
        statusCode = 400;

        if (err.path === "transactionDate") {
            message = "Invalid transaction date";
        } else {
            message = `Invalid ${err.path}`;
        }
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate value already exists";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;