const Business = require("../models/Business");

const createBusiness = async (userId, businessData) => {
    const existingBusiness = await Business.findOne({ userId });

    if (existingBusiness) {
        throw new Error("Business already exists for this user");
    }

    const business = await Business.create({
        ...businessData,
        userId
    });

    return {
        message: "Business created successfully",
        business
    };
};

const getBusiness = async (userId) => {
    return "Get Business Service";
};

const updateBusiness = async (userId, businessData) => {
    return "Update Business Service";
};

module.exports = {
    createBusiness,
    getBusiness,
    updateBusiness
};