import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings, subscriptions } from "@/db/schema";
import { eq, and, ne, gte, sql, or } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the current listing
    const [currentListing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    if (!currentListing) {
      return NextResponse.json({ listings: [] });
    }

    // Get users with active subscriptions
    const activeSubUsers = db
      .select({ userId: subscriptions.userId })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.isActive, true),
          gte(subscriptions.endDate, sql`NOW()`)
        )
      );

    // Find similar listings based on category, city, and price range
    const priceNum = parseFloat(currentListing.price);
    const minPrice = (priceNum * 0.5).toString();
    const maxPrice = (priceNum * 1.5).toString();

    const similar = await db
      .select()
      .from(listings)
      .where(
        and(
          ne(listings.id, id),
          eq(listings.status, "approved"),
          sql`${listings.userId} IN (${activeSubUsers})`,
          or(
            eq(listings.category, currentListing.category),
            eq(listings.city, currentListing.city),
            and(
              gte(listings.price, minPrice),
              sql`${listings.price} <= ${maxPrice}`
            )
          )
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(4);

    return NextResponse.json({
      listings: similar.map((l) => ({
        ...l,
        images: l.images || [],
      })),
    });
  } catch (error) {
    console.error("Similar listings error:", error);
    return NextResponse.json({ listings: [] });
  }
}
