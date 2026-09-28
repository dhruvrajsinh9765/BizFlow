const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        contactId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BusinessContact",
            default: null
        },

        amount: {
            type: Number,
            required: [true, "Transaction amount is required"],
            min: [0.01, "Transaction amount must be greater than 0"],
            max: [100000000, "Transaction amount is too large"]
        },

        paymentMethod: {
            type: String,
            required: [true, "Payment method is required"],
            enum: {
                values: ["cash", "upi", "bank", "card", "other"],
                message: "Invalid payment method"
            },
            trim: true
        },

        transactionDate: {
            type: Date,
            required: [true, "Transaction date is required"],
            default: Date.now,
            validate: {
                validator: (value) => !Number.isNaN(new Date(value).getTime()),
                message: "Invalid transaction date"
            }
        },

        description: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

transactionSchema.index({ businessId: 1, transactionDate: -1 });
transactionSchema.index({ businessId: 1, categoryId: 1 });
transactionSchema.index({ businessId: 1, contactId: 1 });
transactionSchema.index({ businessId: 1, paymentMethod: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;