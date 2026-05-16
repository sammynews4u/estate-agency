import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Listing GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [existing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title", "description", "category", "listingType", "price", "currency",
      "city", "area", "address", "latitude", "longitude",
      "bedrooms", "bathrooms", "isFurnished",
      "hasParking", "hasWater", "hasElectricity", "hasSecurity", "hasWifi",
      "images", "videoUrl", "agentName", "agentPhone", "agentWhatsapp",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "price" || field === "latitude" || field === "longitude") {
          updateData[field] = body[field]?.toString() ?? null;
        } else if (field === "bedrooms" || field === "bathrooms") {
          updateData[field] = body[field] ? parseInt(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Re-set to pending on edit (unless admin)
    if (user.role !== "admin") {
      updateData.status = "pending";
    }
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(listings)
      .set(updateData)
      .where(eq(listings.id, id))
      .returning();

    return NextResponse.json({ listing: updated });
  } catch (error) {
    console.error("Listing PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [existing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(listings).where(eq(listings.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Listing DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
