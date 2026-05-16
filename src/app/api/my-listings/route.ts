import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await db
      .select()
      .from(listings)
      .where(eq(listings.userId, user.id))
      .orderBy(desc(listings.createdAt));

    return NextResponse.json({ listings: results });
  } catch (error) {
    console.error("My listings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
