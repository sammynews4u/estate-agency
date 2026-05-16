import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listingReports } from "@/db/schema";
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
    const { status, adminNotes } = body;

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === "resolved" || status === "dismissed") {
        updateData.resolvedAt = new Date();
      }
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const [updated] = await db
      .update(listingReports)
      .set(updateData)
      .where(eq(listingReports.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ report: updated });
  } catch (error) {
    console.error("Update report error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
