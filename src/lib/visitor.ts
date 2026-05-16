// Visitor ID management for tracking and saved items

const VISITOR_ID_KEY = "propfind_visitor_id";
const RECENTLY_VIEWED_KEY = "propfind_recently_viewed";
const MAX_RECENTLY_VIEWED = 10;

// Generate a unique visitor ID
function generateVisitorId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `v_${timestamp}_${randomPart}`;
}

// Get or create visitor ID
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

// Recently viewed listings
export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToRecentlyViewed(listingId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    let viewed = getRecentlyViewed();
    // Remove if already exists
    viewed = viewed.filter((id) => id !== listingId);
    // Add to beginning
    viewed.unshift(listingId);
    // Keep only the most recent
    viewed = viewed.slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewed));
  } catch {
    // Ignore localStorage errors
  }
}

// Comparison list
const COMPARE_KEY = "propfind_compare";
const MAX_COMPARE = 4;

export function getCompareList(): string[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(COMPARE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToCompare(listingId: string): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const list = getCompareList();
    if (list.includes(listingId)) return true;
    if (list.length >= MAX_COMPARE) return false;
    
    list.push(listingId);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function removeFromCompare(listingId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const list = getCompareList().filter((id) => id !== listingId);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  } catch {
    // Ignore
  }
}

export function clearCompare(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COMPARE_KEY);
}
