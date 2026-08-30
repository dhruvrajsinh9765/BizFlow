const Business = require("../models/Business");
const BusinessContact = require("../models/BusinessContact");
const AppError = require("../utils/Apperror");


const createBusinessContact = async (userId, contactData = {}) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const fields = Object.keys(contactData);

    if (fields.length === 0) {
        throw new AppError(
            "Please provide contact details",
            400
        );
    }

    if (
        contactData.name === undefined ||
        contactData.name === null ||
        contactData.name.trim() === ""
    ) {
        throw new AppError(
            "Contact name is required",
            400
        );
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
        businessId: business._id,
        isActive: true
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
        businessId: business._id,
        isActive: true
    });

    if (!contact) {
        throw new AppError("Contact not found", 404);
    }

    return contact;
};


const updateBusinessContact = async (
    userId,
    contactId,
    contactData = {}
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

    const fieldsToUpdate = Object.keys(contactData);

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
            "Please provide valid contact details to update",
            400
        );
    }

    const updateData = {};

    validFields.forEach((field) => {
        updateData[field] = contactData[field];
    });

    if (
        updateData.name !== undefined &&
        (
            updateData.name === null ||
            updateData.name.trim() === ""
        )
    ) {
        throw new AppError(
            "Contact name cannot be empty",
            400
        );
    }

    const contact = await BusinessContact.findOneAndUpdate(
        {
            _id: contactId,
            businessId: business._id,
            isActive: true
        },
        updateData,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!contact) {
        throw new AppError("Contact not found", 404);
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

    const contact = await BusinessContact.findOneAndUpdate(
        {
            _id: contactId,
            businessId: business._id,
            isActive: true
        },
        {
            isActive: false
        },
        {
            returnDocument: "after"
        }
    );

    if (!contact) {
        throw new AppError("Contact not found", 404);
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