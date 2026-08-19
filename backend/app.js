const express = require("express");
const businessRoutes = require("./routes/businessRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("BizFlow Backend is Running");
});

app.use("/api/business", businessRoutes);

module.exports = app;
