"use client";
import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  title: string;
  category: string;
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
}

const categoryIcons: Record<string, string> = {
  residential: "🏠",
  commercial: "🏢",
  land: "🌍",
  short_stay: "🏨",
};

export function ImageGallery({
  images,
  title,
  category,
  videoUrl,
  virtualTourUrl,
}: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState<"photos" | "video" | "tour">("photos");

  if (images.length === 0 && !videoUrl && !virtualTourUrl) {
    return (
      <div className="w-full h-64 md:h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl opacity-50">
            {categoryIcons[category] || "🏠"}
          </span>
          <p className="text-gray-500 mt-2">No images available</p>
        </div>
      </div>
    );
  }

  const hasVideo = !!videoUrl;
  const hasTour = !!virtualTourUrl;
  const showTabs = hasVideo || hasTour;

  return (
    <>
      {/* Media Tabs */}
      {showTabs && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "photos"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📷 Photos ({images.length})
          </button>
          {hasVideo && (
            <button
              onClick={() => setActiveTab("video")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "video"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🎬 Video
            </button>
          )}
          {hasTour && (
            <button
              onClick={() => setActiveTab("tour")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "tour"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🔄 Virtual Tour
            </button>
          )}
        </div>
      )}

      {/* Photos */}
      {activeTab === "photos" && images.length > 0 && (
        <div>
          <div
            className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-3 cursor-pointer relative group"
            onClick={() => setShowLightbox(true)}
          >
            <img
              src={images[activeIndex]}
              alt={`${title} - Image ${activeIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-4 py-2 rounded-lg text-sm font-medium transition">
                🔍 Click to enlarge
              </span>
            </div>
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition"
                >
                  ›
                </button>
              </>
            )}
            {/* Counter */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              {activeIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                    idx === activeIndex
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video */}
      {activeTab === "video" && videoUrl && (
        <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden bg-black">
          {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
            <iframe
              width="100%"
              height="100%"
              src={videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={videoUrl} controls className="w-full h-full" />
          )}
        </div>
      )}

      {/* Virtual Tour */}
      {activeTab === "tour" && virtualTourUrl && (
        <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={virtualTourUrl}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
          >
            ×
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            }}
            className="absolute left-4 text-white text-4xl hover:text-gray-300"
          >
            ‹
          </button>
          <img
            src={images[activeIndex]}
            alt={`${title} - Full size`}
            className="max-w-full max-h-full object-contain p-4"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-4 text-white text-4xl hover:text-gray-300"
          >
            ›
          </button>
          <div className="absolute bottom-4 text-white text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
