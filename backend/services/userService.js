const registerUser = async (userData) => {
    return "Register User Service";
};

const loginUser = async (userData) => {
    return "Login User Service";
};

const getUserProfile = async (userId) => {
    return "Get User Profile Service";
};

const updateUserProfile = async (userId, userData) => {
    return "Update User Profile Service";
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
};