const Business = require("../models/Business");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/Apperror");


const createCategory = async (userId, categoryData = {}) => {
    const business = await Business.findOne({ userId });

    if (!business) {
        throw new AppError("Business not found", 404);
    }

    const { name, type } = categoryData;

    if (name === undefined || type === undefined) {
        throw new AppError(
            "Please provide both category name and type",
            400
        );
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
    }).sort({ name: 1 });

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
            "Please provide at least one field to update",
            400
        );
    }

    const validFields = fieldsToUpdate.filter((field) =>
        allowedFields.includes(field)
    );

    if (validFields.length === 0) {
        throw new AppError(
            "Please provide valid category details to update",
            400
        );
    }

    const category = await Category.findOne({
        _id: categoryId,
        businessId: business._id
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    if (
        categoryData.type !== undefined &&
        categoryData.type !== category.type
    ) {
        const transactionExists = await Transaction.exists({
            categoryId: category._id,
            businessId: business._id
        });

        if (transactionExists) {
            throw new AppError(
                "Cannot change category type because transactions are associated with it",
                409
            );
        }
    }

    const updateData = {};

    validFields.forEach((field) => {
        updateData[field] = categoryData[field];
    });

    const updatedCategory = await Category.findOneAndUpdate(
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

    return {
        message: "Category updated successfully",
        category: updatedCategory
    };
};


const deleteCategory = async (userId, categoryId) => {
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

    const transactionExists = await Transaction.exists({
        categoryId: category._id,
        businessId: business._id
    });

    if (transactionExists) {
        throw new AppError(
            "Cannot delete category because transactions are associated with it",
            409
        );
    }

    await Category.deleteOne({
        _id: category._id
    });

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