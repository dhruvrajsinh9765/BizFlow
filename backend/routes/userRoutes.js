const express = require("express");
const {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/profile", getUserProfile);

router.put("/profile", updateUserProfile);

module.exports = router;