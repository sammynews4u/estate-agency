"use client";
import { useState } from "react";
import { useToast } from "./Toast";
import { LoadingSpinner } from "./Loading";

export function InquiryForm({
  listingId,
  listingTitle,
  onClose,
}: {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `Hi, I'm interested in this property: ${listingTitle}`
  );
  const [preferredContact, setPreferredContact] = useState("whatsapp");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      showToast("Phone number is required", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          visitorName: name || null,
          visitorPhone: phone,
          visitorEmail: email || null,
          message,
          preferredContact,
        }),
      });

      if (res.ok) {
        showToast("Inquiry sent! The agent will contact you soon.", "success");
        onClose();
      } else {
        showToast("Failed to send inquiry", "error");
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
          <h3 className="text-xl font-bold">Send Inquiry</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Leave your contact details and the agent will reach out to you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="+237 6XX XXX XXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred contact method
            </label>
            <div className="flex gap-3">
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${
                  preferredContact === "whatsapp"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="contact"
                  value="whatsapp"
                  checked={preferredContact === "whatsapp"}
                  onChange={(e) => setPreferredContact(e.target.value)}
                  className="sr-only"
                />
                💬 WhatsApp
              </label>
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${
                  preferredContact === "phone"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="contact"
                  value="phone"
                  checked={preferredContact === "phone"}
                  onChange={(e) => setPreferredContact(e.target.value)}
                  className="sr-only"
                />
                📞 Phone Call
              </label>
            </div>
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
              disabled={loading || !phone}
              className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              Send Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
