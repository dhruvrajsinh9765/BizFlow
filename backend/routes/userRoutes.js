const express = require("express");

const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    logoutFromAllDevices,
    getUserProfile,
    updateUserProfile
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logoutUser);
router.post("/logout-all", protect, logoutFromAllDevices);

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;

