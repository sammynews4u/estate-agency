import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings, contactClicks } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { contactType, visitorId } = body;

    if (!contactType || !["phone", "whatsapp"].includes(contactType)) {
      return NextResponse.json({ error: "Invalid contact type" }, { status: 400 });
    }

    // Record the contact click
    await db.insert(contactClicks).values({
      listingId: id,
      contactType,
      visitorId: visitorId || null,
    });

    // Increment contact count
    await db
      .update(listings)
      .set({ contactCount: sql`${listings.contactCount} + 1` })
      .where(eq(listings.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
