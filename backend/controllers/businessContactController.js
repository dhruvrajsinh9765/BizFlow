const createBusinessContact = (req, res) => {
    res.send("Create Business Contact");
};

const getBusinessContacts = (req, res) => {
    res.send("Get All Business Contacts");
};

const getBusinessContactById = (req, res) => {
    res.send("Get Business Contact");
};

const updateBusinessContact = (req, res) => {
    res.send("Update Business Contact");
};

const deleteBusinessContact = (req, res) => {
    res.send("Delete Business Contact");
};

module.exports = {
    createBusinessContact,
    getBusinessContacts,
    getBusinessContactById,
    updateBusinessContact,
    deleteBusinessContact
};