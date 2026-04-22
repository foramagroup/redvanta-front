const KEY = "opinoor_cart_v1";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToCart(item) {
  const items = getCart();
  items.push(item);
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function removeFromCart(id) {
  const items = getCart().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function clearCart() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cart:updated"));
}

export const PLATFORM_META = {
  google: {
    name: "Google Reviews",
    emoji: "⭐",
    title: "Find Your Business",
    description: "Search to auto-fill your business details and Google review link.",
    placeholder: "Search your business name…",
    inputLabel: "Business name",
  },
  instagram: {
    name: "Instagram",
    emoji: "📸",
    title: "Grow Your Audience",
    description: "Link your Instagram profile to increase followers instantly.",
    placeholder: "@yourhandle",
    inputLabel: "Instagram username",
  },
  facebook: {
    name: "Facebook",
    emoji: "👍",
    title: "Connect Your Page",
    description: "Help customers find and review your Facebook page.",
    placeholder: "https://facebook.com/yourpage",
    inputLabel: "Facebook page URL",
  },
  custom: {
    name: "Custom Link",
    emoji: "🔗",
    title: "Custom Destination",
    description: "Send customers to any URL you choose.",
    placeholder: "https://your-link.com",
    inputLabel: "Destination URL",
  },
};
