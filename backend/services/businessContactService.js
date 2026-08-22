const Business = require("../models/Business");
const BusinessContact = require("../models/BusinessContact");

const createBusinessContact = async (userId, contactData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
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
        throw new Error("Business not found");
    }

    const contacts = await BusinessContact.find({
        businessId: business._id
    });

    return contacts;
};

const getBusinessContactById = async (userId, contactId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const contact = await BusinessContact.findOne({
        _id: contactId,
        businessId: business._id
    });

    if (!contact) {
        throw new Error("Business contact not found");
    }

    return contact;
};

const updateBusinessContact = async (userId, contactId, contactData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const { name, phone, email, address } = contactData;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;

    const contact = await BusinessContact.findOneAndUpdate(
        {
            _id: contactId,
            businessId: business._id
        },
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!contact) {
        throw new Error("Business contact not found");
    }

    return {
        message: "Business contact updated successfully",
        contact
    };
};

const deleteBusinessContact = async (userId, contactId) => {
    return "Delete Business Contact Service";
};

module.exports = {
    createBusinessContact,
    getBusinessContacts,
    getBusinessContactById,
    updateBusinessContact,
    deleteBusinessContact
};