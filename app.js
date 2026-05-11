const express = require("express");
const apiRoutes = require("./routes");

const app = express();

const allowedOrigin = process.env.FRONTEND_URL;

app.use((req, res, next) => {
  if (allowedOrigin) {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Vary", "Origin");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

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
