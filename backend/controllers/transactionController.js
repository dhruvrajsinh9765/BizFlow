const transactionService = require("../services/transactionService");

const createTransaction = async (req, res) => {
    const result = await transactionService.createTransaction(req.body);
    res.send(result);
};

const getTransactions = async (req, res) => {
    const result = await transactionService.getTransactions();
    res.send(result);
};

const getTransactionById = async (req, res) => {
    const result = await transactionService.getTransactionById(
        req.params.id
    );
    res.send(result);
};

const updateTransaction = async (req, res) => {
    const result = await transactionService.updateTransaction(
        req.params.id,
        req.body
    );
    res.send(result);
};

const deleteTransaction = async (req, res) => {
    const result = await transactionService.deleteTransaction(
        req.params.id
    );
    res.send(result);
};

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};

