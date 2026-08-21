const categoryService = require("../services/categoryService");

const createCategory = async (req, res) => {
    const result = await categoryService.createCategory(req.body);
    res.send(result);
};

const getCategories = async (req, res) => {
    const result = await categoryService.getCategories();
    res.send(result);
};

const updateCategory = async (req, res) => {
    const result = await categoryService.updateCategory(
        req.params.id,
        req.body
    );
    res.send(result);
};

const deleteCategory = async (req, res) => {
    const result = await categoryService.deleteCategory(req.params.id);
    res.send(result);
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};