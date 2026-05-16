import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listingReports } from "@/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, description, reporterEmail, reporterPhone } = body;

    if (!reason) {
      return NextResponse.json({ error: "Reason required" }, { status: 400 });
    }

    await db.insert(listingReports).values({
      listingId: id,
      reason,
      description: description || null,
      reporterEmail: reporterEmail || null,
      reporterPhone: reporterPhone || null,
    });

    return NextResponse.json({ success: true, message: "Report submitted" });
  } catch (error) {
    console.error("Report listing error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
