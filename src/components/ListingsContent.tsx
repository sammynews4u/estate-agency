"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCard } from "./PropertyCard";
import {
  CITIES,
  PROPERTY_CATEGORIES,
  LISTING_TYPES,
  type PropertyCategory,
} from "@/lib/types";

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

export function ListingsContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states - initialize from URL params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [listingType, setListingType] = useState(searchParams.get("listingType") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [furnished, setFurnished] = useState(searchParams.get("furnished") || "");
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (listingType) params.set("listingType", listingType);
    if (city) params.set("city", city);
    if (area.trim()) params.set("area", area.trim());
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (furnished) params.set("furnished", furnished);
    params.set("page", page.toString());

    try {
      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setListings([]);
    }
    setLoading(false);
  }, [search, category, listingType, city, area, minPrice, maxPrice, bedrooms, furnished, page]);

  // Sync from URL on mount and when URL changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setListingType(searchParams.get("listingType") || "");
    setCity(searchParams.get("city") || "");
    setArea(searchParams.get("area") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setBedrooms(searchParams.get("bedrooms") || "");
    setFurnished(searchParams.get("furnished") || "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilter = () => {
    setPage(1);
    fetchListings();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setListingType("");
    setCity("");
    setArea("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setFurnished("");
    setPage(1);
  };

  const categoryLabel = category
    ? PROPERTY_CATEGORIES[category as PropertyCategory]?.label || "Properties"
    : "All Properties";

  const categories = Object.values(PROPERTY_CATEGORIES);
  const listingTypes = Object.values(LISTING_TYPES);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{categoryLabel}</h1>
          <p className="text-gray-500 mt-1">{total} properties found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Types</option>
                {listingTypes.map((type) => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., Bonapriso"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (XAF)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (XAF)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Furnished</label>
              <select
                value={furnished}
                onChange={(e) => setFurnished(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Any</option>
                <option value="true">Furnished</option>
                <option value="false">Unfurnished</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleFilter}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin text-4xl mb-4">🏠</div>
          <p className="text-gray-500">Loading properties...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No properties found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
