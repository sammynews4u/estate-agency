import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL
        ? `✅ Set (${process.env.DATABASE_URL.substring(0, 30)}...)`
        : "❌ MISSING — add DATABASE_URL to Vercel Environment Variables",
      JWT_SECRET: process.env.JWT_SECRET
        ? "✅ Set"
        : "⚠️ Missing — using fallback (not secure for production)",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || "not set",
    },
  };

  // Step 1: Test DB connection
  try {
    await db.execute(sql`SELECT 1 as ok`);
    result.database = "✅ Connected";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.database = `❌ Connection failed: ${msg}`;
    result.fix = "Check DATABASE_URL. Make sure password is correct and Supabase project is active.";
    return NextResponse.json(result, { status: 500 });
  }

  // Step 2: Check tables
  try {
    const tables = await db.execute(sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    const tableNames = tables.rows.map((r: Record<string, unknown>) => r.table_name as string);
    result.tables = tableNames;

    const required = ["users", "subscriptions", "listings"];
    const missing = required.filter((t) => !tableNames.includes(t));

    if (missing.length > 0) {
      result.status = "❌ TABLES MISSING";
      result.missingTables = missing;
      result.fix = [
        "Tables don't exist yet in Supabase. Run this on YOUR LOCAL MACHINE:",
        "",
        "1. Create file .env.local with:",
        "   DATABASE_URL=postgresql://postgres:Toluwase2020@db.ktbfrwlxhbufufnaavjc.supabase.co:5432/postgres",
        "",
        "2. Run: npx drizzle-kit push",
        "",
        "3. Then visit /api/seed to create demo data",
      ];
      return NextResponse.json(result, { status: 500 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.tables = `❌ Failed to check: ${msg}`;
    return NextResponse.json(result, { status: 500 });
  }

  // Step 3: Check data
  try {
    const userCount = await db.execute(sql`SELECT COUNT(*)::int as count FROM users`);
    const listingCount = await db.execute(sql`SELECT COUNT(*)::int as count FROM listings`);
    const uCount = Number(userCount.rows[0]?.count || 0);
    const lCount = Number(listingCount.rows[0]?.count || 0);

    result.data = { users: uCount, listings: lCount };

    if (uCount === 0) {
      result.status = "⚠️ NO DATA — visit /api/seed to create demo users and listings";
      return NextResponse.json(result);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.data = `❌ Failed: ${msg}`;
    return NextResponse.json(result, { status: 500 });
  }

  // Step 4: Test login ability
  try {
    const admin = await db.execute(
      sql`SELECT id, email, name, role FROM users WHERE email = 'samuel.adesanya1love@gmail.com' LIMIT 1`
    );
    if (admin.rows.length > 0) {
      result.adminAccount = "✅ Found";
    } else {
      result.adminAccount = "❌ Not found — visit /api/seed";
    }
  } catch {
    result.adminAccount = "❌ Query failed";
  }

  result.status = "✅ EVERYTHING READY";
  result.login = {
    url: "/login",
    admin: { email: "samuel.adesanya1love@gmail.com", password: "admin123" },
    agent: { email: "marie.nguema@gmail.com", password: "agent123" },
  };

  return NextResponse.json(result);
}
