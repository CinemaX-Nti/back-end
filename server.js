const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const startServer = async () => {
  await connectDB();
  await connectRedis();

  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
