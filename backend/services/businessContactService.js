const Business = require("../models/Business");
const BusinessContact = require("../models/BusinessContact");
const AppError = require("../utils/Apperror");


const createBusinessContact = async (userId, contactData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const contact = await BusinessContact.create({
        ...contactData,
        businessId: business._id
    });

    return {
        message: "Business contact created successfully",
        contact
    };
};


const getBusinessContacts = async (userId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const contacts = await BusinessContact.find({
        businessId: business._id
    });

    return contacts;
};


const getBusinessContactById = async (userId, contactId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const contact = await BusinessContact.findOne({
        _id: contactId,
        businessId: business._id
    });

    if (!contact) {
        throw new AppError("Business contact not found", 404);
    }

    return contact;
};


const updateBusinessContact = async (
    userId,
    contactId,
    contactData
) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const allowedFields = [
        "name",
        "phone",
        "email",
        "address"
    ];

    const fieldsToUpdate = Object.keys(contactData || {});

    // Empty request body
    if (fieldsToUpdate.length === 0) {
        throw new AppError(
            "At least one field is required to update the business contact",
            400
        );
    }

    // Keep only valid fields
    const validFields = fieldsToUpdate.filter((field) =>
        allowedFields.includes(field)
    );

    // Only unknown fields were provided
    if (validFields.length === 0) {
        throw new AppError(
            "No valid fields provided for update",
            400
        );
    }

    const updateData = {};

    validFields.forEach((field) => {
        updateData[field] = contactData[field];
    });

    const contact = await BusinessContact.findOneAndUpdate(
        {
            _id: contactId,
            businessId: business._id
        },
        updateData,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!contact) {
        throw new AppError("Business contact not found", 404);
    }

    return {
        message: "Business contact updated successfully",
        contact
    };
};


const deleteBusinessContact = async (userId, contactId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const contact = await BusinessContact.findOneAndDelete({
        _id: contactId,
        businessId: business._id
    });

    if (!contact) {
        throw new AppError("Business contact not found", 404);
    }

    return {
        message: "Business contact deleted successfully"
    };
};


module.exports = {
    createBusinessContact,
    getBusinessContacts,
    getBusinessContactById,
    updateBusinessContact,
    deleteBusinessContact
};