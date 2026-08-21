const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    res.send("Create Transaction");
});

router.get("/", (req, res) => {
    res.send("Get Transactions");
});

router.get("/:id", (req, res) => {
    res.send("Get Transaction");
});

router.put("/:id", (req, res) => {
    res.send("Update Transaction");
});

router.delete("/:id", (req, res) => {
    res.send("Delete Transaction");
});

module.exports = router;
