const createCategory = (req, res) => {
    res.send("Create Category");
};

const getCategories = (req, res) => {
    res.send("Get Categories");
};

const updateCategory = (req, res) => {
    res.send("Update Category");
};

const deleteCategory = (req, res) => {
    res.send("Delete Category");
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};

