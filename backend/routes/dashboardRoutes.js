const express = require("express");

const {
    getDashboardSummary,
    getFinancialAnalytics
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getDashboardSummary);

router.get("/analytics", protect, getFinancialAnalytics);

module.exports = router;