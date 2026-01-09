/**
 * Yeliz-Samet deleted images storage
 * Uses Redis (node-redis) if KV_REDIS_URL is available, otherwise in-memory Map fallback for local dev
 */

import { createClient, RedisClientType } from "redis";

type DeletedStorage = {
  add: (albumSlug: string, filename: string) => Promise<void>;
  addMany: (albumSlug: string, filenames: string[]) => Promise<void>;
  get: (albumSlug: string) => Promise<string[]>;
  has: (albumSlug: string, filename: string) => Promise<boolean>;
};

// In-memory fallback for local development
const inMemoryStorage = new Map<string, Set<string>>();

const getInMemoryStorage = (): DeletedStorage => {
  return {
    async add(albumSlug: string, filename: string) {
      const key = `yeliz-samet:deleted:${albumSlug}`;
      if (!inMemoryStorage.has(key)) {
        inMemoryStorage.set(key, new Set());
      }
      inMemoryStorage.get(key)!.add(filename);
    },
    async addMany(albumSlug: string, filenames: string[]) {
      const key = `yeliz-samet:deleted:${albumSlug}`;
      if (!inMemoryStorage.has(key)) {
        inMemoryStorage.set(key, new Set());
      }
      const set = inMemoryStorage.get(key)!;
      filenames.forEach((filename) => set.add(filename));
    },
    async get(albumSlug: string) {
      const key = `yeliz-samet:deleted:${albumSlug}`;
      const set = inMemoryStorage.get(key);
      return set ? Array.from(set) : [];
    },
    async has(albumSlug: string, filename: string) {
      const key = `yeliz-samet:deleted:${albumSlug}`;
      const set = inMemoryStorage.get(key);
      return set ? set.has(filename) : false;
    },
  };
};

// Redis client singleton (serverless-friendly, using globalThis)
declare global {
  // eslint-disable-next-line no-var
  var __redisClient: RedisClientType | undefined;
}

let redisStorage: DeletedStorage | null = null;

// Initialize Redis storage if available (runtime check)
if (typeof window === "undefined") {
  const redisUrl =
    process.env.KV_REDIS_URL ||
    process.env.REDIS_URL ||
    process.env.VERCEL_REDIS_URL;

  if (redisUrl) {
    try {
      // Get or create Redis client (singleton pattern using globalThis for serverless)
      let redisClient: RedisClientType | null = null;

      if (global.__redisClient) {
        redisClient = global.__redisClient;
      } else {
        // Use Redis URL directly - node-redis handles authentication from URL
        // URL format: redis://username:password@host:port or rediss://username:password@host:port
        // Vercel Redis format: redis://default:password@host:port
        
        try {
          redisClient = createClient({
            url: redisUrl,
            socket: {
              reconnectStrategy: (retries) => {
                if (retries > 10) {
                  console.error("[deleted-storage] Redis reconnection failed after 10 retries");
                  return new Error("Redis reconnection limit exceeded");
                }
                return Math.min(retries * 100, 3000);
              },
            },
          });

          redisClient.on("error", (err) => {
            console.error("[deleted-storage] Redis client error:", err);
            // Log error details for debugging
            if (err.message.includes("NOAUTH") || err.message.includes("Authentication")) {
              console.error("[deleted-storage] Redis authentication error - check URL format and password");
            }
          });

          redisClient.on("connect", () => {
            console.log("[deleted-storage] Redis client connected");
          });

          redisClient.on("ready", () => {
            console.log("[deleted-storage] Redis client ready");
          });
        } catch (error) {
          console.error("[deleted-storage] Failed to create Redis client:", error);
          redisClient = null;
        }

        // Store in globalThis for serverless reuse (works in both dev and prod)
        if (redisClient) {
          global.__redisClient = redisClient;
        }
      }

      if (redisClient) {
        redisStorage = {
          async add(albumSlug: string, filename: string) {
            if (!redisClient) throw new Error("Redis client not available");
            try {
              // Ensure connection (lazy connect)
              if (!redisClient.isOpen) {
                await redisClient.connect();
              }
              const key = `yeliz-samet:deleted:${albumSlug}`;
              await redisClient.sAdd(key, filename);
              // Set expiration to 30 days (2592000 seconds)
              await redisClient.expire(key, 2592000);
            } catch (error) {
              console.error("[deleted-storage] Redis add error:", error);
              throw error;
            }
          },
          async addMany(albumSlug: string, filenames: string[]) {
            if (!redisClient) throw new Error("Redis client not available");
            try {
              // Ensure connection (lazy connect)
              if (!redisClient.isOpen) {
                await redisClient.connect();
              }
              const key = `yeliz-samet:deleted:${albumSlug}`;
              if (filenames.length > 0) {
                await redisClient.sAdd(key, filenames);
                // Set expiration to 30 days (2592000 seconds)
                await redisClient.expire(key, 2592000);
              }
            } catch (error) {
              console.error("[deleted-storage] Redis addMany error:", error);
              throw error;
            }
          },
          async get(albumSlug: string) {
            if (!redisClient) throw new Error("Redis client not available");
            try {
              // Ensure connection (lazy connect)
              if (!redisClient.isOpen) {
                await redisClient.connect();
              }
              const key = `yeliz-samet:deleted:${albumSlug}`;
              const members = await redisClient.sMembers(key);
              return Array.isArray(members) ? members.map(String) : [];
            } catch (error) {
              console.error("[deleted-storage] Redis get error:", error);
              // Fallback to empty array on error
              return [];
            }
          },
          async has(albumSlug: string, filename: string) {
            if (!redisClient) throw new Error("Redis client not available");
            try {
              // Ensure connection (lazy connect)
              if (!redisClient.isOpen) {
                await redisClient.connect();
              }
              const key = `yeliz-samet:deleted:${albumSlug}`;
              const result = await redisClient.sIsMember(key, filename);
              return Boolean(result);
            } catch (error) {
              console.error("[deleted-storage] Redis has error:", error);
              // Fallback to false on error
              return false;
            }
          },
        };
      }
    } catch (error) {
      console.error("[deleted-storage] Redis initialization failed:", error);
      console.log("[deleted-storage] Falling back to in-memory storage");
    }
  }
}

export const deletedStorage: DeletedStorage = redisStorage || getInMemoryStorage();
