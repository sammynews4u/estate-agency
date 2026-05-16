// Property Categories
export const PROPERTY_CATEGORIES = {
  residential: {
    key: "residential",
    label: "Residential",
    icon: "🏠",
    description: "Apartments, houses, studios",
    color: "from-blue-500 to-blue-700",
  },
  commercial: {
    key: "commercial",
    label: "Commercial",
    icon: "🏢",
    description: "Shops, offices, warehouses",
    color: "from-emerald-500 to-emerald-700",
  },
  land: {
    key: "land",
    label: "Land",
    icon: "🌍",
    description: "Plots and undeveloped land",
    color: "from-amber-500 to-amber-700",
  },
  short_stay: {
    key: "short_stay",
    label: "Short Stay",
    icon: "🏨",
    description: "Hotels, guest houses",
    color: "from-purple-500 to-purple-700",
  },
} as const;

export type PropertyCategory = keyof typeof PROPERTY_CATEGORIES;

// Listing Types
export const LISTING_TYPES = {
  rent: {
    key: "rent",
    label: "For Rent",
    bgColor: "bg-blue-600",
  },
  lease: {
    key: "lease",
    label: "For Lease",
    bgColor: "bg-purple-600",
  },
  short_stay: {
    key: "short_stay",
    label: "Short Stay",
    bgColor: "bg-amber-600",
  },
  sale: {
    key: "sale",
    label: "For Sale",
    bgColor: "bg-green-600",
  },
} as const;

export type ListingType = keyof typeof LISTING_TYPES;

// Cities
export const CITIES = [
  "Douala",
  "Yaoundé",
  "Kribi",
  "Limbe",
  "Bamenda",
  "Buea",
  "Bafoussam",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
] as const;

export type City = (typeof CITIES)[number];

// Listing interface
export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: PropertyCategory;
  listingType: ListingType;
  price: string;
  currency: string;
  city: string;
  area: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  isFurnished: boolean | null;
  hasParking: boolean | null;
  hasWater: boolean | null;
  hasElectricity: boolean | null;
  hasSecurity: boolean | null;
  hasWifi: boolean | null;
  images: string[];
  videoUrl: string | null;
  agentName: string;
  agentPhone: string;
  agentWhatsapp: string | null;
  status: "pending" | "approved" | "rejected";
  isFlagged: boolean | null;
  flagReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "admin" | "agent" | "visitor";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription interface
export interface Subscription {
  id: string;
  userId: string;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Agent display for homepage
export interface AgentDisplay {
  id: string;
  name: string;
  phone: string | null;
  listingsCount: number;
}

// Subscription Plan
export interface SubscriptionPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: "Monthly",
    price: "15,000 XAF",
    period: "per month",
    features: [
      "Unlimited property listings",
      "Edit & delete anytime",
      "Contact details on listings",
      "Dashboard access",
      "Priority support",
    ],
  },
  {
    name: "Quarterly",
    price: "40,000 XAF",
    period: "per 3 months",
    popular: true,
    features: [
      "Unlimited property listings",
      "Edit & delete anytime",
      "Contact details on listings",
      "Dashboard access",
      "Priority support",
      "Save 11% vs monthly",
    ],
  },
  {
    name: "Yearly",
    price: "150,000 XAF",
    period: "per year",
    features: [
      "Unlimited property listings",
      "Edit & delete anytime",
      "Contact details on listings",
      "Dashboard access",
      "Priority support",
      "Save 17% vs monthly",
      "Featured agent badge",
    ],
  },
];

// Platform Benefits
export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export const PLATFORM_BENEFITS: Benefit[] = [
  {
    icon: "💰",
    title: "Zero Commission",
    description: "Keep 100% of your earnings. We never take a cut from your deals.",
  },
  {
    icon: "♾️",
    title: "Unlimited Listings",
    description: "Post as many properties as you want with a single subscription.",
  },
  {
    icon: "📱",
    title: "Direct Contact",
    description: "Buyers contact you directly via phone or WhatsApp. No middleman.",
  },
  {
    icon: "⚡",
    title: "Fast Approval",
    description: "Listings are reviewed and approved quickly by our admin team.",
  },
  {
    icon: "🔒",
    title: "Verified Agents",
    description: "All agents are verified to ensure quality listings for buyers.",
  },
  {
    icon: "📊",
    title: "Dashboard Analytics",
    description: "Track your listings performance with our agent dashboard.",
  },
  {
    icon: "🌍",
    title: "Wide Reach",
    description: "Reach thousands of potential buyers and tenants across Cameroon.",
  },
  {
    icon: "🛡️",
    title: "Quality Control",
    description: "Admin approval ensures only legitimate listings go live.",
  },
];

// FAQ Items
export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How do I list my property on PropFind?",
    answer: "Simply create an account, activate your subscription, and start posting unlimited listings from your dashboard. Each listing goes through a quick approval process before going live.",
  },
  {
    question: "What does the subscription include?",
    answer: "Your subscription gives you unlimited property listings, a personal dashboard to manage your properties, and your contact details shown on all your listings so buyers can reach you directly.",
  },
  {
    question: "How do buyers contact me?",
    answer: "Buyers can contact you directly through the phone number or WhatsApp link shown on your listings. There's no messaging system - all communication is direct between you and the buyer.",
  },
  {
    question: "Do you take commission on sales or rentals?",
    answer: "Absolutely not! PropFind never takes any commission or percentage from your deals. You keep 100% of whatever you earn from your transactions.",
  },
  {
    question: "How long does listing approval take?",
    answer: "Most listings are approved within 24 hours. Our admin team reviews each listing to ensure quality and prevent spam or fraudulent posts.",
  },
  {
    question: "Can I edit or delete my listings?",
    answer: "Yes! You have full control over your listings. You can edit, update, or delete them anytime from your dashboard. Edited listings may need re-approval.",
  },
  {
    question: "What happens when my subscription expires?",
    answer: "When your subscription expires, your listings become hidden from public view but are not deleted. Once you renew, they automatically become visible again.",
  },
  {
    question: "Is PropFind responsible for transactions?",
    answer: "No, PropFind is a listing platform only. We connect agents with buyers but do not handle payments, bookings, or any transaction logistics. Always exercise due diligence.",
  },
];

// Fun Facts
export interface FunFact {
  number: string;
  label: string;
  icon: string;
}

export const FUN_FACTS: FunFact[] = [
  {
    number: "10K+",
    label: "Properties Listed",
    icon: "🏠",
  },
  {
    number: "500+",
    label: "Verified Agents",
    icon: "👥",
  },
  {
    number: "50K+",
    label: "Monthly Visitors",
    icon: "👀",
  },
  {
    number: "8",
    label: "Major Cities",
    icon: "🌍",
  },
];

// Price formatter
export function formatPrice(price: string | number, currency: string = "XAF"): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (num >= 1000000) {
    return `${currency} ${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${currency} ${(num / 1000).toFixed(0)}K`;
  }
  return `${currency} ${num.toLocaleString()}`;
}

export function formatPriceFull(price: string | number, currency: string = "XAF"): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `${currency} ${num.toLocaleString()}`;
}
