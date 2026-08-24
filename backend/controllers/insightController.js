const insightService = require("../services/insightService");

const generateBusinessInsights = async (req, res) => {
    const result = await insightService.generateBusinessInsights(
        req.user._id
    );

    res.send(result);
};

module.exports = {
    generateBusinessInsights
};