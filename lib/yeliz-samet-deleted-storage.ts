/**
 * Yeliz-Samet deleted images storage
 * Uses @vercel/kv if available, otherwise in-memory Map fallback for local dev
 */

type DeletedStorage = {
  add: (albumSlug: string, filename: string) => Promise<void>;
  get: (albumSlug: string) => Promise<string[]>;
  has: (albumSlug: string, filename: string) => Promise<boolean>;
};

// In-memory fallback for local development
const inMemoryStorage = new Map<string, Set<string>>();

const getInMemoryStorage = (): DeletedStorage => {
  return {
    async add(albumSlug: string, filename: string) {
      const key = `ys:deleted:index:${albumSlug}`;
      if (!inMemoryStorage.has(key)) {
        inMemoryStorage.set(key, new Set());
      }
      inMemoryStorage.get(key)!.add(filename);
    },
    async get(albumSlug: string) {
      const key = `ys:deleted:index:${albumSlug}`;
      const set = inMemoryStorage.get(key);
      return set ? Array.from(set) : [];
    },
    async has(albumSlug: string, filename: string) {
      const key = `ys:deleted:index:${albumSlug}`;
      const set = inMemoryStorage.get(key);
      return set ? set.has(filename) : false;
    },
  };
};

// Try to use @vercel/kv if available
let kvStorage: DeletedStorage | null = null;

// Initialize KV storage if available (runtime check)
if (typeof window === "undefined" && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  // Only try to load @vercel/kv on server side
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const kvModule = require("@vercel/kv");
    const kv = kvModule.kv || kvModule.default;
    
    if (kv) {
      kvStorage = {
        async add(albumSlug: string, filename: string) {
          const key = `ys:deleted:index:${albumSlug}`;
          await kv.sadd(key, filename);
          // Set expiration to 30 days (2592000 seconds)
          await kv.expire(key, 2592000);
        },
        async get(albumSlug: string) {
          const key = `ys:deleted:index:${albumSlug}`;
          const members = await kv.smembers(key);
          return Array.isArray(members) ? members.map(String) : [];
        },
        async has(albumSlug: string, filename: string) {
          const key = `ys:deleted:index:${albumSlug}`;
          const result = await kv.sismember(key, filename);
          return result === 1;
        },
      };
    }
  } catch {
    // @vercel/kv not available or not configured, use in-memory fallback
    console.log("[deleted-storage] Using in-memory fallback (KV not available)");
  }
}

export const deletedStorage: DeletedStorage = kvStorage || getInMemoryStorage();
