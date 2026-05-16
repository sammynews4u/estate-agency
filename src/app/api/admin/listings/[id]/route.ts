import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, isFlagged, flagReason } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (isFlagged !== undefined) updateData.isFlagged = isFlagged;
    if (flagReason !== undefined) updateData.flagReason = flagReason;

    const [updated] = await db
      .update(listings)
      .set(updateData)
      .where(eq(listings.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ listing: updated });
  } catch (error) {
    console.error("Admin listing update error:", error);
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
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await db.delete(listings).where(eq(listings.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin listing delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
