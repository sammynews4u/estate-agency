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
    throw new Error(
      "DATABASE_URL is not set. Add it to .env (local) or Vercel Environment Variables."
    );
  }

  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
  const isVercel = process.env.VERCEL === "1";

  return new Pool({
    connectionString: url,
    max: isVercel ? 1 : 10,
    idleTimeoutMillis: isVercel ? 10000 : 30000,
    connectionTimeoutMillis: 10000,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
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

// ── Lazy proxy ──────────────────────────────────────────────
// The DB is NOT connected at import time. This is critical:
// During `next build` on Vercel, DATABASE_URL may not exist.
// The proxy defers connection until a real request calls
// db.select(), db.insert(), etc. at runtime.
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
