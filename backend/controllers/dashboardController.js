const dashboardService = require("../services/dashboardService");

const getDashboardSummary = async (req, res) => {
    const result = await dashboardService.getDashboardSummary(
        req.user.id
    );

    res.send(result);
};

module.exports = {
    getDashboardSummary
};