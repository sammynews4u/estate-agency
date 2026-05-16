import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
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
    const { isActive, endDate } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isActive === true && !body.startDate) {
      updateData.startDate = new Date();
    }
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const [updated] = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error("Admin subscription update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
