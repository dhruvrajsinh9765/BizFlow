const registerUser = (req, res) => {
    res.send("Register User");
};

const loginUser = (req, res) => {
    res.send("Login User");
};

const logoutUser = (req, res) => {
    res.send("Logout User");
};

const getUserProfile = (req, res) => {
    res.send("Get User Profile");
};

const updateUserProfile = (req, res) => {
    res.send("Update User Profile");
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
};