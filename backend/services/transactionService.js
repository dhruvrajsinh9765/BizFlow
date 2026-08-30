const Business = require("../models/Business");
const Category = require("../models/Category");
const BusinessContact = require("../models/BusinessContact");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/Apperror");

const createTransaction = async (userId, transactionData = {}) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
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
        throw new AppError("Please select a category", 400);
    }

    if (amount === undefined || amount === null) {
        throw new AppError(
            "Please provide a transaction amount",
            400
        );
    }

    if (paymentMethod === undefined || paymentMethod === null) {
        throw new AppError(
            "Please select a payment method",
            400
        );
    }

    // Verify that the category belongs to this business
    const category = await Category.findOne({
        _id: categoryId,
        businessId: business._id
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    // Verify contact ownership if a contact is provided
    if (contactId) {
        const contact = await BusinessContact.findOne({
            _id: contactId,
            businessId: business._id,
            isActive: true
        });

        if (!contact) {
            throw new AppError("Contact not found", 404);
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
        throw new AppError("Business not found", 404);
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
        throw new AppError(
            "Page must be a positive whole number",
            400
        );
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1) {
        throw new AppError(
            "Limit must be a positive whole number",
            400
        );
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
            throw new AppError(
                "Please provide a valid payment method",
                400
            );
        }
    }

    if (
        order !== undefined &&
        !["asc", "desc"].includes(order)
    ) {
        throw new AppError(
            "Order must be either asc or desc",
            400
        );
    }

    if (sortBy !== undefined) {
        const allowedSortFields = [
            "transactionDate",
            "amount"
        ];

        if (!allowedSortFields.includes(sortBy)) {
            throw new AppError(
                "Please provide a valid field to sort by",
                400
            );
        }
    }

    let start;
    let end;

    if (startDate !== undefined) {
        start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
            throw new AppError("Invalid start date", 400);
        }
    }

    if (endDate !== undefined) {
        end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
            throw new AppError("Invalid end date", 400);
        }

        end.setUTCHours(23, 59, 59, 999);
    }

    if (start && end && start > end) {
        throw new AppError(
            "Start date cannot be after end date",
            400
        );
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
        throw new AppError("Business not found", 404);
    }

    const transaction = await Transaction.findOne({
        _id: transactionId,
        businessId: business._id
    });

    if (!transaction) {
        throw new AppError("Transaction not found", 404);
    }

    return transaction;
};


const updateTransaction = async (
    userId,
    transactionId,
    transactionData = {}
) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
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
        throw new AppError(
            "Please provide at least one field to update",
            400
        );
    }

    const validFields = providedFields.filter((field) =>
        allowedFields.includes(field)
    );

    if (validFields.length === 0) {
        throw new AppError(
            "Please provide valid transaction details to update",
            400
        );
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
            throw new AppError("Category not found", 404);
        }

        updateData.categoryId = categoryId;
    }

    if (contactId !== undefined) {
        if (contactId === null) {
            updateData.contactId = null;
        } else {
            const contact = await BusinessContact.findOne({
                _id: contactId,
                businessId: business._id,
                isActive: true
            });

            if (!contact) {
                throw new AppError("Contact not found", 404);
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
        throw new AppError("Transaction not found", 404);
    }

    return {
        message: "Transaction updated successfully",
        transaction
    };
};


const deleteTransaction = async (userId, transactionId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const transaction = await Transaction.findOneAndDelete({
        _id: transactionId,
        businessId: business._id
    });

    if (!transaction) {
        throw new AppError("Transaction not found", 404);
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