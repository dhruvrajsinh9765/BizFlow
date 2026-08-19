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
            required: true,
            min: 0
        },

        transactionType: {
            type: String,
            required: true,
            enum: ["income", "expense"]
        },

        paymentMethod: {
            type: String,
            trim: true
        },

        transactionDate: {
            type: Date,
            required: true,
            default: Date.now
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

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;