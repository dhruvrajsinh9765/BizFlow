const express = require("express");

const {
    createBusinessContact,
    getBusinessContacts,
    getBusinessContactById,
    updateBusinessContact,
    deleteBusinessContact
} = require("../controllers/businessContactController");

const router = express.Router();

router.post("/", createBusinessContact);

router.get("/", getBusinessContacts);

router.get("/:id", getBusinessContactById);

router.put("/:id", updateBusinessContact);

router.delete("/:id", deleteBusinessContact);

module.exports = router;