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
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    return business;
};

const updateBusiness = async (userId, businessData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const allowedFields = [
        "businessName",
        "businessType",
        "phone",
        "email",
        "address"
    ];

    allowedFields.forEach((field) => {
        if (businessData[field] !== undefined) {
            business[field] = businessData[field];
        }
    });

    const updatedBusiness = await business.save();

    return {
        message: "Business updated successfully",
        business: updatedBusiness
    };
};

module.exports = {
    createBusiness,
    getBusiness,
    updateBusiness
};