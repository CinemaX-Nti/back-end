const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURL = process.env.MONGO_URL || process.env.MONGO_URI;
  console.log(mongoURL);

  if (!mongoURL) {
    throw new Error('MongoDB connection string is missing. Set MONGO_URI or MONGO_URL in .env.');
  }

  await mongoose.connect(mongoURL, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log('MongoDB connected successfully');
};

module.exports = connectDB;
