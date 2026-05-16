"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { StatsCard, StatsGrid } from "@/components/StatsCard";
import { LoadingPage } from "@/components/Loading";

interface Listing {
  id: string;
  title: string;
  category: string;
  listingType: string;
  price: string;
  currency: string;
  city: string;
  area: string | null;
  status: string;
  createdAt: string;
  isFlagged: boolean | null;
  images: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/my-listings");
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      showToast("Failed to load listings", "error");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings(listings.filter((l) => l.id !== id));
        showToast("Listing deleted successfully", "success");
      } else {
        showToast("Failed to delete listing", "error");
      }
    } catch {
      showToast("Failed to delete listing", "error");
    }
    setDeleteId(null);
  };

  if (authLoading || loading) {
    return <LoadingPage />;
  }

  if (!user) return null;

  const stats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };

  const filteredListings = filter === "all" 
    ? listings 
    : listings.filter((l) => l.status === filter);

  const daysUntilExpiry = user.subscription?.endDate
    ? Math.ceil((new Date(user.subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name}! 👋</p>
        </div>
        {user.hasActiveSubscription && (
          <Link
            href="/dashboard/new"
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <span className="text-xl">+</span> New Listing
          </Link>
        )}
      </div>

      {/* Subscription Status Card */}
      <div
        className={`rounded-xl p-6 mb-8 border-2 ${
          user.hasActiveSubscription
            ? daysUntilExpiry <= 7
              ? "bg-amber-50 border-amber-200"
              : "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`text-4xl p-3 rounded-xl ${
              user.hasActiveSubscription ? "bg-green-100" : "bg-red-100"
            }`}>
              {user.hasActiveSubscription ? "✅" : "⚠️"}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                Subscription {user.hasActiveSubscription ? "Active" : "Inactive"}
              </h3>
              {user.hasActiveSubscription && user.subscription?.endDate ? (
                <div>
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(user.subscription.endDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {daysUntilExpiry <= 7 && (
                    <p className="text-sm text-amber-600 font-medium mt-1">
                      ⚠️ Only {daysUntilExpiry} days remaining!
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Activate your subscription to start posting properties
                </p>
              )}
            </div>
          </div>
          {!user.hasActiveSubscription && (
            <div className="bg-white px-4 py-3 rounded-lg text-sm">
              <p className="font-medium text-gray-700">Contact Admin</p>
              <p className="text-gray-500">📧 admin@propfind.com</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <StatsGrid>
        <StatsCard icon="📋" label="Total Listings" value={stats.total} color="blue" />
        <StatsCard icon="✅" label="Approved" value={stats.approved} color="green" />
        <StatsCard icon="⏳" label="Pending" value={stats.pending} color="amber" />
        <StatsCard icon="❌" label="Rejected" value={stats.rejected} color="red" />
      </StatsGrid>

      {/* Filter & Listings */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">My Listings</h2>
          <div className="flex gap-2">
            {["all", "approved", "pending", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">
              {filter === "all" ? "No listings yet" : `No ${filter} listings`}
            </h3>
            <p className="text-gray-500 mb-6">
              {user.hasActiveSubscription
                ? "Start by creating your first property listing"
                : "Activate your subscription to start listing properties"}
            </p>
            {user.hasActiveSubscription && (
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition"
              >
                <span>+</span> Create Your First Listing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image */}
                  <div className="w-full md:w-40 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-3xl">
                        🏠
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[listing.status]}`}>
                            {listing.status}
                          </span>
                          {listing.isFlagged && (
                            <span className="text-xs text-red-500">🚩 Flagged</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-800 truncate">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {listing.city}{listing.area ? `, ${listing.area}` : ""}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-primary">
                          {listing.currency} {parseFloat(listing.price).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {listing.category} · {listing.listingType}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition font-medium"
                      >
                        👁️ View
                      </Link>
                      <Link
                        href={`/dashboard/edit/${listing.id}`}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={deleteId === listing.id}
                        className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition font-medium disabled:opacity-50"
                      >
                        {deleteId === listing.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-12 bg-gradient-to-r from-primary/5 to-blue-50 rounded-xl p-6 border border-primary/10">
        <h3 className="font-bold text-lg mb-4">💡 Tips for Better Listings</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <span className="text-2xl">📸</span>
            <h4 className="font-medium mt-2">Quality Photos</h4>
            <p className="text-sm text-gray-500 mt-1">
              Add at least 3 high-quality photos to attract more buyers
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <span className="text-2xl">📝</span>
            <h4 className="font-medium mt-2">Detailed Description</h4>
            <p className="text-sm text-gray-500 mt-1">
              Write clear descriptions highlighting key features
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <span className="text-2xl">💰</span>
            <h4 className="font-medium mt-2">Fair Pricing</h4>
            <p className="text-sm text-gray-500 mt-1">
              Research market rates and price competitively
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
