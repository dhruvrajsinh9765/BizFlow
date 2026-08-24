const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        businessName: {
            type: String,
            required: [true, "Business name is required"],
            trim: true
        },

        businessType: {
            type: String,
            required: [true, "Business type is required"],
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
        }
    },
    {
        timestamps: true
    }
);

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;