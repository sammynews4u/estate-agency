import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries, listings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// Create inquiry (visitor to agent)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, visitorName, visitorPhone, visitorEmail, message, preferredContact } = body;

    if (!listingId || !visitorPhone) {
      return NextResponse.json(
        { error: "Listing ID and phone required" },
        { status: 400 }
      );
    }

    // Get the listing to find the agent
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    await db.insert(inquiries).values({
      listingId,
      agentId: listing.userId,
      visitorName: visitorName || null,
      visitorPhone,
      visitorEmail: visitorEmail || null,
      message: message || null,
      preferredContact: preferredContact || "whatsapp",
    });

    return NextResponse.json({ success: true, message: "Inquiry submitted" });
  } catch (error) {
    console.error("Create inquiry error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}

// Get agent's inquiries
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await db
      .select({
        inquiry: inquiries,
        listing: {
          id: listings.id,
          title: listings.title,
          images: listings.images,
        },
      })
      .from(inquiries)
      .leftJoin(listings, eq(inquiries.listingId, listings.id))
      .where(eq(inquiries.agentId, user.id))
      .orderBy(desc(inquiries.createdAt));

    return NextResponse.json({ inquiries: results });
  } catch (error) {
    console.error("Get inquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
