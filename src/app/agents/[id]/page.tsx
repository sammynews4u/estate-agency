"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { LoadingPage } from "@/components/Loading";

interface Agent {
  id: string;
  name: string;
  phone: string | null;
  bio: string | null;
  profileImage: string | null;
  company: string | null;
  address: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  isVerified: boolean | null;
  yearsExperience: number | null;
  specializations: string[] | null;
  createdAt: string;
}

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

export default function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState({ totalListings: 0, totalViews: 0, totalContacts: 0 });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setAgent(data.agent);
        setListings(data.listings || []);
        setStats(data.stats || { totalListings: 0, totalViews: 0, totalContacts: 0 });
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingPage />;

  if (notFound || !agent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Agent Not Found</h1>
        <p className="text-gray-500 mb-6">This agent profile is not available</p>
        <Link href="/agents" className="text-primary font-medium">
          ← Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/agents" className="hover:text-primary">Agents</Link>
        <span>/</span>
        <span className="text-gray-700">{agent.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                {agent.profileImage ? (
                  <img
                    src={agent.profileImage}
                    alt={agent.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  agent.name.charAt(0).toUpperCase()
                )}
              </div>
              <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                {agent.name}
                {agent.isVerified && (
                  <span className="text-blue-500 text-lg" title="Verified">✓</span>
                )}
              </h1>
              {agent.company && (
                <p className="text-gray-500 mt-1">{agent.company}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-6 py-4 border-y border-gray-100">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{stats.totalListings}</div>
                <div className="text-xs text-gray-500">Listings</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{stats.totalViews}</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-600">{stats.totalContacts}</div>
                <div className="text-xs text-gray-500">Contacts</div>
              </div>
            </div>

            {/* Contact Buttons */}
            {agent.phone && (
              <div className="mt-6 space-y-3">
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
                >
                  📞 Call Agent
                </a>
                <a
                  href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I found you on PropFind!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  💬 WhatsApp
                </a>
              </div>
            )}

            {/* Details */}
            <div className="mt-6 space-y-3 text-sm">
              {agent.yearsExperience && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span>⭐</span>
                  <span>{agent.yearsExperience}+ years experience</span>
                </div>
              )}
              {agent.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📍</span>
                  <span>{agent.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <span>📅</span>
                <span>Member since {new Date(agent.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
            </div>

            {/* Social Links */}
            {(agent.website || agent.facebook || agent.instagram || agent.linkedin) && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Connect</p>
                <div className="flex items-center gap-3">
                  {agent.website && (
                    <a href={agent.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary text-xl">🌐</a>
                  )}
                  {agent.facebook && (
                    <a href={agent.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 text-xl">📘</a>
                  )}
                  {agent.instagram && (
                    <a href={agent.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 text-xl">📷</a>
                  )}
                  {agent.linkedin && (
                    <a href={agent.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 text-xl">💼</a>
                  )}
                </div>
              </div>
            )}

            {/* Specializations */}
            {agent.specializations && agent.specializations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {agent.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent's Listings */}
        <div className="lg:col-span-2">
          {agent.bio && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-lg mb-3">About</h2>
              <p className="text-gray-600 whitespace-pre-line">{agent.bio}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              Properties by {agent.name.split(" ")[0]}
            </h2>
            <span className="text-gray-500 text-sm">{listings.length} listings</span>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-4">🏠</div>
              <p className="text-gray-500">No listings available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
