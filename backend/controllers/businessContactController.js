const businessContactService = require("../services/businessContactService");

const createBusinessContact = async (req, res) => {
    const result = await businessContactService.createBusinessContact(
        req.user._id,
        req.body
    );

    res.status(201).send(result);
};

const getBusinessContacts = async (req, res) => {
    const result = await businessContactService.getBusinessContacts(
        req.user._id
    );

    res.send(result);
};

const getBusinessContactById = async (req, res) => {
    const result = await businessContactService.getBusinessContactById(
        req.user._id,
        req.params.id
    );

    res.send(result);
};

const updateBusinessContact = async (req, res) => {
    const result = await businessContactService.updateBusinessContact(
        req.user._id,
        req.params.id,
        req.body
    );

    res.send(result);
};

const deleteBusinessContact = async (req, res) => {
    const result = await businessContactService.deleteBusinessContact(
        req.user._id,
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

