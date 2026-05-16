import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "agent", "visitor"]);
export const listingStatusEnum = pgEnum("listing_status", [
  "pending",
  "approved",
  "rejected",
]);
export const listingTypeEnum = pgEnum("listing_type", [
  "rent",
  "lease",
  "short_stay",
  "sale",
]);
export const propertyCategoryEnum = pgEnum("property_category", [
  "residential",
  "commercial",
  "land",
  "short_stay",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "resolved",
  "dismissed",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  role: userRoleEnum("role").notNull().default("agent"),
  isActive: boolean("is_active").notNull().default(true),
  // Agent profile fields
  bio: text("bio"),
  profileImage: varchar("profile_image", { length: 500 }),
  company: varchar("company", { length: 255 }),
  address: varchar("address", { length: 500 }),
  website: varchar("website", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  linkedin: varchar("linkedin", { length: 255 }),
  yearsExperience: integer("years_experience"),
  specializations: jsonb("specializations").$type<string[]>().default([]),
  // Verification
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").notNull().default(false),
  planType: varchar("plan_type", { length: 50 }).default("monthly"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Listings table
export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  category: propertyCategoryEnum("category").notNull(),
  listingType: listingTypeEnum("listing_type").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("XAF"),
  // Location
  city: varchar("city", { length: 255 }).notNull(),
  area: varchar("area", { length: 255 }),
  address: varchar("address", { length: 500 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  // Property details
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  squareMeters: integer("square_meters"),
  yearBuilt: integer("year_built"),
  floorNumber: integer("floor_number"),
  totalFloors: integer("total_floors"),
  isFurnished: boolean("is_furnished").default(false),
  // Amenities
  hasParking: boolean("has_parking").default(false),
  hasWater: boolean("has_water").default(false),
  hasElectricity: boolean("has_electricity").default(false),
  hasSecurity: boolean("has_security").default(false),
  hasWifi: boolean("has_wifi").default(false),
  hasPool: boolean("has_pool").default(false),
  hasGarden: boolean("has_garden").default(false),
  hasAirConditioning: boolean("has_air_conditioning").default(false),
  hasBalcony: boolean("has_balcony").default(false),
  hasElevator: boolean("has_elevator").default(false),
  // Media
  images: jsonb("images").$type<string[]>().notNull().default([]),
  videoUrl: varchar("video_url", { length: 500 }),
  virtualTourUrl: varchar("virtual_tour_url", { length: 500 }),
  // Contact
  agentName: varchar("agent_name", { length: 255 }).notNull(),
  agentPhone: varchar("agent_phone", { length: 50 }).notNull(),
  agentWhatsapp: varchar("agent_whatsapp", { length: 50 }),
  // Status & Moderation
  status: listingStatusEnum("status").notNull().default("pending"),
  isFlagged: boolean("is_flagged").default(false),
  flagReason: text("flag_reason"),
  rejectionReason: text("rejection_reason"),
  // Features
  isFeatured: boolean("is_featured").default(false),
  featuredUntil: timestamp("featured_until"),
  // Analytics
  viewCount: integer("view_count").default(0),
  contactCount: integer("contact_count").default(0),
  shareCount: integer("share_count").default(0),
  saveCount: integer("save_count").default(0),
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
  expiresAt: timestamp("expires_at"),
});

// Saved listings (favorites)
export const savedListings = pgTable("saved_listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitorId: varchar("visitor_id", { length: 100 }).notNull(), // Can be user ID or anonymous session
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Listing reports
export const listingReports = pgTable("listing_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  reporterEmail: varchar("reporter_email", { length: 255 }),
  reporterPhone: varchar("reporter_phone", { length: 50 }),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: reportStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Listing views (analytics)
export const listingViews = pgTable("listing_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  visitorId: varchar("visitor_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: varchar("user_agent", { length: 500 }),
  referrer: varchar("referrer", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Contact clicks (analytics)
export const contactClicks = pgTable("contact_clicks", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  contactType: varchar("contact_type", { length: 20 }).notNull(), // 'phone' or 'whatsapp'
  visitorId: varchar("visitor_id", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Inquiries (track interest without messaging)
export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  visitorName: varchar("visitor_name", { length: 255 }),
  visitorPhone: varchar("visitor_phone", { length: 50 }).notNull(),
  visitorEmail: varchar("visitor_email", { length: 255 }),
  message: text("message"),
  preferredContact: varchar("preferred_contact", { length: 20 }).default("whatsapp"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
