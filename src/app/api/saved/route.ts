import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings, savedListings, subscriptions } from "@/db/schema";
import { eq, and, gte, sql, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId");

    if (!visitorId) {
      return NextResponse.json({ listings: [] });
    }

    // Get saved listing IDs
    const saved = await db
      .select({ listingId: savedListings.listingId })
      .from(savedListings)
      .where(eq(savedListings.visitorId, visitorId));

    if (saved.length === 0) {
      return NextResponse.json({ listings: [] });
    }

    const listingIds = saved.map((s) => s.listingId);

    // Get active subscription users
    const activeSubUsers = db
      .select({ userId: subscriptions.userId })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.isActive, true),
          gte(subscriptions.endDate, sql`NOW()`)
        )
      );

    // Get the saved listings
    const results = await db
      .select()
      .from(listings)
      .where(
        and(
          inArray(listings.id, listingIds),
          eq(listings.status, "approved"),
          sql`${listings.userId} IN (${activeSubUsers})`
        )
      );

    return NextResponse.json({
      listings: results.map((l) => ({
        ...l,
        images: l.images || [],
      })),
    });
  } catch (error) {
    console.error("Get saved listings error:", error);
    return NextResponse.json({ listings: [] });
  }
}
