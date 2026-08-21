const express = require("express");
const businessRoutes = require("./routes/businessRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("BizFlow Backend is Running");
});

app.use("/api/business", businessRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
