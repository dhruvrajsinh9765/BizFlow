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
            trim: true,
            minlength: [1, "Contact name cannot be empty"]
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
        },

        contactType: {
            type: String,
            enum: ["customer", "supplier"],
            required: [true, "Contact type is required"]
        }
    },
    {
        timestamps: true
    }
);

/*
 * Email must be unique within the same business
 * for active contacts.
 *
 * Different businesses can use the same email.
 * Deleted contacts do not participate in the index.
 */
businessContactSchema.index(
    {
        businessId: 1,
        email: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            isActive: true,
            email: { $exists: true }
        }
    }
);

/*
 * Phone must be unique within the same business
 * for active contacts.
 *
 * Different businesses can use the same phone number.
 * Deleted contacts do not participate in the index.
 */
businessContactSchema.index(
    {
        businessId: 1,
        phone: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            isActive: true,
            phone: { $exists: true }
        }
    }
);

const BusinessContact = mongoose.model(
    "BusinessContact",
    businessContactSchema
);

module.exports = BusinessContact;

