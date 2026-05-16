"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ListingForm } from "@/components/ListingForm";
import { LoadingPage } from "@/components/Loading";

export default function NewListingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!user.hasActiveSubscription && user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || (!user.hasActiveSubscription && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Create New Listing</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details below to create a new property listing
        </p>
      </div>
      <ListingForm
        initialData={{
          agentName: user.name,
          agentPhone: user.phone || "",
          agentWhatsapp: user.phone || "",
        }}
      />
    </div>
  );
}
