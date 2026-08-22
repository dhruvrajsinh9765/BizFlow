const express = require("express");

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createCategory);

router.get("/", protect, getCategories);

router.put("/:id", protect, updateCategory);

router.delete("/:id", protect, deleteCategory);

module.exports = router;