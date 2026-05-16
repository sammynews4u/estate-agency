"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { ListingForm } from "@/components/ListingForm";
import { LoadingPage } from "@/components/Loading";

interface ListingData {
  id: string;
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
  userId: string;
}

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchListing();
    }
  }, [user, authLoading, id]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`);
      const data = await res.json();

      if (!data.listing) {
        showToast("Listing not found", "error");
        router.push("/dashboard");
        return;
      }

      const l = data.listing;
      
      // Check ownership
      if (l.userId !== user?.id && user?.role !== "admin") {
        showToast("You don't have permission to edit this listing", "error");
        router.push("/dashboard");
        return;
      }

      setListingData({
        id: l.id,
        title: l.title || "",
        description: l.description || "",
        category: l.category || "residential",
        listingType: l.listingType || "rent",
        price: l.price || "",
        currency: l.currency || "XAF",
        city: l.city || "",
        area: l.area || "",
        address: l.address || "",
        latitude: l.latitude || "",
        longitude: l.longitude || "",
        bedrooms: l.bedrooms?.toString() || "",
        bathrooms: l.bathrooms?.toString() || "",
        isFurnished: l.isFurnished || false,
        hasParking: l.hasParking || false,
        hasWater: l.hasWater || false,
        hasElectricity: l.hasElectricity || false,
        hasSecurity: l.hasSecurity || false,
        hasWifi: l.hasWifi || false,
        images: l.images || [],
        videoUrl: l.videoUrl || "",
        agentName: l.agentName || "",
        agentPhone: l.agentPhone || "",
        agentWhatsapp: l.agentWhatsapp || "",
        userId: l.userId,
      });
    } catch {
      showToast("Failed to load listing", "error");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return <LoadingPage />;
  }

  if (!user || !listingData) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Listing</h1>
        <p className="text-gray-500 mt-1">
          Update your property listing details
        </p>
      </div>
      <ListingForm initialData={listingData} isEdit />
    </div>
  );
}
