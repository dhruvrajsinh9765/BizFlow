const userService = require("../services/userService");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const registerUser = async (req, res) => {
    const result = await userService.registerUser(req.body);

    res.send(result);
};

const loginUser = async (req, res) => {
    const result = await userService.loginUser(req.body);

    res.cookie("refreshToken", result.refreshToken, cookieOptions);

    const { refreshToken, ...responseData } = result;

    res.send(responseData);
};

const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    const result = await userService.refreshAccessToken(
        refreshToken
    );

    res.send(result);
};

const logoutUser = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    const result = await userService.logoutUser(refreshToken);

    res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
});

    res.send(result);
};

const getUserProfile = async (req, res) => {
    const result = await userService.getUserProfile(req.user._id);

    res.send(result);
};

const updateUserProfile = async (req, res) => {
    const result = await userService.updateUserProfile(
        req.user._id,
        req.body
    );

    res.send(result);
};

const logoutFromAllDevices = async (req, res) => {
    const result = await userService.logoutFromAllDevices(
        req.user._id
    );

    res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
});

    res.send(result);
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