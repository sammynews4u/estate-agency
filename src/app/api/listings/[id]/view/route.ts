import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings, listingViews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const visitorId = body.visitorId || null;
    
    // Get IP and user agent
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";

    // Record the view
    await db.insert(listingViews).values({
      listingId: id,
      visitorId,
      ipAddress: ip,
      userAgent: userAgent.slice(0, 500),
      referrer: referrer.slice(0, 500),
    });

    // Increment view count
    await db
      .update(listings)
      .set({ viewCount: sql`${listings.viewCount} + 1` })
      .where(eq(listings.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
