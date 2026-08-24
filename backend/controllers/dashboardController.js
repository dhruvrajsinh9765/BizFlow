const dashboardService = require("../services/dashboardService");

const getDashboardSummary = async (req, res) => {
    const result = await dashboardService.getDashboardSummary(
        req.user._id
    );

    res.send(result);
};

const getFinancialAnalytics = async (req, res) => {
    const result = await dashboardService.getFinancialAnalytics(
        req.user._id,
        req.query
    );

    res.send(result);
};

module.exports = {
    getDashboardSummary,
    getFinancialAnalytics
};