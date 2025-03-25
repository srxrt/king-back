import mongoose from "mongoose";
import crypto from "crypto";

export const CACHE_TTL = 600;
export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = ":method :url :response-time [:status] \n";

export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};

export const hashRedisKey = (longStringKey: string): string => {
  return crypto.createHash("md5").update(longStringKey).digest("hex");
};
