"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "./Toast";
import { PropertyCard } from "./PropertyCard";
import { ImageGallery } from "./ImageGallery";
import { ContactButtons } from "./ContactButtons";
import { ReportModal } from "./ReportModal";
import { InquiryForm } from "./InquiryForm";
import { RentCalculator } from "./RentCalculator";
import {
  PROPERTY_CATEGORIES,
  LISTING_TYPES,
  formatPriceFull,
  type PropertyCategory,
  type ListingType,
} from "@/lib/types";
import { getVisitorId, addToRecentlyViewed } from "@/lib/visitor";

interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  listingType: string;
  price: string;
  currency: string;
  city: string;
  area: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareMeters: number | null;
  yearBuilt: number | null;
  isFurnished: boolean | null;
  hasParking: boolean | null;
  hasWater: boolean | null;
  hasElectricity: boolean | null;
  hasSecurity: boolean | null;
  hasWifi: boolean | null;
  hasPool: boolean | null;
  hasGarden: boolean | null;
  hasAirConditioning: boolean | null;
  hasBalcony: boolean | null;
  hasElevator: boolean | null;
  images: string[];
  videoUrl: string | null;
  virtualTourUrl: string | null;
  agentName: string;
  agentPhone: string;
  agentWhatsapp: string | null;
  status: string;
  viewCount: number | null;
  contactCount: number | null;
  shareCount: number | null;
  saveCount: number | null;
  isFeatured: boolean | null;
  createdAt: Date;
}

interface Agent {
  id: string;
  name: string;
  phone: string | null;
  isVerified: boolean | null;
  company: string | null;
  profileImage: string | null;
}

interface SimilarListing {
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
}

export function ListingDetail({
  listing,
  agent,
}: {
  listing: Listing;
  agent: Agent | null;
}) {
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [similarListings, setSimilarListings] = useState<SimilarListing[]>([]);
  const [copied, setCopied] = useState(false);

  const category = PROPERTY_CATEGORIES[listing.category as PropertyCategory];
  const listingType = LISTING_TYPES[listing.listingType as ListingType];

  const amenities = [
    { key: "hasParking", label: "Parking", icon: "🅿️", value: listing.hasParking },
    { key: "hasWater", label: "Water", icon: "💧", value: listing.hasWater },
    { key: "hasElectricity", label: "Electricity", icon: "⚡", value: listing.hasElectricity },
    { key: "hasSecurity", label: "Security", icon: "🔒", value: listing.hasSecurity },
    { key: "hasWifi", label: "WiFi", icon: "📶", value: listing.hasWifi },
    { key: "hasPool", label: "Pool", icon: "🏊", value: listing.hasPool },
    { key: "hasGarden", label: "Garden", icon: "🌳", value: listing.hasGarden },
    { key: "hasAirConditioning", label: "A/C", icon: "❄️", value: listing.hasAirConditioning },
    { key: "hasBalcony", label: "Balcony", icon: "🏠", value: listing.hasBalcony },
    { key: "hasElevator", label: "Elevator", icon: "🛗", value: listing.hasElevator },
  ];

  useEffect(() => {
    const visitorId = getVisitorId();
    
    // Track view
    fetch(`/api/listings/${listing.id}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    }).catch(() => {});

    // Add to recently viewed
    addToRecentlyViewed(listing.id);

    // Check if saved
    if (visitorId) {
      fetch(`/api/listings/${listing.id}/save?visitorId=${visitorId}`)
        .then((r) => r.json())
        .then((data) => setSaved(data.saved))
        .catch(() => {});
    }

    // Load similar listings
    fetch(`/api/listings/${listing.id}/similar`)
      .then((r) => r.json())
      .then((data) => setSimilarListings(data.listings || []))
      .catch(() => {});
  }, [listing.id]);

  const handleSave = async () => {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    try {
      if (saved) {
        await fetch(`/api/listings/${listing.id}/save?visitorId=${visitorId}`, {
          method: "DELETE",
        });
        setSaved(false);
        showToast("Removed from saved", "info");
      } else {
        await fetch(`/api/listings/${listing.id}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });
        setSaved(true);
        showToast("Saved to favorites", "success");
      }
    } catch {
      showToast("Failed to save", "error");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this property: ${listing.title}`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 print:hidden">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-primary">Listings</Link>
        <span>/</span>
        <Link href={`/listings?category=${listing.category}`} className="hover:text-primary">
          {category?.label}
        </Link>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-xs">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <ImageGallery
            images={listing.images}
            title={listing.title}
            category={listing.category}
            videoUrl={listing.videoUrl}
            virtualTourUrl={listing.virtualTourUrl}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                saved
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500"
              }`}
            >
              {saved ? "❤️" : "🤍"} {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary transition"
            >
              📤 {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-red-500 transition ml-auto"
            >
              🚩 Report
            </button>
          </div>

          {/* Title & Price */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`${listingType?.bgColor || "bg-gray-600"} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
                    {listingType?.label || listing.listingType}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {category?.label || listing.category}
                  </span>
                  {listing.isFeatured && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      ⭐ Featured
                    </span>
                  )}
                  {listing.status === "pending" && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      ⏳ Pending Approval
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
                <p className="text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {listing.city}
                  {listing.area ? `, ${listing.area}` : ""}
                  {listing.address ? ` · ${listing.address}` : ""}
                </p>
                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <span>👁️ {listing.viewCount || 0} views</span>
                  <span>❤️ {listing.saveCount || 0} saved</span>
                  <span>📅 Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {formatPriceFull(listing.price, listing.currency)}
                </div>
                {(listing.listingType === "rent" || listing.listingType === "short_stay") && (
                  <span className="text-sm text-gray-500">per month</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listing.bedrooms !== null && (
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl mb-1">🛏️</div>
                  <div className="font-bold text-lg">{listing.bedrooms}</div>
                  <div className="text-xs text-gray-500">Bedrooms</div>
                </div>
              )}
              {listing.bathrooms !== null && (
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl mb-1">🚿</div>
                  <div className="font-bold text-lg">{listing.bathrooms}</div>
                  <div className="text-xs text-gray-500">Bathrooms</div>
                </div>
              )}
              {listing.squareMeters !== null && (
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl mb-1">📐</div>
                  <div className="font-bold text-lg">{listing.squareMeters}</div>
                  <div className="text-xs text-gray-500">m²</div>
                </div>
              )}
              <div className="text-center bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">{listing.isFurnished ? "✅" : "❌"}</div>
                <div className="font-bold text-sm">{listing.isFurnished ? "Furnished" : "Unfurnished"}</div>
                <div className="text-xs text-gray-500">Furniture</div>
              </div>
              {listing.yearBuilt !== null && (
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl mb-1">🏗️</div>
                  <div className="font-bold text-lg">{listing.yearBuilt}</div>
                  <div className="text-xs text-gray-500">Year Built</div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {amenities.filter(a => a.value).map((a) => (
                <div
                  key={a.key}
                  className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700"
                >
                  <span>{a.icon}</span>
                  <span className="text-sm font-medium">{a.label}</span>
                </div>
              ))}
              {amenities.filter(a => !a.value).map((a) => (
                <div
                  key={a.key}
                  className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 text-gray-400"
                >
                  <span>{a.icon}</span>
                  <span className="text-sm font-medium">{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          {listing.latitude && listing.longitude && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden">
              <h2 className="text-lg font-bold mb-3">Location</h2>
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${listing.latitude},${listing.longitude}&zoom=15`}
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-primary hover:text-primary-dark font-medium text-sm"
              >
                📍 Open in Google Maps →
              </a>
            </div>
          )}

          {/* Rent Calculator */}
          {(listing.listingType === "rent" || listing.listingType === "lease") && (
            <RentCalculator monthlyRent={parseFloat(listing.price)} currency={listing.currency} />
          )}

          {/* Similar Listings */}
          {similarListings.length > 0 && (
            <div className="print:hidden">
              <h2 className="text-xl font-bold mb-4">Similar Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarListings.map((l) => (
                  <PropertyCard key={l.id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 print:hidden">
          {/* Agent Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Contact Agent</h3>
            
            {agent && (
              <Link href={`/agents/${agent.id}`} className="flex items-center gap-3 mb-4 group">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                  {agent.profileImage ? (
                    <img src={agent.profileImage} alt={agent.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
                <div>
                  <div className="font-semibold group-hover:text-primary transition flex items-center gap-1">
                    {agent.name}
                    {agent.isVerified && <span className="text-blue-500 text-sm">✓</span>}
                  </div>
                  {agent.company && (
                    <div className="text-sm text-gray-500">{agent.company}</div>
                  )}
                  <div className="text-xs text-primary">View Profile →</div>
                </div>
              </Link>
            )}

            <ContactButtons
              phone={listing.agentPhone}
              whatsapp={listing.agentWhatsapp}
              title={listing.title}
              listingId={listing.id}
            />

            <div className="mt-4">
              <button
                onClick={() => setShowInquiry(true)}
                className="w-full border-2 border-primary text-primary px-4 py-3 rounded-lg font-semibold hover:bg-primary/5 transition"
              >
                📝 Send Inquiry
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Contact the agent directly. PropFind does not handle transactions.
              </p>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
            <h4 className="font-semibold text-amber-800 mb-2">🛡️ Safety Tips</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Visit the property in person before paying</li>
              <li>• Never send money without seeing documents</li>
              <li>• Verify the agent&apos;s identity</li>
              <li>• Be cautious of deals that seem too good</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReport && (
        <ReportModal
          listingId={listing.id}
          onClose={() => setShowReport(false)}
        />
      )}
      {showInquiry && (
        <InquiryForm
          listingId={listing.id}
          listingTitle={listing.title}
          onClose={() => setShowInquiry(false)}
        />
      )}
    </div>
  );
}
