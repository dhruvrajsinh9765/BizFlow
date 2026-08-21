const createTransaction = async (transactionData) => {
    return "Create Transaction Service";
};

const getTransactions = async () => {
    return "Get Transactions Service";
};

const getTransactionById = async (transactionId) => {
    return "Get Transaction Service";
};

const updateTransaction = async (transactionId, transactionData) => {
    return "Update Transaction Service";
};

const deleteTransaction = async (transactionId) => {
    return "Delete Transaction Service";
};

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};

