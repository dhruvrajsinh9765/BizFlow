const userService = require("../services/userService");

const registerUser = async (req, res) => {
    const result = await userService.registerUser(req.body);
    res.send(result);
};

const loginUser = async (req, res) => {
    const result = await userService.loginUser(req.body);
    res.send(result);
};

const logoutUser = (req, res) => {
    res.send("Logout User");
};

const getUserProfile = async (req, res) => {
    const result = await userService.getUserProfile();
    res.send(result);
};

const updateUserProfile = async (req, res) => {
    const result = await userService.updateUserProfile(null, req.body);
    res.send(result);
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
};