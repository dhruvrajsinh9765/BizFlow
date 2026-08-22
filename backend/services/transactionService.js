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
        order,
        page = 1,
        limit = 10
    } = filters;

    // Convert query string values to numbers
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Validate pagination values
    if (
        !Number.isInteger(pageNumber) ||
        pageNumber < 1
    ) {
        const error = new Error("Page must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    if (
        !Number.isInteger(limitNumber) ||
        limitNumber < 1
    ) {
        const error = new Error("Limit must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    // Calculate how many transactions to skip
    const skip = (pageNumber - 1) * limitNumber;

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

    // Count all transactions matching the filters
    const totalTransactions = await Transaction.countDocuments(query);

    // Apply filtering, sorting, and pagination
    const transactions = await Transaction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber);

    return {
        transactions,
        pagination: {
            totalTransactions,
            currentPage: pageNumber,
            totalPages: Math.ceil(
                totalTransactions / limitNumber
            ),
            limit: limitNumber
        }
    };
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

    if (paymentMethod !== undefined) {
        updateData.paymentMethod = paymentMethod;
    }

    if (transactionDate !== undefined) {
        updateData.transactionDate = transactionDate;
    }

    if (description !== undefined) {
        updateData.description = description;
    }

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