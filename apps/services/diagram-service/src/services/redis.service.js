import { createClient } from "redis";

export const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
  },
});

// --- Event Listeners ---
redisClient.on("connect", () => console.log("🧠 Connecting to Redis Cloud..."));
redisClient.on("ready", () =>
  console.log("✅ Redis Cloud connection established!"),
);
redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisClient.on("end", () => console.log("🛑 Redis connection closed."));

// --- Connection Helper ---
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("🚀 Redis Cloud client ready.");
    }
  } catch (error) {
    console.error("Failed to connect to Redis Cloud:", error);
  }
};
