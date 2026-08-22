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
    return "Get All Business Contacts Service";
};

const getBusinessContactById = async (userId, contactId) => {
    return "Get Business Contact Service";
};

const updateBusinessContact = async (userId, contactId, contactData) => {
    return "Update Business Contact Service";
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

