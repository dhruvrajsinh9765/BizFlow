const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {
    res.send("Register User");
});

router.post("/login", (req, res) => {
    res.send("Login User");
});

router.post("/logout", (req, res) => {
    res.send("Logout User");
});

router.get("/profile", (req, res) => {
    res.send("Get User Profile");
});

router.put("/profile", (req, res) => {
    res.send("Update User Profile");
});

module.exports = router;