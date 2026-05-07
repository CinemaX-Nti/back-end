const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURL = process.env.MONGO_URL;

  if (!mongoURL) {
    throw new Error(
      "MongoDB connection string is missing. Set MONGO_URL or MONGO_URI in .env.",
    );
  }

  await mongoose.connect(mongoURL, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("MongoDB connected successfully");
};

module.exports = connectDB;
