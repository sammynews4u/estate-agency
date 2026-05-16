import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, subscriptions, listings } from "@/db/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const city = searchParams.get("city");
    const offset = (page - 1) * limit;

    const results = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        bio: users.bio,
        profileImage: users.profileImage,
        company: users.company,
        isVerified: users.isVerified,
        yearsExperience: users.yearsExperience,
        specializations: users.specializations,
        createdAt: users.createdAt,
        listingsCount: count(listings.id),
      })
      .from(users)
      .innerJoin(subscriptions, eq(users.id, subscriptions.userId))
      .leftJoin(
        listings,
        and(
          eq(listings.userId, users.id),
          eq(listings.status, "approved")
        )
      )
      .where(
        and(
          eq(users.role, "agent"),
          eq(users.isActive, true),
          eq(subscriptions.isActive, true),
          gte(subscriptions.endDate, sql`NOW()`)
        )
      )
      .groupBy(users.id)
      .orderBy(desc(count(listings.id)))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ agents: results });
  } catch (error) {
    console.error("Get agents error:", error);
    return NextResponse.json({ agents: [] });
  }
}
