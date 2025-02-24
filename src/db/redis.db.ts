import * as redis from "redis";

const redisHost = process.env.REDIS_HOST || "localhost";
const redistPort = process.env.REDIS_PORT || "6379";

const redisClient = redis.createClient({
  url: `redis://${redisHost}:${redistPort}`,
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});
redisClient.on("disconnect", () => {
  console.log("Redis disconnected");
});
redisClient.connect().catch((error) => console.log(error));

const generateRedisKey = (key: string) => `agridocs:${key}`;

export { redisClient, generateRedisKey };
