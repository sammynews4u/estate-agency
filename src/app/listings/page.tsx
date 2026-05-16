import { Suspense } from "react";
import { ListingsContent } from "@/components/ListingsContent";

export const dynamic = "force-dynamic";

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin text-4xl mb-4">🏠</div>
          <p className="text-gray-500">Loading listings...</p>
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
