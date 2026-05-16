import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, subscriptions, listings } from "@/db/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get agent info
    const [agent] = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        bio: users.bio,
        profileImage: users.profileImage,
        company: users.company,
        address: users.address,
        website: users.website,
        facebook: users.facebook,
        instagram: users.instagram,
        linkedin: users.linkedin,
        isVerified: users.isVerified,
        yearsExperience: users.yearsExperience,
        specializations: users.specializations,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(
        and(
          eq(users.id, id),
          eq(users.role, "agent"),
          eq(users.isActive, true),
          eq(subscriptions.isActive, true),
          gte(subscriptions.endDate, sql`NOW()`)
        )
      )
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get agent's listings
    const agentListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.userId, id),
          eq(listings.status, "approved")
        )
      )
      .orderBy(desc(listings.createdAt))
      .limit(12);

    // Get stats
    const stats = await db
      .select({
        totalListings: count(),
        totalViews: sql<number>`COALESCE(SUM(${listings.viewCount}), 0)::int`,
        totalContacts: sql<number>`COALESCE(SUM(${listings.contactCount}), 0)::int`,
      })
      .from(listings)
      .where(
        and(
          eq(listings.userId, id),
          eq(listings.status, "approved")
        )
      );

    return NextResponse.json({
      agent,
      listings: agentListings.map((l) => ({
        ...l,
        images: l.images || [],
      })),
      stats: stats[0] || { totalListings: 0, totalViews: 0, totalContacts: 0 },
    });
  } catch (error) {
    console.error("Get agent error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
