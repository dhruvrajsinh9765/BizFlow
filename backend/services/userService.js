const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

const loginUser = async () => {
    return "Login User Service";
};

const logoutUser = async () => {
    return "Logout User Service";
};

const getUserProfile = async () => {
    return "Get User Profile Service";
};

const updateUserProfile = async () => {
    return "Update User Profile Service";
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
};