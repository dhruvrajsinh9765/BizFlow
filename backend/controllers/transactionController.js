const createTransaction = (req, res) => {
    res.send("Create Transaction");
};

const getTransactions = (req, res) => {
    res.send("Get Transactions");
};

const getTransactionById = (req, res) => {
    res.send("Get Transaction");
};

const updateTransaction = (req, res) => {
    res.send("Update Transaction");
};

const deleteTransaction = (req, res) => {
    res.send("Delete Transaction");
};

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};