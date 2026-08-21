


const express = require("express");
const {
    createBusiness,
    getBusiness,
    updateBusiness
} = require("../controllers/businessController");

const router = express.Router();

router.post("/", createBusiness);

router.get("/", getBusiness);

router.put("/", updateBusiness);

module.exports = router;


