const User = require("../models/User");
const { verifyAccessToken } = require("../utils/tokenUtils");
const AppError = require("../utils/Apperror");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(
                "Authorization token is missing",
                401
            );
        }

        const token = authHeader.split(" ")[1];

        let decoded;

        try {
            decoded = verifyAccessToken(token);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new AppError(
                    "Access token has expired",
                    401
                );
            }

            throw new AppError(
                "Invalid access token",
                401
            );
        }

        const user = await User.findById(decoded.id)
            .select("-password");

        if (!user) {
            throw new AppError(
                "User associated with this token was not found",
                401
            );
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = protect;