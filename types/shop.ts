export type DesignStatus = "draft" | "validated" | "locked";
export type OrderStatus = "draft" | "validated" | "paid" | "production" | "printed" | "shipped" | "delivered";
export type CardModel = "classic" | "premium" | "metal" | "transparent";

export interface CardDesign {
  id: string;
  businessName: string;
  slogan: string;
  cta: string;
  googlePlaceId: string;
  googleReviewLink: string;
  address: string;
  logoUrl: string | null;
  bgColor: string;
  textColor: string;
  qrColor: string;
  theme: string;
  model: CardModel;
  status: DesignStatus;
  errors: string[];
}

export interface CartItem {
  id: string;
  productName: string;
  model: CardModel;
  quantity: number;
  unitPrice: number;
  design: CardDesign | null;
  isBundle?: boolean;
  bundleLabel?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  trackingNumber: string | null;
  createdAt: string;
  shippingMethod: "standard" | "express" | "international";
  shippingAddress: ShippingAddress | null;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface UserAccount {
  email: string;
  companyName: string;
  phone: string;
  address: string;
  isLoggedIn: boolean;
}

export const MODEL_PRICES: Record<CardModel, number> = {
  classic: 29,
  premium: 49,
  metal: 79,
  transparent: 59,
};

export const MODEL_LABELS: Record<CardModel, string> = {
  classic: "Classic",
  premium: "Premium",
  metal: "Metal",
  transparent: "Transparent",
};

export const THEMES = [
  { id: "minimal", label: "Minimal", bg: "#0D0D0D", text: "#FFFFFF", qr: "#E10600" },
  { id: "corporate", label: "Corporate", bg: "#1A1A1A", text: "#FFFFFF", qr: "#FFFFFF" },
  { id: "bold", label: "Bold Red", bg: "#E10600", text: "#FFFFFF", qr: "#0D0D0D" },
  { id: "light", label: "Light", bg: "#FFFFFF", text: "#0D0D0D", qr: "#E10600" },
];
