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
        typeof contactData.name !== "string" ||
        !contactData.name.trim()
    ) {
        throw new AppError(
            "Contact name is required",
            400
        );
    }

    const allowedFields = [
        "name",
        "contactType",
        "phone",
        "email",
        "address"
    ];

    const contactDataToCreate = {};

    allowedFields.forEach((field) => {
        if (contactData[field] !== undefined) {
            contactDataToCreate[field] = contactData[field];
        }
    });

    if (contactDataToCreate.email) {
        contactDataToCreate.email =
            contactDataToCreate.email.trim().toLowerCase();
    }

    if (contactDataToCreate.phone) {
        contactDataToCreate.phone =
            contactDataToCreate.phone.trim();
    }

    // Check duplicate email within the same business
    if (contactDataToCreate.email) {
        const existingEmailContact =
            await BusinessContact.findOne({
                businessId: business._id,
                email: contactDataToCreate.email,
                isActive: true
            });

        if (existingEmailContact) {
            throw new AppError(
                "A contact with this email already exists",
                409
            );
        }
    }

    // Check duplicate phone within the same business
    if (contactDataToCreate.phone) {
        const existingPhoneContact =
            await BusinessContact.findOne({
                businessId: business._id,
                phone: contactDataToCreate.phone,
                isActive: true
            });

        if (existingPhoneContact) {
            throw new AppError(
                "A contact with this phone number already exists",
                409
            );
        }
    }

    try {
        const contact = await BusinessContact.create({
            ...contactDataToCreate,
            businessId: business._id
        });

        return {
            message: "Business contact created successfully",
            contact
        };
    } catch (error) {
        // Handles duplicate-key errors caused by the
        // database unique indexes during concurrent requests.
        if (error.code === 11000) {
            if (error.keyPattern?.email) {
                throw new AppError(
                    "A contact with this email already exists",
                    409
                );
            }

            if (error.keyPattern?.phone) {
                throw new AppError(
                    "A contact with this phone number already exists",
                    409
                );
            }
        }

        throw error;
    }
};

const getBusinessContacts = async (userId, filters = {}) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const { contactType } = filters;

    const query = {
        businessId: business._id,
        isActive: true
    };

    if (contactType !== undefined && contactType !== "") {
        if (!["customer", "supplier"].includes(contactType)) {
            throw new AppError(
                "Contact type must be either customer or supplier",
                400
            );
        }

        query.contactType = contactType;
    }

    const contacts = await BusinessContact.find(query);

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
        "contactType",
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
            typeof updateData.name !== "string" ||
            !updateData.name.trim()
        )
    ) {
        throw new AppError(
            "Contact name cannot be empty",
            400
        );
    }

    if (updateData.email !== undefined) {
        updateData.email = updateData.email
            .trim()
            .toLowerCase();

        if (!updateData.email) {
            delete updateData.email;
        }
    }

    if (updateData.phone !== undefined) {
        updateData.phone = updateData.phone.trim();

        if (!updateData.phone) {
            delete updateData.phone;
        }
    }

    // Check duplicate email when updating
    if (updateData.email) {
        const existingEmailContact =
            await BusinessContact.findOne({
                businessId: business._id,
                email: updateData.email,
                isActive: true,
                _id: { $ne: contactId }
            });

        if (existingEmailContact) {
            throw new AppError(
                "A contact with this email already exists",
                409
            );
        }
    }

    // Check duplicate phone when updating
    if (updateData.phone) {
        const existingPhoneContact =
            await BusinessContact.findOne({
                businessId: business._id,
                phone: updateData.phone,
                isActive: true,
                _id: { $ne: contactId }
            });

        if (existingPhoneContact) {
            throw new AppError(
                "A contact with this phone number already exists",
                409
            );
        }
    }

    try {
        const contact =
            await BusinessContact.findOneAndUpdate(
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
            throw new AppError(
                "Contact not found",
                404
            );
        }

        return {
            message: "Business contact updated successfully",
            contact
        };
    } catch (error) {
        if (error.code === 11000) {
            if (error.keyPattern?.email) {
                throw new AppError(
                    "A contact with this email already exists",
                    409
                );
            }

            if (error.keyPattern?.phone) {
                throw new AppError(
                    "A contact with this phone number already exists",
                    409
                );
            }
        }

        throw error;
    }
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

