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
            required: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        address: {
            type: String,
            trim: true
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
