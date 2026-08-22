const Business = require("../models/Business");
const Category = require("../models/Category");
const BusinessContact = require("../models/BusinessContact");
const Transaction = require("../models/Transaction");

const createTransaction = async (userId, transactionData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const {
        categoryId,
        contactId,
        amount,
        paymentMethod,
        transactionDate,
        description
    } = transactionData;

    // Verify that the category belongs to this business
    const category = await Category.findOne({
        _id: categoryId,
        businessId: business._id
    });

    if (!category) {
        throw new Error("Category not found");
    }

    // Verify contact ownership if a contact is provided
    if (contactId) {
        const contact = await BusinessContact.findOne({
            _id: contactId,
            businessId: business._id
        });

        if (!contact) {
            throw new Error("Business contact not found");
        }
    }

    const transaction = await Transaction.create({
        businessId: business._id,
        categoryId,
        contactId: contactId || null,
        amount,
        paymentMethod,
        transactionDate,
        description
    });

    return {
        message: "Transaction created successfully",
        transaction
    };
};

const getTransactions = async (userId, filters) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const {
        categoryId,
        contactId,
        paymentMethod,
        startDate,
        endDate,
        sortBy,
        order
    } = filters;

    const query = {
        businessId: business._id
    };

    if (categoryId !== undefined) {
        query.categoryId = categoryId;
    }

    if (contactId !== undefined) {
        query.contactId = contactId;
    }

    if (paymentMethod !== undefined) {
        query.paymentMethod = paymentMethod;
    }

    if (startDate !== undefined || endDate !== undefined) {
        query.transactionDate = {};

        if (startDate !== undefined) {
            query.transactionDate.$gte = new Date(startDate);
        }

        if (endDate !== undefined) {
            query.transactionDate.$lte = new Date(endDate);
        }
    }

   let sortOptions = {
    transactionDate: -1
};

if (sortBy !== undefined) {
    const allowedSortFields = ["transactionDate", "amount"];

    if (!allowedSortFields.includes(sortBy)) {
        throw new Error("Invalid sort field");
    }

    sortOptions = {
        [sortBy]: order === "asc" ? 1 : -1
    };
}

const transactions = await Transaction.find(query).sort(sortOptions);

 

    return transactions;
};



const getTransactionById = async (userId, transactionId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const transaction = await Transaction.findOne({
        _id: transactionId,
        businessId: business._id
    });

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    return transaction;
};

// Will be implemented in Work Chunk 2
const updateTransaction = async (
    userId,
    transactionId,
    transactionData
) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const {
        categoryId,
        contactId,
        amount,
        paymentMethod,
        transactionDate,
        description
    } = transactionData;

    const updateData = {};

    if (categoryId !== undefined) {
        const category = await Category.findOne({
            _id: categoryId,
            businessId: business._id
        });

        if (!category) {
            throw new Error("Category not found");
        }

        updateData.categoryId = categoryId;
    }

    if (contactId !== undefined) {
        if (contactId === null) {
            updateData.contactId = null;
        } else {
            const contact = await BusinessContact.findOne({
                _id: contactId,
                businessId: business._id
            });

            if (!contact) {
                throw new Error("Business contact not found");
            }

            updateData.contactId = contactId;
        }
    }

    if (amount !== undefined) updateData.amount = amount;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (transactionDate !== undefined) {
        updateData.transactionDate = transactionDate;
    }
    if (description !== undefined) updateData.description = description;

    const transaction = await Transaction.findOneAndUpdate(
        {
            _id: transactionId,
            businessId: business._id
        },
        updateData,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    return {
        message: "Transaction updated successfully",
        transaction
    };
};

// Will be implemented in Work Chunk 2
const deleteTransaction = async (userId, transactionId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const transaction = await Transaction.findOneAndDelete({
        _id: transactionId,
        businessId: business._id
    });

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    return {
        message: "Transaction deleted successfully"
    };
};



module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};

