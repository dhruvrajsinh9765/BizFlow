const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    res.send("Create Business");
});

router.get("/", (req, res) => {
    res.send("Get Business");
});

router.put("/:id", (req, res) => {
    res.send("Update Business");
});

module.exports = router;
