const express = require("express");

const {
    generateBusinessInsights
} = require("../controllers/insightController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, generateBusinessInsights);

module.exports = router;