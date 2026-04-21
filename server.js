const app = require("./app");
const connectDB = require("./config/db");

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
