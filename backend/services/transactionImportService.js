const { parse } = require("csv-parse/sync");

const Business = require("../models/Business");
const Category = require("../models/Category");
const BusinessContact = require("../models/BusinessContact");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/Apperror");

const REQUIRED_COLUMNS = [
    "date",
    "type",
    "amount",
    "category",
    "description"
];

const parseCsv = (csvContent) => {
    try {
        return parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
    } catch (error) {
        throw new AppError(
            "Invalid CSV file format",
            400
        );
    }
};

const validateColumns = (rows) => {
    if (!rows.length) {
        throw new AppError(
            "CSV file is empty",
            400
        );
    }

    const columns = Object.keys(rows[0]);

    const missingColumns = REQUIRED_COLUMNS.filter(
        (column) => !columns.includes(column)
    );

    if (missingColumns.length > 0) {
        throw new AppError(
            `Missing required columns: ${missingColumns.join(", ")}`,
            400
        );
    }
};

const importTransactions = async (userId, csvContent) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const rows = parseCsv(csvContent);

    validateColumns(rows);

    const errors = [];
    const transactionsToCreate = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2;

        try {
            if (!row.date) {
                throw new Error("Date is required");
            }

            if (!row.type) {
                throw new Error("Type is required");
            }

            if (!["income", "expense"].includes(row.type)) {
                throw new Error(
                    "Type must be either income or expense"
                );
            }

            if (!row.amount) {
                throw new Error("Amount is required");
            }

            const amount = Number(row.amount);

            if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error(
                    "Amount must be a valid number greater than 0"
                );
            }

            if (amount > 100000000) {
                throw new Error(
                    "Amount cannot exceed 100000000"
                );
            }

            if (!row.category) {
                throw new Error("Category is required");
            }

            if (!row.description) {
                throw new Error("Description is required");
            }

            const category = await Category.findOne({
                businessId: business._id,
                name: row.category,
                type: row.type
            });

            if (!category) {
                throw new Error(
                    `Category '${row.category}' not found for type '${row.type}'`
                );
            }

            let contactId = null;

            if (row.contact && row.contact.trim()) {
                const contact = await BusinessContact.findOne({
                    businessId: business._id,
                    name: row.contact.trim(),
                    isActive: true
                });

                if (!contact) {
                    throw new Error(
                        `Contact '${row.contact}' not found`
                    );
                }

                contactId = contact._id;
            }

            const transactionDate = new Date(row.date);

            if (Number.isNaN(transactionDate.getTime())) {
                throw new Error(
                    "Invalid date. Use YYYY-MM-DD format"
                );
            }

            transactionsToCreate.push({
                businessId: business._id,
                categoryId: category._id,
                contactId,
                amount,
                paymentMethod: "other",
                transactionDate,
                description: row.description.trim()
            });
        } catch (error) {
            errors.push({
                row: rowNumber,
                message: error.message
            });
        }
    }

    if (errors.length > 0) {
    throw new AppError(
        "CSV contains invalid rows",
        400,
        {
            totalRows: rows.length,
            validRows: transactionsToCreate.length,
            invalidRows: errors.length,
            errors
        }
    );
}

    const transactions = await Transaction.insertMany(
        transactionsToCreate
    );

    return {
        message: "CSV imported successfully",
        totalRows: rows.length,
        validRows: transactions.length,
        invalidRows: 0,
        importedTransactions: transactions.length
    };
};

module.exports = {
    importTransactions
};