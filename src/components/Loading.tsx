"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizes[size]} animate-spin`}>
      <svg
        className="w-full h-full text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-bounce mb-4">🏠</div>
        <LoadingSpinner size="lg" />
        <p className="text-gray-500 mt-4">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-6 skeleton rounded w-1/2" />
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded w-1/3" />
      </div>
    </div>
  );
}

export function LoadingCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
