import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const conditions = [];
    if (status) {
      conditions.push(
        eq(listings.status, status as "pending" | "approved" | "rejected")
      );
    }

    const where = conditions.length > 0 ? conditions[0] : undefined;

    const results = await db
      .select({
        listing: listings,
        userName: users.name,
        userEmail: users.email,
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .where(where)
      .orderBy(desc(listings.createdAt));

    return NextResponse.json({ listings: results });
  } catch (error) {
    console.error("Admin listings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
