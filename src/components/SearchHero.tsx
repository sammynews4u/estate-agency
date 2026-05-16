"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, PROPERTY_CATEGORIES } from "@/lib/types";

export function SearchHero() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    router.push(`/listings?${params.toString()}`);
  };

  const categories = Object.values(PROPERTY_CATEGORIES);

  return (
    <form
      onSubmit={handleSearch}
      className="max-w-4xl mx-auto bg-white rounded-2xl p-3 shadow-2xl"
    >
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
        >
          <option value="">All Cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition whitespace-nowrap"
        >
          🔍 Search
        </button>
      </div>
    </form>
  );
}
