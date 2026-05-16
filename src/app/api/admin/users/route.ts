import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, subscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const results = await db
      .select({
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
        },
        subscription: {
          id: subscriptions.id,
          isActive: subscriptions.isActive,
          startDate: subscriptions.startDate,
          endDate: subscriptions.endDate,
        },
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: results });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
