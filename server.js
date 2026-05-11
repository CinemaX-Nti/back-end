require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

const startServer = async () => {
  const PORT = Number(process.env.PORT) || 5000;
  console.log(PORT);

  try {
    await connectDB();
    await connectRedis();
    startBookingExpiryWorker();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error('Startup error type:', error.name);

    process.exit(1);
  }
};

startServer();
