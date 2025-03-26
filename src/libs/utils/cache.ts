import redis from "../../redis";
import { CACHE_TTL } from "../config";
import { Member } from "../types/member";
import { Order } from "../types/order";
import { Product } from "../types/product";

export const checkCache = async (key: string) => {
  const data = await redis.get(key);
  if (data) {
    console.log("Cache hit!");
    return JSON.parse(data);
  } else {
    console.log("Cache miss!");
    return null;
  }
};

export const cacheData = async (
  key: string,
  data: Product | Order | Member | Product[] | Order[],
) => {
  await redis.setex(key, CACHE_TTL, JSON.stringify(data));
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
