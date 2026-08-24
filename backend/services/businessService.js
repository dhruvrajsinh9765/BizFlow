const Business = require("../models/Business");
const AppError = require("../utils/Apperror");

const createBusiness = async (userId, businessData) => {
    const existingBusiness = await Business.findOne({ userId });

    if (existingBusiness) {
        throw new AppError(
            "You have already created a business profile",
            409
        );
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
        throw new AppError("Business not found", 404);
    }

    return business;
};

const updateBusiness = async (userId, businessData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const allowedFields = [
        "businessName",
        "businessType",
        "phone",
        "email",
        "address"
    ];

    const fieldsToUpdate = Object.keys(businessData);

    if (fieldsToUpdate.length === 0) {
        throw new AppError(
            "Please provide at least one field to update",
            400
        );
    }

    const validFields = fieldsToUpdate.filter((field) =>
        allowedFields.includes(field)
    );

    if (validFields.length === 0) {
        throw new AppError(
            "Please provide valid business details to update",
            400
        );
    }

    validFields.forEach((field) => {
        business[field] = businessData[field];
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