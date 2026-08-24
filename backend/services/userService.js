const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Session = require("../models/Session");
const AppError = require("../utils/Apperror");

const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require("../utils/tokenUtils");


const registerUser = async (userData) => {
    const { name, email, password } = userData;

    // Validate required fields
    if (
        !name?.trim() ||
        !email?.trim() ||
        !password?.trim()
    ) {
        throw new AppError(
            "Name, email and password are required",
            400
        );
    }

    // Validate password length before hashing
    if (password.length < 6) {
        throw new AppError(
            "Password must be at least 6 characters long",
            400
        );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    return {
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    };
};


const loginUser = async (userData) => {
    const { email, password } = userData;

    // Validate required fields
    if (!email || !password) {
        throw new AppError(
            "Email and password are required",
            400
        );
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordMatched) {
        throw new AppError("Invalid email or password", 401);
    }

    const refreshTokenExpiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // Generate sessionId before creating the session
    const sessionId = new mongoose.Types.ObjectId();

    const accessToken = generateAccessToken(user._id);

    // Refresh token contains both userId and sessionId
    const refreshToken = generateRefreshToken(
        user._id,
        sessionId
    );

    // Store only the hashed refresh token in database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Create complete session
    await Session.create({
        _id: sessionId,
        userId: user._id,
        refreshTokenHash,
        expiresAt: refreshTokenExpiresAt
    });

    return {
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    };
};


const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError("Refresh token missing", 401);
    }

    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        throw new AppError(
            "Invalid or expired refresh token",
            401
        );
    }

    const session = await Session.findOne({
        _id: decoded.sessionId,
        userId: decoded.id
    });

    if (!session) {
        throw new AppError("Session not found", 401);
    }

    if (session.expiresAt <= new Date()) {
        throw new AppError("Session expired", 401);
    }

    const isRefreshTokenMatched = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash
    );

    if (!isRefreshTokenMatched) {
        throw new AppError("Invalid refresh token", 401);
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const accessToken = generateAccessToken(user._id);

    return {
        message: "Access token refreshed successfully",
        accessToken
    };
};


const logoutUser = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError("Refresh token missing", 401);
    }

    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        throw new AppError(
            "Invalid or expired refresh token",
            401
        );
    }

    const session = await Session.findOne({
        _id: decoded.sessionId,
        userId: decoded.id
    });

    if (!session) {
        throw new AppError("Session not found", 401);
    }

    const isRefreshTokenMatched = await bcrypt.compare(
        refreshToken,
        session.refreshTokenHash
    );

    if (!isRefreshTokenMatched) {
        throw new AppError("Invalid refresh token", 401);
    }

    await Session.deleteOne({
        _id: session._id
    });

    return {
        message: "Logout successful"
    };
};


const logoutFromAllDevices = async (userId) => {
    await Session.deleteMany({
        userId
    });

    return {
        message: "Logged out from all devices successfully"
    };
};


const getUserProfile = async (userId) => {
    const user = await User.findById(userId)
        .select("-password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};


const updateUserProfile = async (userId, userData) => {
    const { name, email, password } = userData;

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new AppError("Email already exists", 409);
        }

        user.email = email;
    }

    if (name) {
        user.name = name;
    }

    if (password) {
    if (password.length < 6) {
        throw new AppError(
            "Password must be at least 6 characters long",
            400
        );
    }

    user.password = await bcrypt.hash(password, 10);

    // Password change invalidates all existing sessions
    await Session.deleteMany({
        userId
    });
}

    const updatedUser = await user.save();

    return {
        message: "Profile updated successfully",
        user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email
        }
    };
};


module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    logoutFromAllDevices,
    getUserProfile,
    updateUserProfile
};