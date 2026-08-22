const express = require("express");

const {
    createBusinessContact,
    getBusinessContacts,
    getBusinessContactById,
    updateBusinessContact,
    deleteBusinessContact
} = require("../controllers/businessContactController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBusinessContact);

router.get("/", protect, getBusinessContacts);

router.get("/:id", protect, getBusinessContactById);

router.put("/:id", protect, updateBusinessContact);

router.delete("/:id", protect, deleteBusinessContact);

module.exports = router;

