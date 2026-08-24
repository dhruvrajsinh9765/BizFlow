const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true
        },

        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true
        },

        type: {
            type: String,
            required: [true, "Category type is required"],
            enum: {
                values: ["income", "expense"],
                message: "Category type must be either income or expense"
            }
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate category name + type for the same business
categorySchema.index(
    { businessId: 1, name: 1, type: 1 },
    { unique: true }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;