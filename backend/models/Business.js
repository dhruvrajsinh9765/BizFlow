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
            required: true,
            trim: true
        },

        businessType: {
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

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
