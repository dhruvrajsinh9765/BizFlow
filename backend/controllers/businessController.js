const businessService = require("../services/businessService");

const createBusiness = async (req, res) => {
    const result = await businessService.createBusiness(
        req.user._id,
        req.body
    );

    res.status(201).send(result);
};

const getBusiness = async (req, res) => {
    const result = await businessService.getBusiness(req.user._id);

    res.send(result);
};

const updateBusiness = async (req, res) => {
    const result = await businessService.updateBusiness(
        req.user._id,
        req.body
    );

    res.send(result);
};

module.exports = {
    createBusiness,
    getBusiness,
    updateBusiness
};