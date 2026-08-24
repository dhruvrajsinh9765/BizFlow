const Business = require("../models/Business");
const Category = require("../models/Category");
const AppError = require("../utils/Apperror");

const createCategory = async (userId, categoryData = {}) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        const error = new Error("Business not found");
        error.statusCode = 404;
        throw error;
    }

    const { name, type } = categoryData;

    if (name === undefined && type === undefined) {
        const error = new Error("Name and type are required");
        error.statusCode = 400;
        throw error;
    }

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
        throw new AppError("Business not found", 404);
    }

    const categories = await Category.find({
        businessId: business._id
    });

    return categories;
};


const getCategoryById = async (userId, categoryId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const category = await Category.findOne({
        _id: categoryId,
        businessId: business._id
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    return category;
};


const updateCategory = async (userId, categoryId, categoryData) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const allowedFields = ["name", "type"];
    const fieldsToUpdate = Object.keys(categoryData || {});

    if (fieldsToUpdate.length === 0) {
        throw new AppError(
            "At least one field is required to update the category",
            400
        );
    }

    const validFields = fieldsToUpdate.filter((field) =>
        allowedFields.includes(field)
    );

    if (validFields.length === 0) {
        throw new AppError(
            "No valid fields provided for update",
            400
        );
    }

    const updateData = {};

    validFields.forEach((field) => {
        updateData[field] = categoryData[field];
    });

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
        throw new AppError("Category not found", 404);
    }

    return {
        message: "Category updated successfully",
        category
    };
};


const deleteCategory = async (userId, categoryId) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const category = await Category.findOneAndDelete({
        _id: categoryId,
        businessId: business._id
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    return {
        message: "Category deleted successfully"
    };
};


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};