import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "PropFind - Real Estate Directory Cameroon",
  description:
    "Find your perfect property in Cameroon. Browse apartments, houses, offices, land, and more. Connect directly with verified agents.",
  keywords: [
    "real estate",
    "property",
    "Cameroon",
    "Douala",
    "Yaoundé",
    "apartments",
    "houses",
    "land",
    "rent",
    "buy",
  ],
  authors: [{ name: "PropFind" }],
  openGraph: {
    title: "PropFind - Real Estate Directory Cameroon",
    description: "Find your perfect property in Cameroon",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              🏠 PropFind
            </h3>
            <p className="text-sm text-gray-400">
              Your trusted real estate directory in Cameroon. Find properties, connect
              with verified agents, and discover your next home or investment.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/listings" className="hover:text-white transition">Browse Listings</a></li>
              <li><a href="/register" className="hover:text-white transition">List Your Property</a></li>
              <li><a href="/login" className="hover:text-white transition">Agent Login</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/listings?category=residential" className="hover:text-white transition">Residential</a></li>
              <li><a href="/listings?category=commercial" className="hover:text-white transition">Commercial</a></li>
              <li><a href="/listings?category=land" className="hover:text-white transition">Land</a></li>
              <li><a href="/listings?category=short_stay" className="hover:text-white transition">Short Stay</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Cities</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/listings?city=Douala" className="hover:text-white transition">Douala</a></li>
              <li><a href="/listings?city=Yaoundé" className="hover:text-white transition">Yaoundé</a></li>
              <li><a href="/listings?city=Kribi" className="hover:text-white transition">Kribi</a></li>
              <li><a href="/listings?city=Limbe" className="hover:text-white transition">Limbe</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} PropFind. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Platform is not responsible for transactions between users and agents.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
