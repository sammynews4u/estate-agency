"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PROPERTY_CATEGORIES,
  LISTING_TYPES,
  formatPrice,
  type PropertyCategory,
  type ListingType,
} from "@/lib/types";
import { getVisitorId } from "@/lib/visitor";

interface Listing {
  id: string;
  title: string;
  category: string;
  listingType: string;
  price: string;
  currency: string;
  city: string;
  area: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  isFurnished: boolean | null;
  images: string[];
  agentName: string;
  status: string;
  viewCount?: number | null;
  isFeatured?: boolean | null;
}

const placeholderBg = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
];

export function PropertyCard({ listing, showStats = false }: { listing: Listing; showStats?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const bgIdx = listing.title.length % placeholderBg.length;
  const category = PROPERTY_CATEGORIES[listing.category as PropertyCategory];
  const listingType = LISTING_TYPES[listing.listingType as ListingType];

  useEffect(() => {
    // Check if saved
    const visitorId = getVisitorId();
    if (visitorId) {
      fetch(`/api/listings/${listing.id}/save?visitorId=${visitorId}`)
        .then((r) => r.json())
        .then((data) => setSaved(data.saved))
        .catch(() => {});
    }
  }, [listing.id]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const visitorId = getVisitorId();
    if (!visitorId) return;

    setSaving(true);
    try {
      if (saved) {
        await fetch(`/api/listings/${listing.id}/save?visitorId=${visitorId}`, {
          method: "DELETE",
        });
        setSaved(false);
      } else {
        await fetch(`/api/listings/${listing.id}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });
        setSaved(true);
      }
    } catch {
      // Ignore errors
    }
    setSaving(false);
  };

  return (
    <div className="relative group">
      <Link href={`/listings/${listing.id}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${placeholderBg[bgIdx]} flex items-center justify-center`}
              >
                <span className="text-5xl opacity-50">
                  {category?.icon || "🏠"}
                </span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`${listingType?.bgColor || "bg-gray-600"} text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow`}
              >
                {listingType?.label || listing.listingType}
              </span>
              {listing.isFeatured && (
                <span className="bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                  ⭐ Featured
                </span>
              )}
            </div>
            
            <div className="absolute top-3 right-3">
              <span className="bg-white/95 backdrop-blur text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full shadow">
                {category?.label || listing.category}
              </span>
            </div>

            {/* Image count badge */}
            {listing.images && listing.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                📷 {listing.images.length}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-xl font-bold text-primary">
                {formatPrice(listing.price, listing.currency)}
                {listing.listingType === "rent" || listing.listingType === "short_stay"
                  ? <span className="text-sm font-normal text-gray-500">/mo</span>
                  : null}
              </div>
              {showStats && listing.viewCount !== undefined && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  👁️ {listing.viewCount}
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-primary transition">
              {listing.title}
            </h3>
            
            <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">
                {listing.city}
                {listing.area ? `, ${listing.area}` : ""}
              </span>
            </p>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              {listing.bedrooms !== null && listing.bedrooms !== undefined && (
                <span className="flex items-center gap-1">
                  🛏️ {listing.bedrooms}
                </span>
              )}
              {listing.bathrooms !== null && listing.bathrooms !== undefined && (
                <span className="flex items-center gap-1">
                  🚿 {listing.bathrooms}
                </span>
              )}
              {listing.isFurnished && (
                <span className="flex items-center gap-1 text-green-600">
                  ✓ Furnished
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`absolute top-3 right-14 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow ${
          saved
            ? "bg-red-500 text-white"
            : "bg-white/95 text-gray-400 hover:text-red-500"
        }`}
        title={saved ? "Remove from saved" : "Save property"}
      >
        {saving ? (
          <span className="animate-spin text-xs">⏳</span>
        ) : (
          <span>{saved ? "❤️" : "🤍"}</span>
        )}
      </button>
    </div>
  );
}
