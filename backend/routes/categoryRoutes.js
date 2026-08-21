const express = require("express");

const router = express.Router();

router.post("/", (req, res) => {
    res.send("Create Category");
});

router.get("/", (req, res) => {
    res.send("Get Categories");
});

router.put("/:id", (req, res) => {
    res.send("Update Category");
});

router.delete("/:id", (req, res) => {
    res.send("Delete Category");
});

module.exports = router;