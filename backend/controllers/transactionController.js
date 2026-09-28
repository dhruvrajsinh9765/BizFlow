const transactionService = require("../services/transactionService");
const transactionImportService = require("../services/transactionImportService");

const createTransaction = async (req, res) => {
    const result = await transactionService.createTransaction(
        req.user._id,
        req.body
    );

    res.status(201).send(result);
};

const getTransactions = async (req, res) => {
    const result = await transactionService.getTransactions(
        req.user._id,
        req.query
    );

    res.send(result);
};

const getTransactionById = async (req, res) => {
    const result = await transactionService.getTransactionById(
        req.user._id,
        req.params.id
    );

    res.send(result);
};

const updateTransaction = async (req, res) => {
    const result = await transactionService.updateTransaction(
        req.user._id,
        req.params.id,
        req.body
    );

    res.send(result);
};

const deleteTransaction = async (req, res) => {
    const result = await transactionService.deleteTransaction(
        req.user._id,
        req.params.id
    );

    res.send(result);
};

const importTransactions = async (req, res) => {
    const result = await transactionImportService.importTransactions(
        req.user._id,
        req.body
    );

    res.send(result);
};

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    importTransactions
};