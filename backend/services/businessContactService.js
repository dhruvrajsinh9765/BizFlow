const createBusinessContact = async (contactData) => {
    return "Create Business Contact Service";
};

const getBusinessContacts = async () => {
    return "Get All Business Contacts Service";
};

const getBusinessContactById = async (contactId) => {
    return "Get Business Contact Service";
};

const updateBusinessContact = async (contactId, contactData) => {
    return "Update Business Contact Service";
};

const deleteBusinessContact = async (contactId) => {
    return "Delete Business Contact Service";
};

module.exports = {
    createBusinessContact,
    getBusinessContacts,
    getBusinessContactById,
    updateBusinessContact,
    deleteBusinessContact
};