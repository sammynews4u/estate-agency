import { db } from "@/db";
import { listings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingDetail } from "@/components/ListingDetail";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, id))
    .limit(1);

  if (!listing) {
    notFound();
  }

  // Get agent info
  const [agent] = await db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      isVerified: users.isVerified,
      company: users.company,
      profileImage: users.profileImage,
    })
    .from(users)
    .where(eq(users.id, listing.userId))
    .limit(1);

  return (
    <ListingDetail
      listing={{
        ...listing,
        images: (listing.images || []) as string[],
      }}
      agent={agent || null}
    />
  );
}
