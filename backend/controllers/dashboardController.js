const dashboardService = require("../services/dashboardService");

const getDashboardSummary = async (req, res) => {
    const result = await dashboardService.getDashboardSummary(
        req.user.id
    );

    res.send(result);
};

const getFinancialAnalytics = async (req, res) => {
    const result = await dashboardService.getFinancialAnalytics(
        req.user.id,
        req.query
    );

    res.send(result);
};

module.exports = {
    getDashboardSummary,
    getFinancialAnalytics
};