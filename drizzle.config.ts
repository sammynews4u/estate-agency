import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local first (local dev with Supabase), then .env as fallback
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Set it in .env or .env.local");
}

const isLocal =
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: isLocal ? false : "require",
  },
  verbose: true,
  strict: true,
});
