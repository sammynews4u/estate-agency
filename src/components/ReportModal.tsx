"use client";
import { useState } from "react";
import { useToast } from "./Toast";
import { LoadingSpinner } from "./Loading";

const REPORT_REASONS = [
  { value: "spam", label: "Spam or fake listing" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "wrong_info", label: "Incorrect information" },
  { value: "unavailable", label: "Property no longer available" },
  { value: "scam", label: "Suspected scam" },
  { value: "offensive", label: "Offensive content" },
  { value: "other", label: "Other" },
];

export function ReportModal({
  listingId,
  onClose,
}: {
  listingId: string;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      showToast("Please select a reason", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          description,
          reporterEmail: email || null,
        }),
      });

      if (res.ok) {
        showToast("Report submitted. Thank you!", "success");
        onClose();
      } else {
        showToast("Failed to submit report", "error");
      }
    } catch {
      showToast("Something went wrong", "error");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Report Listing</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting *
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    reason === r.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      reason === r.value
                        ? "border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {reason === r.value && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Please provide more details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="For follow-up if needed"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
