const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401);
            throw new Error("Not authorized, token missing");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            res.status(401);
            throw new Error("Not authorized, user not found");
        }

        req.user = user;

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            res.status(401);
            error.message = "Not authorized, invalid token";
        }

        if (error.name === "TokenExpiredError") {
            res.status(401);
            error.message = "Not authorized, token expired";
        }

        next(error);
    }
};

module.exports = protect;