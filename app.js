const express = require("express");
const apiRoutes = require("./routes");

const app = express();
require("dotenv").config();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Cinema Booking API is running",
  });
});

app.use("/", apiRoutes);

// Handles unknown routes in one place.
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Central error handler for controller errors.
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
});

module.exports = app;
