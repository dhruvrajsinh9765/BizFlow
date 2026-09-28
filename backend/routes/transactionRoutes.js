const express = require("express");

const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    importTransactions
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTransaction);

router.get("/", protect, getTransactions);

router.post("/import", protect, importTransactions);

router.get("/:id", protect, getTransactionById);

router.put("/:id", protect, updateTransaction);

router.delete("/:id", protect, deleteTransaction);

module.exports = router;