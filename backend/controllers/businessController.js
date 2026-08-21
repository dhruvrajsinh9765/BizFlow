const businessService = require("../services/businessService");

const createBusiness = async (req, res) => {
    const result = await businessService.createBusiness(req.body);
    res.send(result);
};

const getBusiness = async (req, res) => {
    const result = await businessService.getBusiness();
    res.send(result);
};

const updateBusiness = async (req, res) => {
    const result = await businessService.updateBusiness(null, req.body);
    res.send(result);
};

module.exports = {
    createBusiness,
    getBusiness,
    updateBusiness
};
