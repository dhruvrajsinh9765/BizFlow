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
            required: true,
            trim: true
        },

        type: {
            type: String,
            required: true,
            enum: ["income", "expense"]
        }
    },
    {
        timestamps: true
    }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;