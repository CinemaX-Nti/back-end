require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const startServer = async () => {
  const PORT = Number(process.env.PORT) || 5000;

  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);

    if (
      error.name === "MongooseServerSelectionError" ||
      /ECONNREFUSED|ENOTFOUND/i.test(error.message)
    ) {
      console.error(
        "Make sure MongoDB is running and the connection string in .env is correct.",
      );
    }

    process.exit(1);
  }
};

startServer();
