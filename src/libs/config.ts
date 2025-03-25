import mongoose from "mongoose";
import crypto from "crypto";
import redis from "../redis";

export const CACHE_TTL = 3600;
export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = ":method :url :response-time [:status] \n";

export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};

export const hashRedisKey = (longStringKey: string) => {
  return crypto.createHash("md5").update(longStringKey).digest("hex");
};

export const deleteKeysByPattern = async (pattern: string) => {
  let cursor = "0";
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );
    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Deleted ${keys.length} keys:`, keys);
    }
  } while (cursor !== "0");

  console.log("Cache invalidation completed.");
};

// Usage example
// deleteKeysByPattern("product:*"); // Deletes all keys starting with 'product:'
