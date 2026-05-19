import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  const url = process.env.DATABASE_URL;

  if (!url) {
    result.error = "DATABASE_URL is not set";
    return NextResponse.json(result, { status: 500 });
  }

  // Parse the URL to show (without password)
  try {
    const parsed = new URL(url);
    result.connection = {
      host: parsed.hostname,
      port: parsed.port || "5432",
      database: parsed.pathname.replace("/", ""),
      user: parsed.username,
      passwordSet: parsed.password ? `yes (${parsed.password.length} chars)` : "NO PASSWORD",
      ssl: "will use rejectUnauthorized=false",
    };
  } catch {
    result.connection = "Could not parse DATABASE_URL";
  }

  result.env = {
    JWT_SECRET: process.env.JWT_SECRET ? "✅ Set" : "❌ Missing",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL || "not set",
  };

  // Try connecting directly with pg Pool (bypass drizzle)
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
  const pool = new Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 15000,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    const res = await client.query("SELECT 1 as ok");
    client.release();
    result.database = "✅ Connected successfully";
    result.queryResult = res.rows[0];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.database = `❌ Connection FAILED`;
    result.errorMessage = msg;
    result.errorType = err instanceof Error ? err.constructor.name : typeof err;

    // Common fixes
    if (msg.includes("password")) {
      result.fix = "Password is wrong. Check DATABASE_URL in Vercel env vars.";
    } else if (msg.includes("ENOTFOUND") || msg.includes("getaddrinfo")) {
      result.fix = "Host not found. Check the hostname in DATABASE_URL.";
    } else if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
      result.fix = "Connection timed out. Supabase project may be paused — go to supabase.com and unpause it.";
    } else if (msg.includes("SSL") || msg.includes("ssl")) {
      result.fix = "SSL error. Try adding ?sslmode=require to the end of DATABASE_URL.";
    } else if (msg.includes("ECONNREFUSED")) {
      result.fix = "Connection refused. Database server is not accepting connections.";
    } else {
      result.fix = "Check DATABASE_URL format: postgresql://user:password@host:5432/database";
    }

    await pool.end().catch(() => {});
    return NextResponse.json(result, { status: 500 });
  }

  // Check tables
  try {
    const client = await pool.connect();
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    client.release();
    const tableNames = tables.rows.map((r: Record<string, unknown>) => r.table_name);
    result.tables = tableNames;

    const required = ["users", "subscriptions", "listings"];
    const missing = required.filter((t) => !tableNames.includes(t));

    if (missing.length > 0) {
      result.status = "❌ TABLES MISSING";
      result.missingTables = missing;
      result.fix = "Go to Supabase SQL Editor and run the SQL from supabase-setup.sql";
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.tables = `❌ Failed: ${msg}`;
  }

  // Check data
  try {
    const client = await pool.connect();
    const users = await client.query("SELECT COUNT(*)::int as count FROM users");
    const listings = await client.query("SELECT COUNT(*)::int as count FROM listings");
    client.release();

    const uCount = users.rows[0]?.count || 0;
    const lCount = listings.rows[0]?.count || 0;
    result.data = { users: uCount, listings: lCount };

    if (uCount === 0) {
      result.status = result.status || "⚠️ NO DATA";
      result.nextStep = "Visit /api/seed to create demo data";
    } else {
      result.status = result.status || "✅ ALL GOOD";
      result.login = {
        url: "/login",
        admin: { email: "samuel.adesanya1love@gmail.com", password: "admin123" },
      };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.data = `❌ ${msg}`;
  }

  await pool.end().catch(() => {});
  return NextResponse.json(result);
}
