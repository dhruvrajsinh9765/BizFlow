const Business = require("../models/Business");
const AppError = require("../utils/Apperror");

const createBusiness = async (userId, businessData) => {
    const existingBusiness = await Business.findOne({ userId });

    if (existingBusiness) {
        throw new AppError(
            "Business already exists for this user",
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

    // Empty body
    if (fieldsToUpdate.length === 0) {
        throw new AppError(
            "At least one field is required to update the business",
            400
        );
    }

    // Check whether at least one valid field is provided
    const validFields = fieldsToUpdate.filter((field) =>
        allowedFields.includes(field)
    );

    if (validFields.length === 0) {
        throw new AppError(
            "No valid fields provided for update",
            400
        );
    }

    // Update only allowed fields
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