"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingPage } from "@/components/Loading";

interface Agent {
  id: string;
  name: string;
  phone: string | null;
  bio: string | null;
  profileImage: string | null;
  company: string | null;
  isVerified: boolean | null;
  yearsExperience: number | null;
  specializations: string[] | null;
  listingsCount: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Agents</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Connect with verified real estate professionals across Cameroon
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-500">No agents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 group-hover:text-primary transition truncate">
                      {agent.name}
                    </h3>
                    {agent.isVerified && (
                      <span className="text-blue-500" title="Verified Agent">✓</span>
                    )}
                  </div>
                  {agent.company && (
                    <p className="text-sm text-gray-500 truncate">{agent.company}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      🏠 {agent.listingsCount} listings
                    </span>
                    {agent.yearsExperience && (
                      <span className="flex items-center gap-1">
                        ⭐ {agent.yearsExperience}+ years
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {agent.bio && (
                <p className="text-sm text-gray-600 mt-4 line-clamp-2">{agent.bio}</p>
              )}
              {agent.specializations && agent.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {agent.specializations.slice(0, 3).map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
