const express = require("express");
const businessRoutes = require("./routes/businessRoutes");
const userRoutes = require("./routes/userRoutes");
const businessContactRoutes = require("./routes/businessContactRoutes");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("BizFlow Backend is Running");
});

app.use("/api/business", businessRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", businessContactRoutes);
module.exports = app;
