const Business = require("../models/Business");
const Category = require("../models/Category");
const BusinessContact = require("../models/BusinessContact");
const Transaction = require("../models/Transaction");

const createTransaction = async (userId, transactionData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        const error = new Error("Business not found");
        error.statusCode = 404;
        throw error;
    }

    const {
        categoryId,
        contactId,
        amount,
        paymentMethod,
        transactionDate,
        description
    } = transactionData;

    if (!categoryId) {
        const error = new Error("Category is required");
        error.statusCode = 400;
        throw error;
    }

    if (amount === undefined || amount === null) {
        const error = new Error("Transaction amount is required");
        error.statusCode = 400;
        throw error;
    }

    if (paymentMethod === undefined || paymentMethod === null) {
        const error = new Error("Payment method is required");
        error.statusCode = 400;
        throw error;
    }

    // Verify that the category belongs to this business
    const category = await Category.findOne({
        _id: categoryId,
        businessId: business._id
    });

    if (!category) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }

    // Verify contact ownership if a contact is provided
    if (contactId) {
        const contact = await BusinessContact.findOne({
            _id: contactId,
            businessId: business._id
        });

        if (!contact) {
            const error = new Error("Business contact not found");
            error.statusCode = 404;
            throw error;
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
        const error = new Error("Business not found");
        error.statusCode = 404;
        throw error;
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

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        const error = new Error("Page must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1) {
        const error = new Error("Limit must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    if (paymentMethod !== undefined) {
        const allowedPaymentMethods = [
            "cash",
            "upi",
            "bank",
            "card",
            "other"
        ];

        if (!allowedPaymentMethods.includes(paymentMethod)) {
            const error = new Error("Invalid payment method");
            error.statusCode = 400;
            throw error;
        }
    }

    if (
        order !== undefined &&
        !["asc", "desc"].includes(order)
    ) {
        const error = new Error("Order must be either asc or desc");
        error.statusCode = 400;
        throw error;
    }

    if (sortBy !== undefined) {
        const allowedSortFields = [
            "transactionDate",
            "amount"
        ];

        if (!allowedSortFields.includes(sortBy)) {
            const error = new Error("Invalid sort field");
            error.statusCode = 400;
            throw error;
        }
    }

    let start;
    let end;

    if (startDate !== undefined) {
        start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
            const error = new Error("Invalid start date");
            error.statusCode = 400;
            throw error;
        }
    }

    if (endDate !== undefined) {
    end = new Date(endDate);

    if (Number.isNaN(end.getTime())) {
        const error = new Error("Invalid end date");
        error.statusCode = 400;
        throw error;
    }

    end.setUTCHours(23, 59, 59, 999);
    }

    if (start && end && start > end) {
        const error = new Error(
            "Start date cannot be after end date"
        );
        error.statusCode = 400;
        throw error;
    }

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

    if (start || end) {
        query.transactionDate = {};

        if (start) {
            query.transactionDate.$gte = start;
        }

        if (end) {
            query.transactionDate.$lte = end;
        }
    }

    let sortOptions = {
        transactionDate: -1
    };

    if (sortBy !== undefined) {
        sortOptions = {
            [sortBy]: order === "asc" ? 1 : -1
        };
    }

    const totalTransactions = await Transaction.countDocuments(query);

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
        const error = new Error("Business not found");
        error.statusCode = 404;
        throw error;
    }

    const transaction = await Transaction.findOne({
        _id: transactionId,
        businessId: business._id
    });

    if (!transaction) {
        const error = new Error("Transaction not found");
        error.statusCode = 404;
        throw error;
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
        const error = new Error("Business not found");
        error.statusCode = 404;
        throw error;
    }

    const allowedFields = [
        "categoryId",
        "contactId",
        "amount",
        "paymentMethod",
        "transactionDate",
        "description"
    ];

    const providedFields = Object.keys(transactionData);

    if (providedFields.length === 0) {
        const error = new Error(
            "At least one field is required to update the transaction"
        );
        error.statusCode = 400;
        throw error;
    }

    const validFields = providedFields.filter((field) =>
        allowedFields.includes(field)
    );

    if (validFields.length === 0) {
        const error = new Error(
            "No valid fields provided for update"
        );
        error.statusCode = 400;
        throw error;
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
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
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
                const error = new Error(
                    "Business contact not found"
                );
                error.statusCode = 404;
                throw error;
            }

            updateData.contactId = contactId;
        }
    }

    if (amount !== undefined) {
        updateData.amount = amount;
    }

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
        const error = new Error("Transaction not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        message: "Transaction updated successfully",
        transaction
    };
};

const deleteTransaction = async (userId, transactionId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        const error = new Error("Business not found");
        error.statusCode = 404;
        throw error;
    }

    const transaction = await Transaction.findOneAndDelete({
        _id: transactionId,
        businessId: business._id
    });

    if (!transaction) {
        const error = new Error("Transaction not found");
        error.statusCode = 404;
        throw error;
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