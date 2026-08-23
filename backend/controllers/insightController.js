const insightService = require("../services/insightService");

const generateBusinessInsights = async (req, res) => {
    const result = await insightService.generateBusinessInsights(
        req.user.id
    );

    res.send(result);
};

module.exports = {
    generateBusinessInsights
};