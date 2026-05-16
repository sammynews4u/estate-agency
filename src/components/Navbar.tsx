"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { getVisitorId } from "@/lib/visitor";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    // Get saved count
    const visitorId = getVisitorId();
    if (visitorId) {
      fetch(`/api/saved?visitorId=${visitorId}`)
        .then((r) => r.json())
        .then((data) => setSavedCount(data.listings?.length || 0))
        .catch(() => {});
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold text-primary">PropFind</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/listings"
              className="text-gray-600 hover:text-primary transition font-medium"
            >
              Browse
            </Link>
            <Link
              href="/agents"
              className="text-gray-600 hover:text-primary transition"
            >
              Agents
            </Link>
            <div className="relative group">
              <button className="text-gray-600 hover:text-primary transition flex items-center gap-1">
                Categories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link href="/listings?category=residential" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary">
                  🏠 Residential
                </Link>
                <Link href="/listings?category=commercial" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary">
                  🏢 Commercial
                </Link>
                <Link href="/listings?category=land" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary">
                  🌍 Land
                </Link>
                <Link href="/listings?category=short_stay" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary">
                  🏨 Short Stay
                </Link>
              </div>
            </div>
            <Link
              href="/saved"
              className="text-gray-600 hover:text-primary transition flex items-center gap-1"
            >
              <span>❤️</span>
              {savedCount > 0 && (
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                {(user.role === "agent" || user.role === "admin") && (
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-primary transition font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-primary transition font-medium"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600 max-w-24 truncate">
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-dark transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition font-medium text-sm"
                >
                  List Property
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/saved" className="relative">
              <span className="text-xl">❤️</span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>
            <button
              className="p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-up">
            <Link href="/listings" className="block py-2 text-gray-600 hover:text-primary">
              🔍 Browse All
            </Link>
            <Link href="/agents" className="block py-2 text-gray-600 hover:text-primary">
              👥 Agents
            </Link>
            <div className="border-t border-gray-100 my-2" />
            <Link href="/listings?category=residential" className="block py-2 text-gray-600 hover:text-primary">
              🏠 Residential
            </Link>
            <Link href="/listings?category=commercial" className="block py-2 text-gray-600 hover:text-primary">
              🏢 Commercial
            </Link>
            <Link href="/listings?category=land" className="block py-2 text-gray-600 hover:text-primary">
              🌍 Land
            </Link>
            <Link href="/listings?category=short_stay" className="block py-2 text-gray-600 hover:text-primary">
              🏨 Short Stay
            </Link>
            <div className="border-t border-gray-100 my-2" />
            {user ? (
              <>
                {(user.role === "agent" || user.role === "admin") && (
                  <Link href="/dashboard" className="block py-2 text-gray-600 hover:text-primary font-medium">
                    📊 Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className="block py-2 text-gray-600 hover:text-primary font-medium">
                    ⚙️ Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-600"
                >
                  🚪 Logout ({user.name})
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-primary font-medium">
                  🔑 Login
                </Link>
                <Link
                  href="/register"
                  className="block text-center bg-primary text-white px-4 py-2 rounded-lg mt-2"
                >
                  📝 List Your Property
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
