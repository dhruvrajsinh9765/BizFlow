const Business = require("../models/Business");
const Category = require("../models/Category");

const createCategory = async (userId, categoryData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const { name, type } = categoryData;

    const category = await Category.create({
        businessId: business._id,
        name,
        type
    });

    return {
        message: "Category created successfully",
        category
    };
};

const getCategories = async (userId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const categories = await Category.find({
        businessId: business._id
    });

    return categories;
};

const updateCategory = async (userId, categoryId, categoryData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const { name, type } = categoryData;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;

    const category = await Category.findOneAndUpdate(
        {
            _id: categoryId,
            businessId: business._id
        },
        updateData,
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!category) {
        throw new Error("Category not found");
    }

    return {
        message: "Category updated successfully",
        category
    };
};

const deleteCategory = async (userId, categoryId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new Error("Business not found");
    }

    const category = await Category.findOneAndDelete({
        _id: categoryId,
        businessId: business._id
    });

    if (!category) {
        throw new Error("Category not found");
    }

    return {
        message: "Category deleted successfully"
    };
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};

