"use client";
import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { LoadingPage } from "@/components/Loading";
import { getVisitorId } from "@/lib/visitor";
import Link from "next/link";

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
}

export default function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const visitorId = getVisitorId();
    fetch(`/api/saved?visitorId=${visitorId}`)
      .then((r) => r.json())
      .then((data) => {
        setListings(data.listings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Saved Properties</h1>
        <p className="text-gray-500 mt-1">
          Properties you&apos;ve saved for later
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold mb-2">No saved properties</h3>
          <p className="text-gray-500 mb-6">
            Click the heart icon on any property to save it here
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
