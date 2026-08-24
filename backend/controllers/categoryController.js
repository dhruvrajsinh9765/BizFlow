const categoryService = require("../services/categoryService");

const createCategory = async (req, res) => {
    const result = await categoryService.createCategory(
        req.user._id,
        req.body
    );

    res.status(201).send(result);
};

const getCategories = async (req, res) => {
    const result = await categoryService.getCategories(
        req.user._id
    );

    res.send(result);
};

const getCategoryById = async (req, res) => {
    const result = await categoryService.getCategoryById(
        req.user._id,
        req.params.id
    );

    res.send(result);
};

const updateCategory = async (req, res) => {
    const result = await categoryService.updateCategory(
        req.user._id,
        req.params.id,
        req.body
    );

    res.send(result);
};

const deleteCategory = async (req, res) => {
    const result = await categoryService.deleteCategory(
        req.user._id,
        req.params.id
    );

    res.send(result);
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};