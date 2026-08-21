const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    res.send("Create Business Contact");
});

router.get("/", (req, res) => {
    res.send("Get All Business Contacts");
});

router.get("/:id", (req, res) => {
    res.send("Get Business Contact");
});

router.put("/:id", (req, res) => {
    res.send("Update Business Contact");
});

router.delete("/:id", (req, res) => {
    res.send("Delete Business Contact");
});

module.exports = router;

