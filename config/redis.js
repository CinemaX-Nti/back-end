const { createClient } = require("redis");

let redisClient;

const createRedisClient = () => {
  return createClient({
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });
};

const connectRedis = async () => {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  const hasRedisConfig =
    process.env.REDIS_PASSWORD &&
    process.env.REDIS_HOST &&
    process.env.REDIS_PORT;

  if (!hasRedisConfig) {
    throw new Error(
      "Redis connection settings are missing. Set REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD.",
    );
  }

  redisClient = createRedisClient();

  redisClient.on("error", (error) => {
    console.error("Redis Client Error:", error.message);
  });

  await redisClient.connect();
  console.log("Redis connected successfully");

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client has not been initialized yet.");
  }

  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient,
};
