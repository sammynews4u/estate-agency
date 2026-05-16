import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings, savedListings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Save a listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json({ error: "Visitor ID required" }, { status: 400 });
    }

    // Check if already saved
    const existing = await db
      .select()
      .from(savedListings)
      .where(
        and(
          eq(savedListings.listingId, id),
          eq(savedListings.visitorId, visitorId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ saved: true, message: "Already saved" });
    }

    // Save the listing
    await db.insert(savedListings).values({
      listingId: id,
      visitorId,
    });

    // Increment save count
    await db
      .update(listings)
      .set({ saveCount: sql`${listings.saveCount} + 1` })
      .where(eq(listings.id, id));

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Save listing error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// Unsave a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId");

    if (!visitorId) {
      return NextResponse.json({ error: "Visitor ID required" }, { status: 400 });
    }

    await db
      .delete(savedListings)
      .where(
        and(
          eq(savedListings.listingId, id),
          eq(savedListings.visitorId, visitorId)
        )
      );

    // Decrement save count
    await db
      .update(listings)
      .set({ saveCount: sql`GREATEST(${listings.saveCount} - 1, 0)` })
      .where(eq(listings.id, id));

    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error("Unsave listing error:", error);
    return NextResponse.json({ error: "Failed to unsave" }, { status: 500 });
  }
}

// Check if saved
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId");

    if (!visitorId) {
      return NextResponse.json({ saved: false });
    }

    const existing = await db
      .select()
      .from(savedListings)
      .where(
        and(
          eq(savedListings.listingId, id),
          eq(savedListings.visitorId, visitorId)
        )
      )
      .limit(1);

    return NextResponse.json({ saved: existing.length > 0 });
  } catch (error) {
    console.error("Check saved error:", error);
    return NextResponse.json({ saved: false });
  }
}
