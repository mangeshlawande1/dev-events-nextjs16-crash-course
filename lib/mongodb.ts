// lib/mongodb.ts

import mongoose from "mongoose";

/**
 * Shape of our cached mongoose connection.
 * - conn: Active mongoose connection instance.
 * - promise: Pending connection promise to avoid creating
 *   multiple connections simultaneously.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Extend Node's global object so the cache persists
 * across hot reloads in development.
 */
declare global {
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Reuse the cached connection if it exists,
 * otherwise initialize a new cache object.
 */
const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB using Mongoose.
 *
 * The connection is cached to prevent creating multiple
 * database connections during Next.js hot reloads.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if already connected.
  if (cached.conn) {
    return cached.conn;
  }

  // Create a new connection promise if one doesn't exist.
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
      );
    }

    const options = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, options);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset promise so future retries can occur.
    cached.promise = null;
    throw error;
  }
}

export default connectToDatabase;