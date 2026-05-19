import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __dbPool?: Pool;
  __db?: NodePgDatabase<typeof schema>;
};

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }

  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

  return new Pool({
    connectionString: url,
    max: 3,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 15000,
    // Supabase REQUIRES SSL
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
}

function getPool(): Pool {
  if (globalForDb.__dbPool) return globalForDb.__dbPool;
  const pool = createPool();
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__dbPool = pool;
  }
  return pool;
}

function getDb(): NodePgDatabase<typeof schema> {
  if (globalForDb.__db) return globalForDb.__db;
  const instance = drizzle(getPool(), { schema });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__db = instance;
  }
  return instance;
}

export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_target, prop) {
      const real = getDb();
      const val = (real as unknown as Record<string | symbol, unknown>)[prop];
      return typeof val === "function" ? val.bind(real) : val;
    },
  }
);

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const real = getPool();
    const val = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(real) : val;
  },
});
