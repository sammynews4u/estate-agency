"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import { LoadingSpinner } from "./Loading";
import { CITIES, PROPERTY_CATEGORIES, LISTING_TYPES } from "@/lib/types";

interface ListingData {
  id?: string;
  title: string;
  description: string;
  category: string;
  listingType: string;
  price: string;
  currency: string;
  city: string;
  area: string;
  address: string;
  latitude: string;
  longitude: string;
  bedrooms: string;
  bathrooms: string;
  isFurnished: boolean;
  hasParking: boolean;
  hasWater: boolean;
  hasElectricity: boolean;
  hasSecurity: boolean;
  hasWifi: boolean;
  images: string[];
  videoUrl: string;
  agentName: string;
  agentPhone: string;
  agentWhatsapp: string;
}

const defaultData: ListingData = {
  title: "",
  description: "",
  category: "residential",
  listingType: "rent",
  price: "",
  currency: "XAF",
  city: "",
  area: "",
  address: "",
  latitude: "",
  longitude: "",
  bedrooms: "",
  bathrooms: "",
  isFurnished: false,
  hasParking: false,
  hasWater: false,
  hasElectricity: false,
  hasSecurity: false,
  hasWifi: false,
  images: [],
  videoUrl: "",
  agentName: "",
  agentPhone: "",
  agentWhatsapp: "",
};

export function ListingForm({
  initialData,
  isEdit = false,
}: {
  initialData?: Partial<ListingData>;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<ListingData>({
    ...defaultData,
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = Object.values(PROPERTY_CATEGORIES);
  const listingTypes = Object.values(LISTING_TYPES);

  const updateField = (field: string, value: string | boolean | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.urls) {
        updateField("images", [...data.images, ...result.urls]);
        showToast(`${result.urls.length} image(s) uploaded`, "success");
      }
    } catch {
      showToast("Failed to upload images", "error");
    }
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    updateField("images", newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.title || !data.price || !data.city || !data.agentName || !data.agentPhone) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/listings/${data.id}` : "/api/listings";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        showToast(result.error || "Failed to save listing", "error");
        setLoading(false);
        return;
      }

      showToast(
        isEdit
          ? "Listing updated! It may need re-approval."
          : "Listing submitted for review!",
        "success"
      );
      router.push("/dashboard");
    } catch {
      showToast("Something went wrong", "error");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          📝 Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., Modern 3-Bedroom Apartment in Bonapriso"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Describe the property features, location benefits, etc..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={data.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listing Type <span className="text-red-500">*</span>
            </label>
            <select
              value={data.listingType}
              onChange={(e) => updateField("listingType", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {listingTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={data.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., 350000"
              />
              <select
                value={data.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                className="w-24 px-2 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="XAF">XAF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          📍 Location
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <select
              value={data.city}
              onChange={(e) => updateField("city", e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area / Neighborhood
            </label>
            <input
              type="text"
              value={data.area}
              onChange={(e) => updateField("area", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., Bonapriso, Bastos, Makepe"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Optional - Street name and number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GPS Latitude
            </label>
            <input
              type="text"
              value={data.latitude}
              onChange={(e) => updateField("latitude", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., 4.0511"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GPS Longitude
            </label>
            <input
              type="text"
              value={data.longitude}
              onChange={(e) => updateField("longitude", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., 9.7679"
            />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          🏠 Property Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              type="number"
              value={data.bedrooms}
              onChange={(e) => updateField("bedrooms", e.target.value)}
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <input
              type="number"
              value={data.bathrooms}
              onChange={(e) => updateField("bathrooms", e.target.value)}
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer h-[42px]">
              <input
                type="checkbox"
                checked={data.isFurnished}
                onChange={(e) => updateField("isFurnished", e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Furnished
              </span>
            </label>
          </div>
        </div>

        <h3 className="font-medium text-gray-700 mt-6 mb-3">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: "hasParking", label: "🅿️ Parking" },
            { key: "hasWater", label: "💧 Water" },
            { key: "hasElectricity", label: "⚡ Electricity" },
            { key: "hasSecurity", label: "🔒 Security" },
            { key: "hasWifi", label: "📶 WiFi" },
          ].map((amenity) => (
            <label
              key={amenity.key}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                data[amenity.key as keyof ListingData]
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={data[amenity.key as keyof ListingData] as boolean}
                onChange={(e) => updateField(amenity.key, e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Media */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          📸 Media
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Images
          </label>
          <div className="flex flex-wrap gap-3">
            {data.images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-gray-200 group"
              >
                <img
                  src={img}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <span className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg">
                    ×
                  </span>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition"
            >
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span className="text-2xl">+</span>
                  <span className="text-xs mt-1">Add Image</span>
                </>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-2">
            Tip: High-quality photos get more views. Add at least 3 images.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video URL (YouTube, etc.)
          </label>
          <input
            type="url"
            value={data.videoUrl}
            onChange={(e) => updateField("videoUrl", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          📞 Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.agentName}
              onChange={(e) => updateField("agentName", e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={data.agentPhone}
              onChange={(e) => updateField("agentPhone", e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="+237 6XX XXX XXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={data.agentWhatsapp}
              onChange={(e) => updateField("agentWhatsapp", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="+237 6XX XXX XXX"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : isEdit ? (
            "Update Listing"
          ) : (
            "Submit for Review"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto text-gray-600 px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>

      {!isEdit && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700 flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>
              Your listing will be reviewed by our admin team before going live.
              This usually takes less than 24 hours.
            </span>
          </p>
        </div>
      )}
    </form>
  );
}
