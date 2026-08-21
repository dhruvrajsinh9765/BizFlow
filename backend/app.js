const express = require("express");

const businessRoutes = require("./routes/businessRoutes");
const userRoutes = require("./routes/userRoutes");
const businessContactRoutes = require("./routes/businessContactRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("BizFlow Backend is Running");
});

app.use("/api/business", businessRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", businessContactRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);


// Error middleware must be after all routes
app.use(errorHandler);

module.exports = app;