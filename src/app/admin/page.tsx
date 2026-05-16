"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { StatsCard, StatsGrid } from "@/components/StatsCard";
import { LoadingPage } from "@/components/Loading";

interface ListingItem {
  listing: {
    id: string;
    title: string;
    category: string;
    listingType: string;
    price: string;
    currency: string;
    city: string;
    area: string | null;
    status: string;
    isFlagged: boolean | null;
    flagReason: string | null;
    createdAt: string;
  };
  userName: string | null;
  userEmail: string | null;
}

interface UserItem {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  subscription: {
    id: string;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
  } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "listings" | "users">("overview");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadStats();
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      if (tab === "listings") {
        fetchListings();
      } else if (tab === "users") {
        fetchUsers();
      }
    }
  }, [tab, statusFilter, loading, user]);

  const loadStats = async () => {
    try {
      const [listingsRes, usersRes] = await Promise.all([
        fetch("/api/admin/listings"),
        fetch("/api/admin/users"),
      ]);
      const listingsData = await listingsRes.json();
      const usersData = await usersRes.json();

      const allListings = listingsData.listings || [];
      const allUsers = usersData.users || [];

      setStats({
        totalListings: allListings.length,
        pendingListings: allListings.filter((l: ListingItem) => l.listing.status === "pending").length,
        approvedListings: allListings.filter((l: ListingItem) => l.listing.status === "approved").length,
        totalUsers: allUsers.filter((u: UserItem) => u.user.role !== "admin").length,
        activeSubscriptions: allUsers.filter(
          (u: UserItem) =>
            u.subscription?.isActive &&
            u.subscription.endDate &&
            new Date(u.subscription.endDate) > new Date()
        ).length,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const fetchListings = async () => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/listings${params}`);
    const data = await res.json();
    setListings(data.listings || []);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  };

  const updateListingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Listing ${status}`, "success");
        fetchListings();
        loadStats();
      }
    } catch {
      showToast("Failed to update listing", "error");
    }
  };

  const flagListing = async (id: string) => {
    const reason = prompt("Enter flag reason:");
    if (!reason) return;
    try {
      await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFlagged: true, flagReason: reason }),
      });
      showToast("Listing flagged", "warning");
      fetchListings();
    } catch {
      showToast("Failed to flag listing", "error");
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this listing permanently?")) return;
    try {
      await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
      showToast("Listing deleted", "success");
      fetchListings();
      loadStats();
    } catch {
      showToast("Failed to delete listing", "error");
    }
  };

  const toggleUserActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      showToast(`User ${isActive ? "deactivated" : "activated"}`, "success");
      fetchUsers();
    } catch {
      showToast("Failed to update user", "error");
    }
  };

  const manageSubscription = async (subId: string, activate: boolean) => {
    if (activate) {
      const days = prompt("Subscription duration (days):", "30");
      if (!days) return;
      const endDate = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
      await fetch(`/api/admin/subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true, endDate }),
      });
      showToast(`Subscription activated for ${days} days`, "success");
    } else {
      await fetch(`/api/admin/subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      showToast("Subscription deactivated", "warning");
    }
    fetchUsers();
    loadStats();
  };

  if (authLoading || loading) {
    return <LoadingPage />;
  }

  if (!user || user.role !== "admin") return null;

  const filteredListings = listings.filter(
    (l) =>
      l.listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage listings, users, and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
        {[
          { key: "overview", label: "📊 Overview", icon: "📊" },
          { key: "listings", label: "📋 Listings", icon: "📋" },
          { key: "users", label: "👥 Users", icon: "👥" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-5 py-2 rounded-md font-medium text-sm transition ${
              tab === t.key
                ? "bg-white shadow text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          <StatsGrid>
            <StatsCard
              icon="📋"
              label="Total Listings"
              value={stats.totalListings}
              color="blue"
            />
            <StatsCard
              icon="⏳"
              label="Pending Review"
              value={stats.pendingListings}
              color="amber"
            />
            <StatsCard
              icon="✅"
              label="Approved"
              value={stats.approvedListings}
              color="green"
            />
            <StatsCard
              icon="👥"
              label="Total Agents"
              value={stats.totalUsers}
              color="purple"
            />
          </StatsGrid>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => { setTab("listings"); setStatusFilter("pending"); }}
                  className="w-full flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition"
                >
                  <span>Review Pending Listings</span>
                  <span className="bg-amber-200 px-2 py-1 rounded-full text-sm font-bold">
                    {stats.pendingListings}
                  </span>
                </button>
                <button
                  onClick={() => setTab("users")}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                  <span>Manage Users</span>
                  <span className="bg-blue-200 px-2 py-1 rounded-full text-sm font-bold">
                    {stats.totalUsers}
                  </span>
                </button>
              </div>
            </div>

            {/* Subscription Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4">Subscriptions</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                  <p className="text-sm text-gray-500">Active Subscriptions</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-400">
                    {stats.totalUsers - stats.activeSubscriptions}
                  </p>
                  <p className="text-sm text-gray-500">Inactive</p>
                </div>
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.activeSubscriptions / stats.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {tab === "listings" && (
        <div className="animate-fade-in">
          <div className="flex gap-2 mb-6 flex-wrap">
            {["pending", "approved", "rejected", ""].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === s
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
                {s === "pending" && stats.pendingListings > 0 && (
                  <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                    {stats.pendingListings}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500">No listings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-sm text-gray-500">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium">Property</th>
                      <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Agent</th>
                      <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Location</th>
                      <th className="text-left px-6 py-3 font-medium">Status</th>
                      <th className="text-right px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredListings.map(({ listing, userName, userEmail }) => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800 line-clamp-1 max-w-xs">
                            {listing.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {listing.currency} {parseFloat(listing.price).toLocaleString()} · {listing.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-800">{userName}</div>
                          <div className="text-xs text-gray-400">{userEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                          {listing.city}{listing.area ? `, ${listing.area}` : ""}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[listing.status] || "bg-gray-100"}`}>
                              {listing.status}
                            </span>
                            {listing.isFlagged && (
                              <span className="text-red-500 text-xs" title={listing.flagReason || "Flagged"}>🚩</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/listings/${listing.id}`}
                              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition"
                              title="View"
                            >
                              👁️
                            </Link>
                            {listing.status !== "approved" && (
                              <button
                                onClick={() => updateListingStatus(listing.id, "approved")}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Approve"
                              >
                                ✓
                              </button>
                            )}
                            {listing.status !== "rejected" && (
                              <button
                                onClick={() => updateListingStatus(listing.id, "rejected")}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Reject"
                              >
                                ✗
                              </button>
                            )}
                            <button
                              onClick={() => flagListing(listing.id)}
                              className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                              title="Flag"
                            >
                              🚩
                            </button>
                            <button
                              onClick={() => deleteListing(listing.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-sm text-gray-500">
                    <tr>
                      <th className="text-left px-6 py-3 font-medium">User</th>
                      <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Role</th>
                      <th className="text-left px-6 py-3 font-medium">Account</th>
                      <th className="text-left px-6 py-3 font-medium">Subscription</th>
                      <th className="text-right px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(({ user: u, subscription }) => {
                      const isSubActive =
                        subscription?.isActive &&
                        subscription.endDate &&
                        new Date(subscription.endDate) > new Date();

                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{u.name}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              u.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {subscription ? (
                              <div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  isSubActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  {isSubActive ? "✓ Subscribed" : "Expired"}
                                </span>
                                {subscription.endDate && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {isSubActive ? "Expires" : "Expired"}: {new Date(subscription.endDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No subscription</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {u.role !== "admin" && (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => toggleUserActive(u.id, u.isActive)}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                    u.isActive
                                      ? "text-red-600 hover:bg-red-50"
                                      : "text-green-600 hover:bg-green-50"
                                  }`}
                                >
                                  {u.isActive ? "Deactivate" : "Activate"}
                                </button>
                                {subscription && (
                                  <button
                                    onClick={() => manageSubscription(subscription.id, !isSubActive)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                      isSubActive
                                        ? "text-amber-600 hover:bg-amber-50"
                                        : "text-green-600 hover:bg-green-50"
                                    }`}
                                  >
                                    {isSubActive ? "End Sub" : "Activate Sub"}
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
