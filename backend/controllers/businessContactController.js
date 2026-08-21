const businessContactService = require("../services/businessContactService");

const createBusinessContact = async (req, res) => {
    const result = await businessContactService.createBusinessContact(req.body);
    res.send(result);
};

const getBusinessContacts = async (req, res) => {
    const result = await businessContactService.getBusinessContacts();
    res.send(result);
};

const getBusinessContactById = async (req, res) => {
    const result = await businessContactService.getBusinessContactById(
        req.params.id
    );
    res.send(result);
};

const updateBusinessContact = async (req, res) => {
    const result = await businessContactService.updateBusinessContact(
        req.params.id,
        req.body
    );
    res.send(result);
};

const deleteBusinessContact = async (req, res) => {
    const result = await businessContactService.deleteBusinessContact(
        req.params.id
    );
    res.send(result);
};

module.exports = {
    createBusinessContact,
    getBusinessContacts,
    getBusinessContactById,
    updateBusinessContact,
    deleteBusinessContact
};