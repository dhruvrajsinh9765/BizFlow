const mongoose = require("mongoose");

const businessContactSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true
        },

        name: {
            type: String,
            required: [true, "Contact name is required"],
            trim: true
        },

        phone: {
            type: String,
            trim: true,
            match: [
                /^[0-9]{10}$/,
                "Please provide a valid 10-digit phone number"
            ]
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address"
            ]
        },

        address: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const BusinessContact = mongoose.model(
    "BusinessContact",
    businessContactSchema
);

module.exports = BusinessContact;