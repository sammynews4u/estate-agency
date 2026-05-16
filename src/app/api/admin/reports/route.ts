import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listingReports, listings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const results = await db
      .select({
        report: listingReports,
        listing: {
          id: listings.id,
          title: listings.title,
          status: listings.status,
        },
      })
      .from(listingReports)
      .leftJoin(listings, eq(listingReports.listingId, listings.id))
      .where(status ? eq(listingReports.status, status as "pending" | "reviewed" | "resolved" | "dismissed") : undefined)
      .orderBy(desc(listingReports.createdAt));

    return NextResponse.json({ reports: results });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
