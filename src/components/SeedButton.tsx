"use client";
import { useState } from "react";

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage("Demo data created! Refresh the page to see listings.");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setMessage("Failed to seed data");
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
      >
        {loading ? "Creating..." : "Load Demo Data"}
      </button>
      {message && (
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
