const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (userData) => {
    const { name, email, password } = userData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists");
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

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordMatched) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return {
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    };
};

const logoutUser = async () => {
    return "Logout User Service";
};

const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

const updateUserProfile = async (userId, userData) => {
    const { name, email, password } = userData;

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("Email already exists");
        }

        user.email = email;
    }

    if (name) {
        user.name = name;
    }

    if (password) {
        user.password = await bcrypt.hash(password, 10);
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
    logoutUser,
    getUserProfile,
    updateUserProfile
};

