import api from "./api";

const getTransactions = async (params = {}) => {
    const response = await api.get("/transactions", {
        params,
    });

    return response.data;
};

const getTransactionById = async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
};

const createTransaction = async (transactionData) => {
    const response = await api.post(
        "/transactions",
        transactionData
    );

    return response.data;
};

const updateTransaction = async (id, transactionData) => {
    const response = await api.put(
        `/transactions/${id}`,
        transactionData
    );

    return response.data;
};

const deleteTransaction = async (id) => {
    const response = await api.delete(
        `/transactions/${id}`
    );

    return response.data;
};

const importTransactions = async (file) => {
    const response = await api.post(
        "/transactions/import",
        file,
        {
            headers: {
                "Content-Type": "text/csv",
            },
        }
    );

    return response.data;
};

export default {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
};

