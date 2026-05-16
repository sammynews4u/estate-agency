import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listings, users, subscriptions } from "@/db/schema";
import { eq, and, ilike, gte, lte, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const listingType = searchParams.get("listingType");
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const furnished = searchParams.get("furnished");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    const conditions = [eq(listings.status, "approved")];

    if (category) {
      conditions.push(
        eq(listings.category, category as "residential" | "commercial" | "land" | "short_stay")
      );
    }
    if (listingType) {
      conditions.push(
        eq(listings.listingType, listingType as "rent" | "lease" | "short_stay" | "sale")
      );
    }
    if (city) {
      conditions.push(ilike(listings.city, `%${city}%`));
    }
    if (area) {
      conditions.push(ilike(listings.area, `%${area}%`));
    }
    if (minPrice) {
      conditions.push(gte(listings.price, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(listings.price, maxPrice));
    }
    if (bedrooms) {
      conditions.push(eq(listings.bedrooms, parseInt(bedrooms)));
    }
    if (furnished === "true") {
      conditions.push(eq(listings.isFurnished, true));
    } else if (furnished === "false") {
      conditions.push(eq(listings.isFurnished, false));
    }
    if (search) {
      conditions.push(ilike(listings.title, `%${search}%`));
    }

    // Only show listings from users with active subscriptions
    const activeSubUsers = db
      .select({ userId: subscriptions.userId })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.isActive, true),
          gte(subscriptions.endDate, sql`NOW()`)
        )
      );

    conditions.push(sql`${listings.userId} IN (${activeSubUsers})`);

    const where = and(...conditions);

    const [results, countResult] = await Promise.all([
      db
        .select()
        .from(listings)
        .where(where)
        .orderBy(desc(listings.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(listings)
        .where(where),
    ]);

    return NextResponse.json({
      listings: results,
      total: countResult[0]?.count || 0,
      page,
      totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
    });
  } catch (error) {
    console.error("Listings GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "agent" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!user.hasActiveSubscription && user.role !== "admin") {
      return NextResponse.json(
        { error: "Active subscription required to post listings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title, description, category, listingType, price, currency,
      city, area, address, latitude, longitude,
      bedrooms, bathrooms, isFurnished,
      hasParking, hasWater, hasElectricity, hasSecurity, hasWifi,
      images, videoUrl,
      agentName, agentPhone, agentWhatsapp,
    } = body;

    if (!title || !category || !listingType || !price || !city || !agentName || !agentPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [listing] = await db
      .insert(listings)
      .values({
        userId: user.id,
        title,
        description: description || null,
        category,
        listingType,
        price: price.toString(),
        currency: currency || "XAF",
        city,
        area: area || null,
        address: address || null,
        latitude: latitude ? latitude.toString() : null,
        longitude: longitude ? longitude.toString() : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        isFurnished: isFurnished || false,
        hasParking: hasParking || false,
        hasWater: hasWater || false,
        hasElectricity: hasElectricity || false,
        hasSecurity: hasSecurity || false,
        hasWifi: hasWifi || false,
        images: images || [],
        videoUrl: videoUrl || null,
        agentName,
        agentPhone,
        agentWhatsapp: agentWhatsapp || null,
        status: user.role === "admin" ? "approved" : "pending",
      })
      .returning();

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Listings POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
