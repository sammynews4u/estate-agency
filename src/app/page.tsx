import Link from "next/link";
import { db } from "@/db";
import { listings, subscriptions, users } from "@/db/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchHero } from "@/components/SearchHero";
import { SeedButton } from "@/components/SeedButton";
import {
  PROPERTY_CATEGORIES,
  SUBSCRIPTION_PLANS,
  PLATFORM_BENEFITS,
  FAQ_ITEMS,
  FUN_FACTS,
} from "@/lib/types";

export const dynamic = "force-dynamic";

async function getFeaturedListings() {
  try {
    const activeSubUsers = db
      .select({ userId: subscriptions.userId })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.isActive, true),
          gte(subscriptions.endDate, sql`NOW()`)
        )
      );

    const results = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.status, "approved"),
          sql`${listings.userId} IN (${activeSubUsers})`
        )
      )
      .orderBy(desc(listings.createdAt))
      .limit(6);

    return results.map((l) => ({
      ...l,
      images: (l.images || []) as string[],
    }));
  } catch {
    return [];
  }
}

async function getTopAgents() {
  try {
    const results = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        listingsCount: count(listings.id),
      })
      .from(users)
      .innerJoin(subscriptions, eq(users.id, subscriptions.userId))
      .leftJoin(
        listings,
        and(
          eq(listings.userId, users.id),
          eq(listings.status, "approved")
        )
      )
      .where(
        and(
          eq(users.role, "agent"),
          eq(users.isActive, true),
          eq(subscriptions.isActive, true),
          gte(subscriptions.endDate, sql`NOW()`)
        )
      )
      .groupBy(users.id, users.name, users.phone)
      .orderBy(desc(count(listings.id)))
      .limit(6);

    return results;
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [listingsCount] = await db
      .select({ count: count() })
      .from(listings)
      .where(eq(listings.status, "approved"));

    const [agentsCount] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.role, "agent"), eq(users.isActive, true)));

    return {
      listings: listingsCount?.count || 0,
      agents: agentsCount?.count || 0,
    };
  } catch {
    return { listings: 0, agents: 0 };
  }
}

export default async function HomePage() {
  const [featuredListings, topAgents, stats] = await Promise.all([
    getFeaturedListings(),
    getTopAgents(),
    getStats(),
  ]);

  const categories = Object.values(PROPERTY_CATEGORIES);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-blue-700 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Find Your Perfect
              <span className="text-amber-400"> Property</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Browse thousands of properties for rent, sale, or short stay.
              Connect directly with agents and landlords across Cameroon.
            </p>
          </div>
          <SearchHero />
        </div>
      </section>

      {/* Fun Facts / Stats */}
      <section className="bg-white py-10 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: stats.listings > 0 ? `${stats.listings}+` : FUN_FACTS[0].number, label: "Properties Listed", icon: "🏠" },
              { number: stats.agents > 0 ? `${stats.agents}+` : FUN_FACTS[1].number, label: "Verified Agents", icon: "👥" },
              { number: FUN_FACTS[2].number, label: FUN_FACTS[2].label, icon: FUN_FACTS[2].icon },
              { number: FUN_FACTS[3].number, label: FUN_FACTS[3].label, icon: FUN_FACTS[3].icon },
            ].map((fact, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl mb-2">{fact.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-primary">{fact.number}</div>
                <div className="text-sm text-gray-500 mt-1">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Browse by Category
        </h2>
        <p className="text-gray-500 text-center mb-10">
          Find exactly what you&apos;re looking for
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/listings?category=${cat.key}`}
              className="group"
            >
              <div
                className={`bg-gradient-to-br ${cat.color} rounded-xl p-6 text-white text-center hover:scale-105 transition-transform duration-300 shadow-lg`}
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-lg">{cat.label}</h3>
                <p className="text-sm text-white/80 mt-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Latest Properties
              </h2>
              <p className="text-gray-500 mt-1">
                Recently added listings from verified agents
              </p>
            </div>
            <Link
              href="/listings"
              className="hidden md:inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium transition"
            >
              View All →
            </Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 text-lg mb-4">
                No listings yet. Get started by seeding demo data.
              </p>
              <SeedButton />
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link
              href="/listings"
              className="text-primary hover:text-primary-dark font-medium"
            >
              View All Listings →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      {topAgents.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">
                Top Agents
              </h2>
              <p className="text-gray-500 mt-1">
                Connect with our most active property agents
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-gray-50 rounded-xl p-5 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {agent.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {agent.listingsCount} listing{agent.listingsCount !== 1 ? "s" : ""}
                  </p>
                  {agent.phone && (
                    <a
                      href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-2"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              Why Choose PropFind?
            </h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              We&apos;re built for agents and landlords who want to reach more buyers without losing money to commissions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLATFORM_BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-500 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-500 mt-2">
              One subscription, unlimited listings. No hidden fees, no commissions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 ${
                  plan.popular
                    ? "bg-primary text-white ring-4 ring-primary/20 scale-105"
                    : "bg-gray-50 text-gray-800"
                }`}
              >
                {plan.popular && (
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-300 mb-2">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-blue-200" : "text-gray-500"}`}>
                    {" "}{plan.period}
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm">
                      <span className={plan.popular ? "text-amber-300" : "text-green-500"}>✓</span>
                      <span className={plan.popular ? "text-blue-100" : "text-gray-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center mt-6 px-6 py-3 rounded-lg font-semibold transition ${
                    plan.popular
                      ? "bg-white text-primary hover:bg-gray-100"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            How It Works
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Simple steps to find or list your property
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Account",
                desc: "Sign up as an agent or landlord in under 2 minutes",
                icon: "👤",
              },
              {
                step: "2",
                title: "Subscribe & List",
                desc: "Activate your subscription and post unlimited listings",
                icon: "📝",
              },
              {
                step: "3",
                title: "Get Contacted",
                desc: "Buyers reach you directly via phone or WhatsApp",
                icon: "📞",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 mt-2">
              Got questions? We&apos;ve got answers.
            </p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-gray-50 rounded-xl overflow-hidden"
              >
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-800 hover:bg-gray-100 transition flex items-center justify-between">
                  {faq.question}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of agents and landlords already using PropFind to reach
            thousands of potential buyers and tenants across Cameroon.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Start Listing Free
            </Link>
            <Link
              href="/listings"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Browse Properties
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            ✓ No credit card required &nbsp; ✓ Cancel anytime &nbsp; ✓ 24/7 Support
          </p>
        </div>
      </section>
    </div>
  );
}
