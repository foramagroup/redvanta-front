"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Upload, CheckCircle2, AlertTriangle, QrCode, Palette, Type, Image as ImageIcon, Smartphone, RotateCcw, Check, Star, Layers, Move, Save, Pencil, History, Clock, Eye, Lock, Loader2, } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { fadeUp } from "@/lib/animations";
import { THEMES, MODEL_LABELS, MODEL_PRICES } from "@/types/shop";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDesigns } from "@/contexts/DesignsContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import SharedCardPreview from "@/components/designs/SharedCardPreview";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const resolveAssetUrl = (value) => {
    if (!value)
        return null;
    if (/^(https?:|data:|blob:)/i.test(value))
        return value;
    if (value.startsWith("/"))
        return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
};
const PLATFORM_STEP_CONFIGS = {
    google: {
        title: "Find Your Business",
        description: "Search to auto-fill your business details and Google review link",
        placeholder: "Search business name on Google Maps...",
        searchMode: "google-maps",
        iconLabel: "Google",
        iconEmoji: "G",
        iconColor: "#4285F4",
        defaultInstructions: {
            frontLine1: "Approach your phone to the card",
            frontLine2: "Tap to leave a Google review",
            backLine1: "Scan the QR code with your camera",
            backLine2: "Write a review on our Google Maps page",
        },
    },
    facebook: {
        title: "Connect Your Facebook Page",
        description: "Link your Facebook page so customers can leave reviews directly",
        placeholder: "Enter your Facebook page URL...",
        searchMode: "link-input",
        iconLabel: "Facebook",
        iconEmoji: "f",
        iconColor: "#1877F2",
        defaultInstructions: {
            frontLine1: "Tap your phone on the card",
            frontLine2: "Leave us a Facebook recommendation",
            backLine1: "Scan to visit our Facebook page",
            backLine2: "Share your experience with a review",
        },
    },
    instagram: {
        title: "Connect Your Instagram Profile",
        description: "Add your Instagram profile link to drive engagement and follows",
        placeholder: "Enter your Instagram profile URL...",
        searchMode: "link-input",
        iconLabel: "Instagram",
        iconEmoji: "📷",
        iconColor: "#E4405F",
        defaultInstructions: {
            frontLine1: "Tap your phone on the card",
            frontLine2: "Follow us on Instagram",
            backLine1: "Scan to visit our Instagram profile",
            backLine2: "Tag us in your photos and stories",
        },
    },
    tiktok: {
        title: "Connect Your TikTok Account",
        description: "Link your TikTok profile to boost your social presence and following",
        placeholder: "Enter your TikTok profile URL...",
        searchMode: "link-input",
        iconLabel: "TikTok",
        iconEmoji: "♪",
        iconColor: "#000000",
        defaultInstructions: {
            frontLine1: "Tap your phone on the card",
            frontLine2: "Follow us on TikTok",
            backLine1: "Scan to visit our TikTok profile",
            backLine2: "Watch our latest videos and follow",
        },
    },
    tripadvisor: {
        title: "Link Your TripAdvisor Listing",
        description: "Connect your TripAdvisor business page to collect travel reviews",
        placeholder: "Enter your TripAdvisor review link...",
        searchMode: "link-input",
        iconLabel: "TripAdvisor",
        iconEmoji: "🦉",
        iconColor: "#34E0A1",
        defaultInstructions: {
            frontLine1: "Tap your phone on the card",
            frontLine2: "Share your travel experience",
            backLine1: "Scan to visit our TripAdvisor page",
            backLine2: "Help other travellers by leaving a review",
        },
    },
    booking: {
        title: "Link Your Booking.com Property",
        description: "Connect your Booking.com listing to collect guest reviews",
        placeholder: "Enter your Booking.com review link...",
        searchMode: "link-input",
        iconLabel: "Booking",
        iconEmoji: "B",
        iconColor: "#003580",
        defaultInstructions: {
            frontLine1: "Tap your phone on the card",
            frontLine2: "Rate your stay on Booking.com",
            backLine1: "Scan to visit our Booking.com listing",
            backLine2: "Share your guest experience with a review",
        },
    },
    airbnb: {
        title: "Link Your Airbnb Listing",
        description: "Connect your Airbnb property to collect guest reviews and ratings",
        placeholder: "Enter your Airbnb listing URL...",
        searchMode: "link-input",
        iconLabel: "Airbnb",
        iconEmoji: "🏠",
        iconColor: "#FF5A5F",
        defaultInstructions: {
            frontLine1: "Tap your phone on the card",
            frontLine2: "Review your Airbnb experience",
            backLine1: "Scan to visit our Airbnb listing",
            backLine2: "Help future guests by sharing your stay",
        },
    },
    custom: {
        title: "Connect Your Website",
        description: "Add your custom website or domain link for branded NFC cards",
        placeholder: "Enter your website URL...",
        searchMode: "link-input",
        iconLabel: "Custom",
        iconEmoji: "★",
        iconColor: "#6b7280",
        defaultInstructions: {
            frontLine1: "Tap your phone on the card",
            frontLine2: "Visit our website",
            backLine1: "Scan the QR code with your camera",
            backLine2: "Discover more about our services",
        },
    },
};
// Map product names to platform configurations
const PRODUCT_CONFIGS = {
    "Google Review NFC Card": { platform: "google", defaultTemplateId: "material-light", allowedLayouts: ["landscape", "portrait", "square", "circle"] },
    "Facebook Review NFC Card": { platform: "facebook", defaultTemplateId: "material-blue", allowedLayouts: ["landscape", "portrait"] },
    "Instagram Review NFC Card": { platform: "instagram", defaultTemplateId: "blob-ocean", allowedLayouts: ["landscape", "portrait", "square"] },
    "TikTok Review NFC Card": { platform: "tiktok", defaultTemplateId: "neon-tiktok", allowedLayouts: ["landscape", "portrait"] },
    "TripAdvisor Review NFC Card": { platform: "tripadvisor", defaultTemplateId: "geo-travel", allowedLayouts: ["landscape", "portrait", "square"] },
    "Booking Review NFC Card": { platform: "booking", defaultTemplateId: "geo-navy", allowedLayouts: ["landscape", "portrait"] },
    "Airbnb Review NFC Card": { platform: "airbnb", defaultTemplateId: "material-rose", allowedLayouts: ["landscape", "portrait", "square"] },
    "Custom Branding NFC Card": { platform: "custom", defaultTemplateId: "crimson-noir", allowedLayouts: ["landscape", "portrait", "square", "circle"] },
};
const DEFAULT_PRODUCT_CONFIG = {
    platform: "google",
    defaultTemplateId: "material-light",
    allowedLayouts: ["landscape", "portrait", "square", "circle"],
};
function getProductConfig(productName) {
    if (!productName)
        return DEFAULT_PRODUCT_CONFIG;
    // Try exact match first, then partial match
    if (PRODUCT_CONFIGS[productName])
        return PRODUCT_CONFIGS[productName];
    const key = Object.keys(PRODUCT_CONFIGS).find(k => productName.toLowerCase().includes(k.toLowerCase().split(" ")[0].toLowerCase()));
    return key ? PRODUCT_CONFIGS[key] : DEFAULT_PRODUCT_CONFIG;
}
const TEMPLATE_CATEGORIES = [
    { id: "all", label: "All" },
    { id: "classic", label: "Classic" },
    { id: "premium", label: "Premium" },
    { id: "elegant", label: "Elegant" },
    { id: "tech", label: "Tech" },
];

const CARD_TEMPLATES = [
    { id: "crimson-noir", label: "Crimson Noir", gradient1: "#B91C1C", gradient2: "#0D0D0D", accentBand1: "#FFFFFF", accentBand2: "#1A1A1A", textColor: "#FFFFFF", qrColor: "#FBBF24", pattern: "none", category: "classic" },
    { id: "midnight-gold", label: "Midnight Gold", gradient1: "#1E1B4B", gradient2: "#0F172A", accentBand1: "#FBBF24", accentBand2: "#1A1A1A", textColor: "#FFFFFF", qrColor: "#FBBF24", pattern: "none", category: "classic" },
    { id: "arctic-fire", label: "Arctic Fire", gradient1: "#FFFFFF", gradient2: "#F1F5F9", accentBand1: "#E10600", accentBand2: "#0D0D0D", textColor: "#0D0D0D", qrColor: "#E10600", pattern: "none", category: "classic" },
    { id: "emerald-dark", label: "Emerald Dark", gradient1: "#064E3B", gradient2: "#0D0D0D", accentBand1: "#10B981", accentBand2: "#1A1A1A", textColor: "#FFFFFF", qrColor: "#34D399", pattern: "none", category: "classic" },
    { id: "royal-plum", label: "Royal Plum", gradient1: "#581C87", gradient2: "#1E1B4B", accentBand1: "#C084FC", accentBand2: "#0F172A", textColor: "#FFFFFF", qrColor: "#A78BFA", pattern: "none", category: "classic" },
    { id: "sunset-blaze", label: "Sunset Blaze", gradient1: "#EA580C", gradient2: "#7C2D12", accentBand1: "#FDE68A", accentBand2: "#1C1917", textColor: "#FFFFFF", qrColor: "#FBBF24", pattern: "none", category: "classic" },
    { id: "geo-obsidian", label: "Obsidian Geo", gradient1: "#18181B", gradient2: "#09090B", accentBand1: "#E4E4E7", accentBand2: "#27272A", textColor: "#FAFAFA", qrColor: "#E4E4E7", pattern: "geometric", badge: "Premium", category: "premium" },
    { id: "geo-ruby", label: "Ruby Lattice", gradient1: "#991B1B", gradient2: "#450A0A", accentBand1: "#FCA5A5", accentBand2: "#7F1D1D", textColor: "#FFFFFF", qrColor: "#FCA5A5", pattern: "geometric", badge: "Premium", category: "premium" },
    { id: "glass-frost", label: "Frosted Glass", gradient1: "#6366F1", gradient2: "#312E81", accentBand1: "rgba(255,255,255,0.6)", accentBand2: "rgba(255,255,255,0.1)", textColor: "#FFFFFF", qrColor: "#C7D2FE", pattern: "glassmorphism", badge: "Premium", category: "premium" },
    { id: "glass-rose", label: "Rose Glass", gradient1: "#BE185D", gradient2: "#500724", accentBand1: "rgba(255,255,255,0.5)", accentBand2: "rgba(255,255,255,0.08)", textColor: "#FFFFFF", qrColor: "#FBCFE8", pattern: "glassmorphism", badge: "Premium", category: "premium" },
    { id: "metal-silver", label: "Brushed Silver", gradient1: "#D4D4D8", gradient2: "#71717A", accentBand1: "#FAFAFA", accentBand2: "#52525B", textColor: "#18181B", qrColor: "#27272A", pattern: "metallic", badge: "Premium", category: "premium" },
    { id: "metal-gold", label: "Brushed Gold", gradient1: "#D4A574", gradient2: "#78350F", accentBand1: "#FDE68A", accentBand2: "#451A03", textColor: "#FFFBEB", qrColor: "#FDE68A", pattern: "metallic", badge: "Premium", category: "premium" },
    { id: "pinstripe-navy", label: "Navy Pinstripe", gradient1: "#1E3A5F", gradient2: "#0C1929", accentBand1: "#93C5FD", accentBand2: "#1E3A5F", textColor: "#FFFFFF", qrColor: "#93C5FD", pattern: "diagonal-lines", category: "elegant" },
    { id: "pinstripe-charcoal", label: "Charcoal Lines", gradient1: "#374151", gradient2: "#111827", accentBand1: "#9CA3AF", accentBand2: "#1F2937", textColor: "#F9FAFB", qrColor: "#D1D5DB", pattern: "diagonal-lines", category: "elegant" },
    { id: "dot-luxe", label: "Luxe Dots", gradient1: "#292524", gradient2: "#0C0A09", accentBand1: "#D4A574", accentBand2: "#292524", textColor: "#FAFAF9", qrColor: "#D4A574", pattern: "dots", badge: "Elegant", category: "elegant" },
    { id: "diamond-sapphire", label: "Sapphire Diamond", gradient1: "#1D4ED8", gradient2: "#1E1B4B", accentBand1: "#60A5FA", accentBand2: "#312E81", textColor: "#FFFFFF", qrColor: "#93C5FD", pattern: "diamonds", badge: "Elegant", category: "elegant" },
    { id: "chevron-titanium", label: "Titanium Chevron", gradient1: "#44403C", gradient2: "#1C1917", accentBand1: "#A8A29E", accentBand2: "#292524", textColor: "#FAFAF9", qrColor: "#D6D3D1", pattern: "chevrons", category: "elegant" },
    { id: "crosshatch-noir", label: "Noir Crosshatch", gradient1: "#1A1A1A", gradient2: "#000000", accentBand1: "#E10600", accentBand2: "#0D0D0D", textColor: "#FFFFFF", qrColor: "#E10600", pattern: "crosshatch", category: "elegant" },
    { id: "hex-cyber", label: "Cyber Hex", gradient1: "#0E7490", gradient2: "#042F2E", accentBand1: "#22D3EE", accentBand2: "#134E4A", textColor: "#ECFEFF", qrColor: "#67E8F9", pattern: "hexagons", badge: "Tech", category: "tech" },
    { id: "circuit-neon", label: "Neon Circuit", gradient1: "#14532D", gradient2: "#052E16", accentBand1: "#4ADE80", accentBand2: "#14532D", textColor: "#F0FDF4", qrColor: "#4ADE80", pattern: "circuit", badge: "Tech", category: "tech" },
    { id: "wave-ocean", label: "Ocean Wave", gradient1: "#0284C7", gradient2: "#0C4A6E", accentBand1: "#38BDF8", accentBand2: "#075985", textColor: "#F0F9FF", qrColor: "#7DD3FC", pattern: "waves", category: "tech" },
    // ── Bold & Colorful (inspired by vibrant business cards) ──
    { id: "citrus-burst", label: "Citrus Burst", gradient1: "#F97316", gradient2: "#FDBA74", accentBand1: "#FFFFFF", accentBand2: "#EA580C", textColor: "#FFFFFF", qrColor: "#0D0D0D", pattern: "triangles", badge: "Bold", category: "premium" },
    { id: "clean-tangerine", label: "Clean Tangerine", gradient1: "#FFFFFF", gradient2: "#FFF7ED", accentBand1: "#F97316", accentBand2: "#FDBA74", textColor: "#1C1917", qrColor: "#EA580C", pattern: "none", category: "classic" },
    { id: "sunflower-pop", label: "Sunflower Pop", gradient1: "#FBBF24", gradient2: "#F59E0B", accentBand1: "#FFFFFF", accentBand2: "#78350F", textColor: "#1C1917", qrColor: "#0D0D0D", pattern: "confetti", badge: "Fun", category: "premium" },
    { id: "electric-coral", label: "Electric Coral", gradient1: "#FB7185", gradient2: "#E11D48", accentBand1: "#FFFFFF", accentBand2: "#9F1239", textColor: "#FFFFFF", qrColor: "#FDE68A", pattern: "zigzag", badge: "Bold", category: "premium" },
    { id: "mint-fresh", label: "Mint Fresh", gradient1: "#FFFFFF", gradient2: "#ECFDF5", accentBand1: "#10B981", accentBand2: "#34D399", textColor: "#064E3B", qrColor: "#059669", pattern: "none", category: "classic" },
    { id: "mosaic-rainbow", label: "Rainbow Mosaic", gradient1: "#7C3AED", gradient2: "#2563EB", accentBand1: "#FBBF24", accentBand2: "#EC4899", textColor: "#FFFFFF", qrColor: "#FDE68A", pattern: "mosaic", badge: "Creative", category: "premium" },
    { id: "corporate-sky", label: "Corporate Sky", gradient1: "#FFFFFF", gradient2: "#EFF6FF", accentBand1: "#2563EB", accentBand2: "#1D4ED8", textColor: "#1E3A5F", qrColor: "#1D4ED8", pattern: "none", category: "classic" },
    { id: "sunburst-gold", label: "Sunburst Gold", gradient1: "#78350F", gradient2: "#451A03", accentBand1: "#FBBF24", accentBand2: "#F59E0B", textColor: "#FEF3C7", qrColor: "#FDE68A", pattern: "sunburst", badge: "Premium", category: "elegant" },
    { id: "tropical-vibes", label: "Tropical Vibes", gradient1: "#06B6D4", gradient2: "#0891B2", accentBand1: "#FBBF24", accentBand2: "#F97316", textColor: "#FFFFFF", qrColor: "#FDE68A", pattern: "waves", badge: "Fun", category: "tech" },
    { id: "blush-minimal", label: "Blush Minimal", gradient1: "#FFFFFF", gradient2: "#FFF1F2", accentBand1: "#FB7185", accentBand2: "#FDA4AF", textColor: "#881337", qrColor: "#E11D48", pattern: "dots", category: "elegant" },
    { id: "neon-matrix", label: "Neon Matrix", gradient1: "#0A0A0A", gradient2: "#000000", accentBand1: "#22C55E", accentBand2: "#15803D", textColor: "#22C55E", qrColor: "#4ADE80", pattern: "circuit", badge: "Tech", category: "tech" },
    { id: "lavender-dream", label: "Lavender Dream", gradient1: "#F5F3FF", gradient2: "#EDE9FE", accentBand1: "#8B5CF6", accentBand2: "#7C3AED", textColor: "#4C1D95", qrColor: "#7C3AED", pattern: "none", category: "elegant" },
    // ── Circular Cut Templates ──
    { id: "onyx-orbit", label: "Onyx Orbit", gradient1: "#0A0A0A", gradient2: "#1A1A1A", accentBand1: "#E10600", accentBand2: "#FF4444", textColor: "#FFFFFF", qrColor: "#E10600", pattern: "circle-tl-br", badge: "New", category: "premium" },
    { id: "ivory-flame", label: "Ivory Flame", gradient1: "#FFFBEB", gradient2: "#FFFFFF", accentBand1: "#DC2626", accentBand2: "#F87171", textColor: "#1C1917", qrColor: "#DC2626", pattern: "circle-tr-bl", badge: "New", category: "elegant" },
    { id: "deep-ocean", label: "Deep Ocean", gradient1: "#0C4A6E", gradient2: "#082F49", accentBand1: "#38BDF8", accentBand2: "#0EA5E9", textColor: "#F0F9FF", qrColor: "#7DD3FC", pattern: "arc-top", badge: "New", category: "premium" },
    { id: "velvet-noir", label: "Velvet Noir", gradient1: "#18181B", gradient2: "#09090B", accentBand1: "#FBBF24", accentBand2: "#D97706", textColor: "#FAFAFA", qrColor: "#FDE68A", pattern: "blob-corners", badge: "New", category: "premium" },
    { id: "aurora-mint", label: "Aurora Mint", gradient1: "#ECFDF5", gradient2: "#D1FAE5", accentBand1: "#059669", accentBand2: "#10B981", textColor: "#064E3B", qrColor: "#059669", pattern: "half-moon-right", badge: "New", category: "elegant" },
    { id: "magma-split", label: "Magma Split", gradient1: "#7C2D12", gradient2: "#431407", accentBand1: "#FB923C", accentBand2: "#F97316", textColor: "#FFF7ED", qrColor: "#FDBA74", pattern: "quarter-circles", badge: "New", category: "premium" },
    { id: "cosmic-purple", label: "Cosmic Purple", gradient1: "#2E1065", gradient2: "#1E1B4B", accentBand1: "#C084FC", accentBand2: "#A855F7", textColor: "#FAF5FF", qrColor: "#D8B4FE", pattern: "bubble-cluster", badge: "New", category: "premium" },
    { id: "zen-wave", label: "Zen Wave", gradient1: "#FFFFFF", gradient2: "#F8FAFC", accentBand1: "#334155", accentBand2: "#64748B", textColor: "#0F172A", qrColor: "#334155", pattern: "swoosh", badge: "New", category: "elegant" },
    { id: "rose-petal", label: "Rose Petal", gradient1: "#FFF1F2", gradient2: "#FFE4E6", accentBand1: "#E11D48", accentBand2: "#FB7185", textColor: "#881337", qrColor: "#E11D48", pattern: "petal", badge: "New", category: "elegant" },
    { id: "midnight-arc", label: "Midnight Arc", gradient1: "#020617", gradient2: "#0F172A", accentBand1: "#38BDF8", accentBand2: "#818CF8", textColor: "#F8FAFC", qrColor: "#67E8F9", pattern: "arc-bottom", badge: "New", category: "tech" },
    // ── Material Clean Style ──
    { id: "material-light", label: "Material Light", gradient1: "#FFFFFF", gradient2: "#F1F5F9", accentBand1: "#4285F4", accentBand2: "#E8F0FE", textColor: "#1a1a1a", qrColor: "#4285F4", pattern: "none", badge: "Material", category: "classic" },
    { id: "material-blue", label: "Material Blue", gradient1: "#F0F4FF", gradient2: "#E8EFFF", accentBand1: "#1877F2", accentBand2: "#D6E4FF", textColor: "#1a1a1a", qrColor: "#1877F2", pattern: "none", badge: "Material", category: "classic" },
    { id: "material-rose", label: "Material Rose", gradient1: "#FFF5F5", gradient2: "#FFF0F0", accentBand1: "#FF5A5F", accentBand2: "#FFE0E0", textColor: "#1a1a1a", qrColor: "#FF5A5F", pattern: "none", badge: "Material", category: "classic" },
    // ── Abstract Organic Blobs Style ──
    { id: "blob-ocean", label: "Ocean Blobs", gradient1: "#1877F2", gradient2: "#0D47A1", accentBand1: "#64B5F6", accentBand2: "#1565C0", textColor: "#FFFFFF", qrColor: "#E3F2FD", pattern: "dots", badge: "Organic", category: "premium" },
    { id: "blob-coral", label: "Coral Blobs", gradient1: "#FF5A5F", gradient2: "#E31C5F", accentBand1: "#FFB8B8", accentBand2: "#C41E3A", textColor: "#FFFFFF", qrColor: "#FFE0E0", pattern: "dots", badge: "Organic", category: "premium" },
    { id: "blob-jungle", label: "Jungle Blobs", gradient1: "#00AA6C", gradient2: "#007A4D", accentBand1: "#B2DFDB", accentBand2: "#004D40", textColor: "#FFFFFF", qrColor: "#B2DFDB", pattern: "dots", badge: "Organic", category: "premium" },
    // ── Memphis Playful Style ──
    { id: "memphis-google", label: "Playful Google", gradient1: "#FBBC05", gradient2: "#34A853", accentBand1: "#4285F4", accentBand2: "#EA4335", textColor: "#1a1a1a", qrColor: "#4285F4", pattern: "confetti", badge: "Playful", category: "premium" },
    { id: "memphis-party", label: "Party Mix", gradient1: "#FCAF45", gradient2: "#E4405F", accentBand1: "#833AB4", accentBand2: "#FFFFFF", textColor: "#FFFFFF", qrColor: "#FDE68A", pattern: "confetti", badge: "Playful", category: "premium" },
    { id: "memphis-pop", label: "Pop Art", gradient1: "#6366F1", gradient2: "#818CF8", accentBand1: "#FDE68A", accentBand2: "#EC4899", textColor: "#FFFFFF", qrColor: "#FDE68A", pattern: "zigzag", badge: "Playful", category: "premium" },
    // ── Geometric Corporate Style ──
    { id: "geo-corporate", label: "Corporate Grid", gradient1: "#FFFFFF", gradient2: "#F8F9FA", accentBand1: "#2563EB", accentBand2: "#E8EFFF", textColor: "#1a1a1a", qrColor: "#2563EB", pattern: "geometric", category: "elegant" },
    { id: "geo-travel", label: "Travel Grid", gradient1: "#F0FFF4", gradient2: "#E6FFED", accentBand1: "#00AA6C", accentBand2: "#D5F5E3", textColor: "#1a1a1a", qrColor: "#00AA6C", pattern: "geometric", category: "elegant" },
    { id: "geo-navy", label: "Navy Grid", gradient1: "#001A40", gradient2: "#003580", accentBand1: "#4FC3F7", accentBand2: "#0057B8", textColor: "#FFFFFF", qrColor: "#4FC3F7", pattern: "geometric", category: "elegant" },
    // ── Polygon Mesh Gradient Style ──
    { id: "poly-prism", label: "Prism Mesh", gradient1: "#833AB4", gradient2: "#E4405F", accentBand1: "#FCAF45", accentBand2: "#C13584", textColor: "#FFFFFF", qrColor: "#FCAF45", pattern: "triangles", badge: "Tech", category: "tech" },
    { id: "poly-tech", label: "Tech Mesh", gradient1: "#000000", gradient2: "#1a1a1a", accentBand1: "#25F4EE", accentBand2: "#FE2C55", textColor: "#FFFFFF", qrColor: "#25F4EE", pattern: "triangles", badge: "Tech", category: "tech" },
    { id: "poly-nature", label: "Nature Mesh", gradient1: "#00AA6C", gradient2: "#006B3F", accentBand1: "#B2DFDB", accentBand2: "#008C57", textColor: "#FFFFFF", qrColor: "#B2DFDB", pattern: "triangles", badge: "Tech", category: "tech" },
    // ── Minimal Luxury Style ──
    { id: "luxury-gold", label: "Gold Luxury", gradient1: "#FFFEF7", gradient2: "#FFF8E1", accentBand1: "#D4AF37", accentBand2: "#B8963B", textColor: "#1a1a1a", qrColor: "#D4AF37", pattern: "none", badge: "Luxury", category: "elegant" },
    { id: "luxury-noir", label: "Noir Prestige", gradient1: "#0a0a0a", gradient2: "#111111", accentBand1: "#D4AF37", accentBand2: "#8B7536", textColor: "#FFFFFF", qrColor: "#D4AF37", pattern: "none", badge: "Luxury", category: "elegant" },
    { id: "luxury-blush", label: "Blush Elegance", gradient1: "#FFF5F5", gradient2: "#FFFAFA", accentBand1: "#B76E79", accentBand2: "#D4A4AC", textColor: "#1a1a1a", qrColor: "#B76E79", pattern: "none", badge: "Luxury", category: "elegant" },
    // ── Neon / Glow Style ──
    { id: "neon-tiktok", label: "TikTok Neon", gradient1: "#000000", gradient2: "#050505", accentBand1: "#25F4EE", accentBand2: "#FE2C55", textColor: "#FFFFFF", qrColor: "#25F4EE", pattern: "circuit", badge: "Neon", category: "tech" },
    { id: "neon-blue", label: "Neon Blue", gradient1: "#0a0a0a", gradient2: "#0D0D1A", accentBand1: "#1877F2", accentBand2: "#4285F4", textColor: "#FFFFFF", qrColor: "#64B5F6", pattern: "circuit", badge: "Neon", category: "tech" },
    { id: "neon-purple", label: "Neon Purple", gradient1: "#000000", gradient2: "#0a0a0a", accentBand1: "#818CF8", accentBand2: "#6366F1", textColor: "#FFFFFF", qrColor: "#C4B5FD", pattern: "circuit", badge: "Neon", category: "tech" },
    // ── Glassmorphism Style ──
    { id: "glass-google", label: "Google Glass", gradient1: "#E8F0FE", gradient2: "#D2E3FC", accentBand1: "#4285F4", accentBand2: "rgba(255,255,255,0.5)", textColor: "#1a1a1a", qrColor: "#4285F4", pattern: "glassmorphism", badge: "Glass", category: "premium" },
    { id: "glass-travel", label: "Travel Glass", gradient1: "#D5F5E3", gradient2: "#C8F7DC", accentBand1: "#00AA6C", accentBand2: "rgba(255,255,255,0.5)", textColor: "#1a1a1a", qrColor: "#00AA6C", pattern: "glassmorphism", badge: "Glass", category: "premium" },
    { id: "glass-dark", label: "Dark Frost", gradient1: "#1a1a2e", gradient2: "#16213e", accentBand1: "#25F4EE", accentBand2: "rgba(255,255,255,0.08)", textColor: "#FFFFFF", qrColor: "#25F4EE", pattern: "glassmorphism", badge: "Glass", category: "premium" },
    // ── Layered Depth Style ──
    { id: "layer-google", label: "Google Layers", gradient1: "#4285F4", gradient2: "#3367D6", accentBand1: "#FBBC05", accentBand2: "#34A853", textColor: "#FFFFFF", qrColor: "#FBBC05", pattern: "chevrons", badge: "Depth", category: "premium" },
    { id: "layer-booking", label: "Booking Depth", gradient1: "#003580", gradient2: "#002A66", accentBand1: "#4FC3F7", accentBand2: "#0277BD", textColor: "#FFFFFF", qrColor: "#4FC3F7", pattern: "chevrons", badge: "Depth", category: "premium" },
    { id: "layer-airbnb", label: "Host Layers", gradient1: "#FF5A5F", gradient2: "#E31C5F", accentBand1: "#FFB8B8", accentBand2: "#FFFFFF", textColor: "#FFFFFF", qrColor: "#FFB8B8", pattern: "chevrons", badge: "Depth", category: "premium" },
];
// ── Constants & Helpers ─────────────────────────────────────
const MODELS = ["classic", "premium", "metal", "transparent"];
const defaultDesign = (model) => ({
    id: crypto.randomUUID(),
    businessName: "",
    slogan: "",
    cta: "Powered by RedVanta",
    googlePlaceId: "",
    googleReviewLink: "",
    address: "",
    logoUrl: null,
    bgColor: "#0D0D0D",
    textColor: "#FFFFFF",
    qrColor: "#E10600",
    theme: "minimal",
    model,
    status: "draft",
    errors: [],
});
const FONT_WEIGHT_OPTIONS = [
    { id: "300", label: "Light" },
    { id: "400", label: "Regular" },
    { id: "700", label: "Bold" },
    { id: "800", label: "Extra Bold" },
];
const TEXT_SHADOW_OPTIONS = [
    { id: "none", label: "None", value: "none" },
    { id: "subtle", label: "Subtle", value: "0 1px 2px rgba(0,0,0,0.3)" },
    { id: "medium", label: "Medium", value: "0 2px 4px rgba(0,0,0,0.5)" },
    { id: "strong", label: "Strong", value: "0 2px 8px rgba(0,0,0,0.7)" },
    { id: "outline", label: "Outline", value: "-1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6), 1px 1px 0 rgba(0,0,0,0.6)" },
];
const NFC_SIZE_PRESETS = [16, 20, 24, 28, 32, 36];
const GOOGLE_ICON_SIZE_PRESETS = [16, 20, 24, 28, 32, 36];
const BAND_HEIGHT_PRESETS = [8, 12, 16, 20, 22, 28, 35];
const CTA_PADDING_PRESETS = [0, 4, 8, 12, 16, 20, 24];
const LINE_HEIGHT_OPTIONS = [
    { id: "1", label: "1×" },
    { id: "1.2", label: "1.2×" },
    { id: "1.4", label: "1.4×" },
    { id: "1.6", label: "1.6×" },
    { id: "1.8", label: "1.8×" },
];
const TEXT_ALIGN_OPTIONS = [
    { id: "left", label: "Left" },
    { id: "center", label: "Center" },
    { id: "right", label: "Right" },
];
const LOGO_POSITION_OPTIONS = [
    { id: "left", label: "Left" },
    { id: "right", label: "Right" },
    { id: "top-left", label: "Top Left" },
    { id: "top-center", label: "Top Center" },
    { id: "top-right", label: "Top Right" },
    { id: "bottom-left", label: "Bottom Left" },
    { id: "bottom-center", label: "Bottom Center" },
    { id: "bottom-right", label: "Bottom Right" },
];
const LOGO_SIZE_PRESETS = [24, 28, 32, 36, 40, 48, 56];
const QR_SIZE_PRESETS = [48, 56, 64, 72, 80, 96];
const NAME_FONT_SIZE_PRESETS = [10, 12, 14, 16, 18, 20, 24];
const SLOGAN_FONT_SIZE_PRESETS = [8, 10, 12, 13, 14, 16];
const INSTRUCTION_FONT_SIZE_PRESETS = [8, 9, 10, 11, 12, 14];
const ELEMENT_POSITION_OPTIONS = [
    { id: "top", label: "Top" },
    { id: "bottom", label: "Bottom" },
    { id: "left", label: "Left" },
    { id: "right", label: "Right" },
];
const LETTER_SPACING_OPTIONS = [
    { id: "tight", label: "Tight", value: "-0.025em" },
    { id: "normal", label: "Normal", value: "0em" },
    { id: "wide", label: "Wide", value: "0.05em" },
    { id: "wider", label: "Wider", value: "0.1em" },
];
const TEXT_TRANSFORM_OPTIONS = [
    { id: "none", label: "Aa" },
    { id: "uppercase", label: "AB" },
    { id: "capitalize", label: "Ab" },
];
// ── Font Options ────────────────────────────────────────────
const FONT_OPTIONS = [
    { id: "space-grotesk", label: "Space Grotesk", family: "'Space Grotesk', sans-serif", category: "Modern" },
    { id: "inter", label: "Inter", family: "'Inter', sans-serif", category: "Modern" },
    { id: "montserrat", label: "Montserrat", family: "'Montserrat', sans-serif", category: "Modern" },
    { id: "poppins", label: "Poppins", family: "'Poppins', sans-serif", category: "Modern" },
    { id: "raleway", label: "Raleway", family: "'Raleway', sans-serif", category: "Modern" },
    { id: "oswald", label: "Oswald", family: "'Oswald', sans-serif", category: "Bold" },
    { id: "bebas-neue", label: "Bebas Neue", family: "'Bebas Neue', sans-serif", category: "Bold" },
    { id: "archivo-black", label: "Archivo Black", family: "'Archivo Black', sans-serif", category: "Bold" },
    { id: "playfair", label: "Playfair Display", family: "'Playfair Display', serif", category: "Elegant" },
    { id: "lora", label: "Lora", family: "'Lora', serif", category: "Elegant" },
    { id: "dm-serif", label: "DM Serif Display", family: "'DM Serif Display', serif", category: "Elegant" },
    { id: "roboto-slab", label: "Roboto Slab", family: "'Roboto Slab', serif", category: "Elegant" },
];
const SINGLE_COLOR_PRESETS = [
    { bg: "#0D0D0D", text: "#FFFFFF", qr: "#E10600", label: "Noir" },
    { bg: "#1E1B4B", text: "#FFFFFF", qr: "#FBBF24", label: "Navy" },
    { bg: "#FFFFFF", text: "#0D0D0D", qr: "#E10600", label: "Clean" },
    { bg: "#064E3B", text: "#FFFFFF", qr: "#34D399", label: "Forest" },
    { bg: "#7C2D12", text: "#FFFFFF", qr: "#FDE68A", label: "Espresso" },
    { bg: "#1E3A5F", text: "#FFFFFF", qr: "#93C5FD", label: "Ocean" },
    { bg: "#581C87", text: "#FFFFFF", qr: "#C084FC", label: "Plum" },
    { bg: "#18181B", text: "#F4F4F5", qr: "#F59E0B", label: "Charcoal" },
];
// ── Hex Color Input ─────────────────────────────────────────
const HexColorInput = ({ value, onChange, label }) => {
    const [text, setText] = useState(value);
    const isValidHex = (v) => /^#[0-9A-Fa-f]{6}$/.test(v);
    const handleTextChange = (v) => {
        let val = v.startsWith("#") ? v : `#${v}`;
        setText(val);
        if (isValidHex(val))
            onChange(val);
    };
    // Sync external changes
    if (value !== text && isValidHex(value)) {
        if (text !== value)
            setText(value);
    }
    return (<div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <input type="color" value={isValidHex(text) ? text : value} onChange={(e) => { onChange(e.target.value); setText(e.target.value); }} className="h-8 w-8 cursor-pointer rounded border-0 shrink-0"/>
        <Input value={text} onChange={(e) => handleTextChange(e.target.value)} className="h-8 text-xs font-mono bg-background border-border/50 w-24" maxLength={7} placeholder="#000000"/>
      </div>
    </div>);
};
const STEPS = [
    { id: "business", labelKey: "customize.step_business" },
    { id: "design", labelKey: "customize.step_design" },
    { id: "review", labelKey: "customize.step_review" },
];
// ── Character-limited input ─────────────────────────────────
const CharInput = ({ value, onChange, max, placeholder }) => (<div>
    <Input value={value} onChange={(e) => { if (e.target.value.length <= max)
    onChange(e.target.value); }} placeholder={placeholder} className="bg-background border-border/50"/>
    <p className={`mt-1 text-xs text-right ${value.length >= max ? "text-destructive" : "text-muted-foreground"}`}>
      {value.length}/{max}
    </p>
  </div>);
// ── Stars row ───────────────────────────────────────────────
const StarsRow = ({ color = "#FBBF24", size = 12 }) => (<div className="flex gap-0.5 mt-1">
    {[...Array(5)].map((_, i) => (<Star key={i} size={size} fill={color} stroke="none"/>))}
  </div>);
// ── Card Preview Component ──────────────────────────────────
// ── Pattern Overlay SVG ──────────────────────────────────────
const PatternOverlay = ({ pattern, color = "rgba(255,255,255,0.06)" }) => {
    if (pattern === "none")
        return null;
    const patternMap = {
        none: null,
        geometric: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="geo" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="20" height="20" fill="none" stroke={color} strokeWidth="0.5" transform="rotate(45 20 20)"/>
          <circle cx="20" cy="20" r="2" fill={color}/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#geo)"/>
      </svg>),
        "diagonal-lines": (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="diag" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke={color} strokeWidth="1"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#diag)"/>
      </svg>),
        dots: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="1.2" fill={color}/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>),
        hexagons: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <polygon points="14,2 25,10 25,24 14,32 3,24 3,10" fill="none" stroke={color} strokeWidth="0.6"/>
          <polygon points="14,19 25,27 25,41 14,49 3,41 3,27" fill="none" stroke={color} strokeWidth="0.6"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#hex)"/>
      </svg>),
        glassmorphism: (<div className="absolute inset-0">
        <div className="absolute inset-0 backdrop-blur-sm"/>
        <div className="absolute top-[15%] left-[10%] w-[45%] h-[45%] rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent)" }}/>
        <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent)" }}/>
      </div>),
        metallic: (<div className="absolute inset-0" style={{
                background: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
            }}>
        <div className="absolute inset-0" style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)",
            }}/>
      </div>),
        waves: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="wave" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
          <path d="M0 15 Q15 0 30 15 Q45 30 60 15" fill="none" stroke={color} strokeWidth="0.8"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#wave)"/>
      </svg>),
        circuit: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="circ" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 H15 V10 H25 V30 H40" fill="none" stroke={color} strokeWidth="0.7"/>
          <circle cx="15" cy="20" r="2" fill={color}/><circle cx="25" cy="10" r="2" fill={color}/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#circ)"/>
      </svg>),
        chevrons: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="chev" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <polyline points="0,12 12,0 24,12" fill="none" stroke={color} strokeWidth="0.6"/>
          <polyline points="0,24 12,12 24,24" fill="none" stroke={color} strokeWidth="0.6"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#chev)"/>
      </svg>),
        diamonds: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="dia" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <polygon points="12,0 24,12 12,24 0,12" fill="none" stroke={color} strokeWidth="0.6"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#dia)"/>
      </svg>),
        crosshatch: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="cross" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="12" y2="12" stroke={color} strokeWidth="0.5"/>
          <line x1="12" y1="0" x2="0" y2="12" stroke={color} strokeWidth="0.5"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#cross)"/>
      </svg>),
        triangles: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="tri" x="0" y="0" width="30" height="26" patternUnits="userSpaceOnUse">
          <polygon points="15,0 30,26 0,26" fill="none" stroke={color} strokeWidth="0.6"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#tri)"/>
      </svg>),
        confetti: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="conf" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="5" y="3" width="4" height="4" fill={color} transform="rotate(30 7 5)"/>
          <circle cx="25" cy="15" r="2" fill={color}/>
          <rect x="35" y="28" width="3" height="6" fill={color} transform="rotate(-20 36 31)"/>
          <circle cx="12" cy="32" r="1.5" fill={color}/>
          <rect x="28" y="5" width="5" height="2" fill={color} transform="rotate(45 30 6)"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#conf)"/>
      </svg>),
        zigzag: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="zz" x="0" y="0" width="20" height="16" patternUnits="userSpaceOnUse">
          <polyline points="0,8 5,0 10,8 15,0 20,8" fill="none" stroke={color} strokeWidth="0.7"/>
          <polyline points="0,16 5,8 10,16 15,8 20,16" fill="none" stroke={color} strokeWidth="0.7"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#zz)"/>
      </svg>),
        mosaic: (<svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="mos" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="11" height="11" fill={color} rx="1"/>
          <rect x="13" y="13" width="11" height="11" fill={color} rx="1"/>
          <rect x="13" y="0" width="11" height="5" fill={color} opacity="0.5" rx="1"/>
          <rect x="0" y="13" width="5" height="11" fill={color} opacity="0.5" rx="1"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#mos)"/>
      </svg>),
        sunburst: (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
                background: `repeating-conic-gradient(from 0deg, ${color} 0deg 10deg, transparent 10deg 20deg)`,
                opacity: 0.15,
            }}/>
      </div>),
        "circle-tl-br": (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-30%", left: "-20%", width: "65%", height: "90%", borderRadius: "50%", background: color, opacity: 0.25 }}/>
        <div className="absolute" style={{ bottom: "-30%", right: "-20%", width: "65%", height: "90%", borderRadius: "50%", background: color, opacity: 0.25 }}/>
      </div>),
        "circle-tr-bl": (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-30%", right: "-20%", width: "65%", height: "90%", borderRadius: "50%", background: color, opacity: 0.25 }}/>
        <div className="absolute" style={{ bottom: "-30%", left: "-20%", width: "65%", height: "90%", borderRadius: "50%", background: color, opacity: 0.25 }}/>
      </div>),
        "arc-top": (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-60%", left: "10%", width: "80%", height: "100%", borderRadius: "50%", background: color, opacity: 0.2 }}/>
        <div className="absolute" style={{ bottom: "-75%", right: "-10%", width: "50%", height: "90%", borderRadius: "50%", border: `2px solid ${color}`, opacity: 0.15 }}/>
      </div>),
        "arc-bottom": (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ bottom: "-55%", left: "-10%", width: "120%", height: "100%", borderRadius: "50%", background: color, opacity: 0.18 }}/>
      </div>),
        "blob-corners": (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-15%", left: "-10%", width: "40%", height: "55%", borderRadius: "50% 50% 50% 20%", background: color, opacity: 0.22 }}/>
        <div className="absolute" style={{ bottom: "-15%", right: "-10%", width: "45%", height: "55%", borderRadius: "20% 50% 50% 50%", background: color, opacity: 0.22 }}/>
        <div className="absolute" style={{ top: "30%", right: "-5%", width: "20%", height: "30%", borderRadius: "50%", border: `1.5px solid ${color}`, opacity: 0.12 }}/>
      </div>),
        "half-moon-right": (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-10%", right: "-35%", width: "70%", height: "120%", borderRadius: "50%", background: color, opacity: 0.2 }}/>
      </div>),
        "quarter-circles": (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: 0, left: 0, width: "40%", height: "50%", borderRadius: "0 0 100% 0", background: color, opacity: 0.2 }}/>
        <div className="absolute" style={{ bottom: 0, right: 0, width: "35%", height: "45%", borderRadius: "100% 0 0 0", background: color, opacity: 0.2 }}/>
      </div>),
        "bubble-cluster": (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-10%", right: "5%", width: "30%", height: "42%", borderRadius: "50%", background: color, opacity: 0.2 }}/>
        <div className="absolute" style={{ top: "10%", right: "22%", width: "18%", height: "26%", borderRadius: "50%", background: color, opacity: 0.15 }}/>
        <div className="absolute" style={{ bottom: "5%", left: "8%", width: "22%", height: "32%", borderRadius: "50%", background: color, opacity: 0.18 }}/>
        <div className="absolute" style={{ bottom: "15%", left: "25%", width: "12%", height: "18%", borderRadius: "50%", background: color, opacity: 0.12 }}/>
      </div>),
        swoosh: (<svg className="absolute inset-0 w-full h-full overflow-hidden" viewBox="0 0 400 250" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-50,200 Q100,100 200,180 Q300,260 450,120" fill="none" stroke={color} strokeWidth="40" opacity="0.15" strokeLinecap="round"/>
        <path d="M-30,230 Q120,140 220,200 Q320,270 470,150" fill="none" stroke={color} strokeWidth="15" opacity="0.1" strokeLinecap="round"/>
      </svg>),
        petal: (<div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-20%", left: "-15%", width: "55%", height: "70%", borderRadius: "0 70% 70% 0", background: color, opacity: 0.18, transform: "rotate(-15deg)" }}/>
        <div className="absolute" style={{ bottom: "-20%", right: "-15%", width: "50%", height: "65%", borderRadius: "70% 0 0 70%", background: color, opacity: 0.18, transform: "rotate(-15deg)" }}/>
      </div>),
    };
    return <>{patternMap[pattern]}</>;
};
const defaultOffsets = {
    businessInfo: { x: 0, y: 0 },
    instructions: { x: 0, y: 0 },
    nfcIcon: { x: 0, y: 0 },
    googleIcon: { x: 0, y: 0 },
    logo: { x: 0, y: 0 },
    qrCode: { x: 0, y: 0 },
    cta: { x: 0, y: 0 },
};
const SNAP_THRESHOLD = 8;
const CardPreview = ({ design, orientation, side, frontLine1, frontLine2, backLine1, backLine2, gradient1, gradient2, accentBand1, accentBand2, pattern, bandPosition, colorMode, nameFont, sloganFont, nameFontSize, sloganFontSize, nameLetterSpacing, sloganLetterSpacing, nameTextTransform, sloganTextTransform, nameLineHeight, sloganLineHeight, nameTextAlign, sloganTextAlign, qrPosition, logoPosition, logoSize, qrSize, instructionFont, instructionFontSize, instructionLetterSpacing, instructionLineHeight, instructionTextAlign, nameFontWeight, sloganFontWeight, instructionFontWeight, checkStrokeWidth, starsColor, iconsColor, nfcIconSize, showNfcIcon, showGoogleIcon, frontBandHeight, backBandHeight, textShadow, ctaPaddingTop, googleIconSize, dragMode, elementOffsets, onElementDrag }) => {
    const cardRef = useRef(null);
    const [activeGuides, setActiveGuides] = useState({ x: null, y: null });
    const activeGuidesRef = useRef({ x: null, y: null });
    const [isDragging, setIsDragging] = useState(false);
    const [liveDragPos, setLiveDragPos] = useState(null);
    const dragCursor = dragMode ? "grab" : "default";
    const snapToGuides = (point, el) => {
        const card = cardRef.current;
        if (!card)
            return point;
        const cardRect = card.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const cardW = cardRect.width;
        const cardH = cardRect.height;
        // Element center relative to card
        const elCenterX = elRect.left + elRect.width / 2 - cardRect.left;
        const elCenterY = elRect.top + elRect.height / 2 - cardRect.top;
        const guides = { x: null, y: null };
        let snappedX = point.x;
        let snappedY = point.y;
        // Snap to vertical center
        if (Math.abs(elCenterX - cardW / 2) < SNAP_THRESHOLD) {
            snappedX = point.x + (cardW / 2 - elCenterX);
            guides.x = 50;
        }
        // Snap to left third
        if (Math.abs(elCenterX - cardW / 3) < SNAP_THRESHOLD) {
            snappedX = point.x + (cardW / 3 - elCenterX);
            guides.x = 33.33;
        }
        // Snap to right third
        if (Math.abs(elCenterX - (cardW * 2) / 3) < SNAP_THRESHOLD) {
            snappedX = point.x + ((cardW * 2) / 3 - elCenterX);
            guides.x = 66.67;
        }
        // Snap to horizontal center
        if (Math.abs(elCenterY - cardH / 2) < SNAP_THRESHOLD) {
            snappedY = point.y + (cardH / 2 - elCenterY);
            guides.y = 50;
        }
        // Snap to top third
        if (Math.abs(elCenterY - cardH / 3) < SNAP_THRESHOLD) {
            snappedY = point.y + (cardH / 3 - elCenterY);
            guides.y = 33.33;
        }
        // Snap to bottom third
        if (Math.abs(elCenterY - (cardH * 2) / 3) < SNAP_THRESHOLD) {
            snappedY = point.y + ((cardH * 2) / 3 - elCenterY);
            guides.y = 66.67;
        }
        if (activeGuidesRef.current.x !== guides.x || activeGuidesRef.current.y !== guides.y) {
            activeGuidesRef.current = guides;
            setActiveGuides(guides);
        }
        return { x: snappedX, y: snappedY };
    };
    const renderDraggable = (id, children, className = "") => {
        const offset = elementOffsets[id] || { x: 0, y: 0 };
        const hasOffset = offset.x !== 0 || offset.y !== 0;
        // When not in drag mode, still apply saved offsets via transform
        if (!dragMode) {
            return (<div className={className} style={hasOffset ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}>
          {children}
        </div>);
        }
        const isThisDragging = liveDragPos?.id === id;
        return (<motion.div key={id} drag dragMomentum={false} dragConstraints={cardRef} dragSnapToOrigin={false} style={{
                x: offset.x,
                y: offset.y,
                cursor: dragCursor,
                borderRadius: 6,
                zIndex: 30,
                position: className.includes("absolute") ? "absolute" : undefined,
            }} onDragStart={() => {
                setIsDragging(true);
                setLiveDragPos({ id, x: offset.x, y: offset.y });
            }} onDrag={(event, info) => {
                const currentTarget = event.currentTarget;
                if (currentTarget instanceof HTMLElement) {
                    snapToGuides(info.point, currentTarget);
                }
                setLiveDragPos({
                    id,
                    x: Math.round(offset.x + info.offset.x),
                    y: Math.round(offset.y + info.offset.y),
                });
            }} onDragEnd={(_, info) => {
                setIsDragging(false);
                setLiveDragPos(null);
                activeGuidesRef.current = { x: null, y: null };
                setActiveGuides({ x: null, y: null });
                const finalX = Math.round(offset.x + info.offset.x);
                const finalY = Math.round(offset.y + info.offset.y);
                onElementDrag(id, finalX, finalY);
            }} data-drag-id={id} className={className} whileDrag={{ boxShadow: "0 0 12px rgba(225,6,0,0.4)", outline: "2px dashed rgba(255,255,255,0.35)", outlineOffset: 0 }}>
        {children}
        {isThisDragging && (<div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap rounded bg-card/90 border border-border/50 px-1.5 py-0.5 text-[9px] font-mono text-primary shadow-sm backdrop-blur-sm" style={{ zIndex: 50 }}>
            x:{liveDragPos.x} y:{liveDragPos.y}
          </div>)}
      </motion.div>);
    };
    // Alignment guide lines overlay
    const AlignmentGuides = () => {
        if (!dragMode || !isDragging)
            return null;
        return (<div className="absolute inset-0 z-[50] pointer-events-none overflow-hidden">
        {/* Grid dots background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
          <defs>
            <pattern id="snap-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.8" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#snap-grid)"/>
        </svg>

        {/* Center crosshair guides (always visible during drag) */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px opacity-[0.12]" style={{ background: 'rgba(255,255,255,0.4)' }}/>
        <div className="absolute left-0 right-0 top-1/2 h-px opacity-[0.12]" style={{ background: 'rgba(255,255,255,0.4)' }}/>

        {/* Active snap guides */}
        {activeGuides.x !== null && (<motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} className="absolute top-0 bottom-0 w-px" style={{ left: `${activeGuides.x}%`, background: 'hsl(var(--primary))', boxShadow: '0 0 6px hsl(var(--primary) / 0.5)' }}/>)}
        {activeGuides.y !== null && (<motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className="absolute left-0 right-0 h-px" style={{ top: `${activeGuides.y}%`, background: 'hsl(var(--primary))', boxShadow: '0 0 6px hsl(var(--primary) / 0.5)' }}/>)}
      </div>);
    };
    const nameSpacing = LETTER_SPACING_OPTIONS.find(o => o.id === nameLetterSpacing)?.value || "0em";
    const sloganSpacing = LETTER_SPACING_OPTIONS.find(o => o.id === sloganLetterSpacing)?.value || "0em";
    const instrSpacing = LETTER_SPACING_OPTIONS.find(o => o.id === instructionLetterSpacing)?.value || "0em";
    const textShadowValue = TEXT_SHADOW_OPTIONS.find(o => o.id === textShadow)?.value || "none";
    const textShadowStyle = textShadowValue === "none" ? undefined : textShadowValue;
    // Google Logo SVG element
    const GoogleIcon = ({ size }) => (<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>);
    const bgStyle = colorMode === "single"
        ? { background: design.bgColor, color: design.textColor }
        : { background: `linear-gradient(160deg, ${gradient1} 0%, ${gradient2} 70%)`, color: design.textColor };
    const bgStyleBack = colorMode === "single"
        ? { background: design.bgColor, color: design.textColor }
        : { background: `linear-gradient(160deg, ${gradient2} 0%, ${gradient1} 100%)`, color: design.textColor };
    const aspectClass = orientation === "landscape" ? "aspect-[1.6/1]" : "aspect-[1/1.6]";
    const isLandscape = orientation === "landscape";
    const resolvedLogoUrl = resolveAssetUrl(design.logoUrl);
    const logoImage = resolvedLogoUrl ? (<img src={resolvedLogoUrl} alt="Logo" draggable={false} onDragStart={(e) => e.preventDefault()} className="w-auto object-contain select-none pointer-events-none" style={{ height: `${logoSize}px` }}/>) : null;
    if (side === "front") {
        if (isLandscape) {
            const isLogoLeft = logoPosition === "left";
            const logoElement = design.logoUrl ? (<div className="shrink-0 flex items-center">{logoImage}</div>) : null;
            const businessInfoBlock = (<div className="flex flex-col justify-center" style={{ textAlign: nameTextAlign }}>
          <p style={{ fontSize: `${nameFontSize}px`, fontFamily: nameFont, fontWeight: nameFontWeight, letterSpacing: nameSpacing, textTransform: nameTextTransform === "none" ? undefined : nameTextTransform, lineHeight: nameLineHeight, textAlign: nameTextAlign, textShadow: textShadowStyle }}>{design.businessName || "Business Name"}</p>
          {design.slogan && <p className="opacity-70 mt-1" style={{ fontSize: `${sloganFontSize}px`, fontFamily: sloganFont, fontWeight: sloganFontWeight, letterSpacing: sloganSpacing, textTransform: sloganTextTransform === "none" ? undefined : sloganTextTransform, lineHeight: sloganLineHeight, textAlign: sloganTextAlign, textShadow: textShadowStyle }}>{design.slogan}</p>}
          <StarsRow color={starsColor} size={14}/>
        </div>);
            const frontMainGroup = businessInfoBlock;
            const instrJustify = instructionTextAlign === "center" ? "justify-center" : instructionTextAlign === "right" ? "justify-end" : "justify-start";
            const frontSecondGroup = (<div className="space-y-1.5">
          {frontLine1 && (<div className={`flex items-center gap-1.5 ${instrJustify}`}>
              <Check size={12} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor }}/>
              <span className="opacity-90" style={{ fontSize: `${instructionFontSize}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: instructionLineHeight, textShadow: textShadowStyle }}>{frontLine1}</span>
            </div>)}
          {frontLine2 && (<div className={`flex items-center gap-1.5 ${instrJustify}`}>
              <Check size={12} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor }}/>
              <span className="opacity-90" style={{ fontSize: `${instructionFontSize}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: instructionLineHeight, textShadow: textShadowStyle }}>{frontLine2}</span>
            </div>)}
        </div>);
            const frontCtaBlock = (<div style={{ paddingTop: `${ctaPaddingTop}px` }}>
          <p className="text-xs font-medium opacity-80" style={{ textShadow: textShadowStyle }}>{design.cta || "Powered by RedVanta"}</p>
        </div>);
            const logoBlock = design.logoUrl ? renderDraggable("logo", logoElement, "z-20 shrink-0") : null;
            const businessRow = (<div className={`flex items-center gap-1.5 w-full ${isLogoLeft ? 'flex-row' : 'flex-row-reverse'}`}>
          {logoBlock}
          <div className="flex-1 text-left">
            {renderDraggable("businessInfo", frontMainGroup)}
          </div>
        </div>);
            return (<div ref={cardRef} className={`${aspectClass} rounded-xl overflow-hidden shadow-2xl relative transition-all`} style={bgStyle}>
          <AlignmentGuides />
          {colorMode === "template" && <PatternOverlay pattern={pattern}/>}
          {showNfcIcon && renderDraggable("nfcIcon", <svg width={nfcIconSize} height={nfcIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a16.09 16.09 0 0 1 0 15.8"/>
            </svg>, "absolute top-3 right-3 opacity-30 z-20")}
          {showGoogleIcon && renderDraggable("googleIcon", <GoogleIcon size={googleIconSize}/>, "absolute bottom-3 right-3 opacity-60 z-20")}
          <div className="h-full flex flex-col justify-center gap-4 relative z-10 p-5">
            {businessRow}
            {renderDraggable("instructions", frontSecondGroup)}
            {renderDraggable("cta", frontCtaBlock)}
          </div>
          {colorMode === "template" && bandPosition !== "hidden" && (<div className={`absolute left-0 right-0 ${bandPosition === "top" ? "top-0" : "bottom-0"}`} style={{ height: `${frontBandHeight}%`, background: `linear-gradient(90deg, ${accentBand1} 0%, ${accentBand2} 100%)`, opacity: 0.9 }}/>)}
        </div>);
        }
        // Portrait
        return (<div ref={cardRef} className={`${aspectClass} rounded-xl overflow-hidden shadow-2xl relative transition-all`} style={bgStyle}>
        <AlignmentGuides />
        {colorMode === "template" && <PatternOverlay pattern={pattern}/>}
        {showNfcIcon && renderDraggable("nfcIcon", <svg width={nfcIconSize} height={nfcIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a16.09 16.09 0 0 1 0 15.8"/>
          </svg>, "absolute top-3 right-3 opacity-30 z-20")}
        {showGoogleIcon && renderDraggable("googleIcon", <GoogleIcon size={googleIconSize}/>, "absolute bottom-3 right-3 opacity-60 z-20")}
        <div className="h-full flex flex-col justify-between relative z-10 p-5">
          {design.logoUrl && logoPosition === "top-center" && renderDraggable("logo", <div className="flex justify-center">
              {logoImage}
            </div>, "z-20")}
          {renderDraggable("businessInfo", <div style={{ textAlign: nameTextAlign }}>
              <p style={{ fontSize: `${nameFontSize}px`, fontFamily: nameFont, fontWeight: nameFontWeight, letterSpacing: nameSpacing, textTransform: nameTextTransform === "none" ? undefined : nameTextTransform, lineHeight: nameLineHeight, textAlign: nameTextAlign, textShadow: textShadowStyle }}>{design.businessName || "Business Name"}</p>
              <StarsRow color={starsColor} size={14}/>
              {design.slogan && <p className="opacity-70 mt-1.5" style={{ fontSize: `${sloganFontSize}px`, fontFamily: sloganFont, fontWeight: sloganFontWeight, letterSpacing: sloganSpacing, textTransform: sloganTextTransform === "none" ? undefined : sloganTextTransform, lineHeight: sloganLineHeight, textAlign: sloganTextAlign, textShadow: textShadowStyle }}>{design.slogan}</p>}
            </div>)}
          {renderDraggable("instructions", <div className="space-y-1.5 my-2">
              {frontLine1 && (<div className={`flex items-center gap-1.5 ${instructionTextAlign === "center" ? "justify-center" : instructionTextAlign === "right" ? "justify-end" : "justify-start"}`}>
                  <Check size={12} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor }}/>
                  <span className="opacity-90" style={{ fontSize: `${instructionFontSize}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: instructionLineHeight, textShadow: textShadowStyle }}>{frontLine1}</span>
                </div>)}
              {frontLine2 && (<div className={`flex items-center gap-1.5 ${instructionTextAlign === "center" ? "justify-center" : instructionTextAlign === "right" ? "justify-end" : "justify-start"}`}>
                  <Check size={12} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor }}/>
                  <span className="opacity-90" style={{ fontSize: `${instructionFontSize}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: instructionLineHeight, textShadow: textShadowStyle }}>{frontLine2}</span>
                </div>)}
            </div>)}
          {design.logoUrl && logoPosition === "bottom-center" && renderDraggable("logo", <div className="mt-1 flex justify-center">
              {logoImage}
            </div>, "z-20")}
          {renderDraggable("cta", <div className="flex items-end justify-between" style={{ paddingTop: `${ctaPaddingTop}px` }}>
              <p className="text-xs font-medium opacity-80" style={{ textShadow: textShadowStyle }}>{design.cta || "Powered by RedVanta"}</p>
            </div>)}
        </div>
        {colorMode === "template" && bandPosition !== "hidden" && (<div className={`absolute left-0 right-0 ${bandPosition === "top" ? "top-0" : "bottom-0"}`} style={{ height: `${frontBandHeight}%`, background: `linear-gradient(90deg, ${accentBand1} 0%, ${accentBand2} 100%)`, opacity: 0.9 }}/>)}
      </div>);
    }
    // ── Back side ───────────────────────────────────────────
    const qrElement = (<div className="rounded-lg flex items-center justify-center shrink-0" style={{ height: `${qrSize}px`, width: `${qrSize}px`, backgroundColor: design.qrColor + "18", border: `1px solid ${design.qrColor}33` }}>
      <QrCode size={Math.round(qrSize * 0.6)} style={{ color: design.qrColor }}/>
    </div>);
    const isQrHorizontal = qrPosition === "left" || qrPosition === "right";
    const isQrFirst = qrPosition === "left" || qrPosition === "top";
    const backBusinessInfo = (<div className="flex flex-col items-center gap-1">
      <p className="text-center" style={{ fontSize: `${Math.max(nameFontSize - 4, 8)}px`, fontFamily: nameFont, fontWeight: nameFontWeight, letterSpacing: nameSpacing, textTransform: nameTextTransform === "none" ? undefined : nameTextTransform, lineHeight: nameLineHeight, textShadow: textShadowStyle }}>{design.businessName || "Business Name"}</p>
      {design.slogan && <p className="opacity-70 text-center" style={{ fontSize: `${Math.max(sloganFontSize - 2, 7)}px`, fontFamily: sloganFont, fontWeight: sloganFontWeight, letterSpacing: sloganSpacing, textTransform: sloganTextTransform === "none" ? undefined : sloganTextTransform, lineHeight: sloganLineHeight, textShadow: textShadowStyle }}>{design.slogan}</p>}
      <StarsRow color={starsColor} size={11}/>
    </div>);
    const backInstrJustify = instructionTextAlign === "center" ? "justify-center" : instructionTextAlign === "right" ? "justify-end" : "justify-start";
    const secondGroup = (<div className="flex flex-col items-center gap-1.5">
      {backLine1 && (<div className={`flex items-center gap-1.5 ${backInstrJustify}`}>
          <Check size={11} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor }}/>
          <span className="opacity-80" style={{ fontSize: `${Math.max(instructionFontSize - 1, 7)}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: instructionLineHeight, textShadow: textShadowStyle }}>{backLine1}</span>
        </div>)}
      {backLine2 && (<div className={`flex items-center gap-1.5 ${backInstrJustify}`}>
          <Check size={11} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor }}/>
          <span className="opacity-80" style={{ fontSize: `${Math.max(instructionFontSize - 1, 7)}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: instructionLineHeight, textShadow: textShadowStyle }}>{backLine2}</span>
        </div>)}
    </div>);
    const backCtaBlock = (<div style={{ paddingTop: `${ctaPaddingTop}px` }}>
      <p className="text-[10px] font-medium opacity-70" style={{ textShadow: textShadowStyle }}>{design.cta || "Powered by RedVanta"}</p>
    </div>);
    return (<div ref={cardRef} className={`${aspectClass} rounded-xl overflow-hidden shadow-2xl relative transition-all`} style={bgStyleBack}>
      <AlignmentGuides />
      {colorMode === "template" && <PatternOverlay pattern={pattern}/>}
      {showGoogleIcon && renderDraggable("googleIcon", <GoogleIcon size={googleIconSize}/>, "absolute bottom-3 right-3 opacity-60 z-20")}
      <div className={`h-full flex flex-col items-center justify-center gap-4 relative z-10 p-5`}>
        <div className={`flex ${isQrHorizontal ? "flex-row" : "flex-col"} items-center gap-3`}>
          {isQrFirst && renderDraggable("qrCode", qrElement)}
          {renderDraggable("businessInfo", backBusinessInfo)}
          {!isQrFirst && renderDraggable("qrCode", qrElement)}
        </div>
        {renderDraggable("instructions", secondGroup)}
        {renderDraggable("cta", backCtaBlock)}
      </div>
      {colorMode === "template" && bandPosition !== "hidden" && (<div className={`absolute left-0 right-0 ${bandPosition === "top" ? "top-0" : "bottom-0"}`} style={{ height: `${backBandHeight}%`, background: `linear-gradient(90deg, ${accentBand1} 0%, ${accentBand2} 100%)`, opacity: 0.9 }}/>)}
    </div>);
};
// ── Main Component ──────────────────────────────────────────
const Customize = () => {
    const params = useParams();
    const router = useRouter();
    const itemId = Array.isArray(params?.orderId) ? params.orderId[0] : params?.orderId;
    const navigate = (path) => router.push(path);
    const { items, updateDesign, updateQuantity, isCartReady } = useCart();
    const { t } = useLanguage();
    const { getDesignById } = useDesigns();
    const shopApiBase = `${API_BASE_URL}/client/shop`;
    // Detect edit mode: itemId like "edit-d-1" means editing saved design "d-1"
    const isEditMode = itemId?.startsWith("edit-") ?? false;
    const editDesignId = isEditMode ? itemId.replace("edit-", "") : null;
    const editingDesign = editDesignId ? getDesignById(editDesignId) : null;
    const normalizedItemId = itemId != null ? String(itemId) : null;
    const item = !isEditMode
        ? items.find((i) => String(i?.id) === normalizedItemId)
        : null;
    // ── Product & Platform config ─────────────────────────────
    const productConfig = useMemo(() => getProductConfig(item?.productName), [item?.productName]);
    const platformConfig = PLATFORM_STEP_CONFIGS[productConfig.platform];
    const [linkInput, setLinkInput] = useState("");
    const [design, setDesign] = useState(() => {
        if (editingDesign) {
            return {
                ...defaultDesign("classic"),
                ...editingDesign,
                businessName: editingDesign.businessName,
                errors: Array.isArray(editingDesign.errors) ? editingDesign.errors : [],
            };
        }
        return {
            ...defaultDesign(item?.model || "classic"),
            ...(item?.design || {}),
            errors: Array.isArray(item?.design?.errors) ? item.design.errors : [],
        };
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [businessResults, setBusinessResults] = useState([]);
    const [isSearchingBusinesses, setIsSearchingBusinesses] = useState(false);
    const [logoFile, setLogoFile] = useState(design.logoUrl);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [remoteDesignId, setRemoteDesignId] = useState(() => item?.design?.id || null);
    const [isSyncingRemoteDesign, setIsSyncingRemoteDesign] = useState(false);
    const [isSavingDesignStep, setIsSavingDesignStep] = useState(false);
    const [orientation, setOrientation] = useState(() => editingDesign?.orientation || "landscape");
    const [currentStep, setCurrentStep] = useState(0);
    const [previewSide, setPreviewSide] = useState("front");
    // Instructions state - pre-load from editing design if available
    const [frontLine1, setFrontLine1] = useState(() => editingDesign?.frontInstructions.split("\n")[0] || platformConfig.defaultInstructions.frontLine1);
    const [frontLine2, setFrontLine2] = useState(() => editingDesign?.frontInstructions.split("\n")[1] || platformConfig.defaultInstructions.frontLine2);
    const [backLine1, setBackLine1] = useState(() => editingDesign?.backInstructions.split("\n")[0] || platformConfig.defaultInstructions.backLine1);
    const [backLine2, setBackLine2] = useState(() => editingDesign?.backInstructions.split("\n")[1] || platformConfig.defaultInstructions.backLine2);
    // Template / gradient state - pre-load from product platform default template
    const matchingTemplate = editingDesign ? CARD_TEMPLATES.find(t => t.label === editingDesign.template) : null;
    const defaultTpl = CARD_TEMPLATES.find(t => t.id === productConfig.defaultTemplateId) || CARD_TEMPLATES[0];
    const [selectedTemplate, setSelectedTemplate] = useState(() => matchingTemplate?.id || defaultTpl.id);
    const [templateFilter, setTemplateFilter] = useState("all");
    const activeTemplate = CARD_TEMPLATES.find(t => t.id === selectedTemplate) || defaultTpl;
    const [gradient1, setGradient1] = useState(() => editingDesign?.templateColor1 || defaultTpl.gradient1);
    const [gradient2, setGradient2] = useState(() => editingDesign?.templateColor2 || defaultTpl.gradient2);
    const [accentBand1, setAccentBand1] = useState(defaultTpl.accentBand1);
    const [accentBand2, setAccentBand2] = useState(defaultTpl.accentBand2);
    const [bandPosition, setBandPosition] = useState("bottom");
    const [colorMode, setColorMode] = useState("template");
    const [nameFont, setNameFont] = useState(FONT_OPTIONS[0].family);
    const [sloganFont, setSloganFont] = useState(FONT_OPTIONS[0].family);
    const [nameFontSize, setNameFontSize] = useState(16);
    const [sloganFontSize, setSloganFontSize] = useState(12);
    const [nameLetterSpacing, setNameLetterSpacing] = useState("normal");
    const [sloganLetterSpacing, setSloganLetterSpacing] = useState("normal");
    const [nameTextTransform, setNameTextTransform] = useState("none");
    const [sloganTextTransform, setSloganTextTransform] = useState("none");
    const [nameLineHeight, setNameLineHeight] = useState("1.2");
    const [sloganLineHeight, setSloganLineHeight] = useState("1.4");
    const [nameTextAlign, setNameTextAlign] = useState("left");
    const [sloganTextAlign, setSloganTextAlign] = useState("left");
    const [qrPosition, setQrPosition] = useState("top");
    const [logoPosition, setLogoPosition] = useState("top-left");
    const [instructionFont, setInstructionFont] = useState(FONT_OPTIONS[0].family);
    const [instructionFontSize, setInstructionFontSize] = useState(10);
    const [instructionLetterSpacing, setInstructionLetterSpacing] = useState("normal");
    const [instructionLineHeight, setInstructionLineHeight] = useState("1.4");
    const [instructionTextAlign, setInstructionTextAlign] = useState("left");
    const [logoSize, setLogoSize] = useState(32);
    const [qrSize, setQrSize] = useState(80);
    const [nameFontWeight, setNameFontWeight] = useState("700");
    const [sloganFontWeight, setSloganFontWeight] = useState("400");
    const [instructionFontWeight, setInstructionFontWeight] = useState("400");
    const [checkStrokeWidth, setCheckStrokeWidth] = useState(3.5);
    const [starsColor, setStarsColor] = useState("#FBBF24");
    const [iconsColor, setIconsColor] = useState("#22C55E");
    const [nfcIconSize, setNfcIconSize] = useState(24);
    const [frontBandHeight, setFrontBandHeight] = useState(22);
    const [backBandHeight, setBackBandHeight] = useState(12);
    const [textShadow, setTextShadow] = useState("none");
    const [ctaPaddingTop, setCtaPaddingTop] = useState(8);
    const [googleIconSize, setGoogleIconSize] = useState(20);
    const [showNfcIcon, setShowNfcIcon] = useState(true);
    const [showGoogleIcon, setShowGoogleIcon] = useState(true);
    const [dragMode, setDragMode] = useState(false);
    const [allOffsets, setAllOffsets] = useState({
        landscape: { front: { ...defaultOffsets }, back: { ...defaultOffsets } },
        portrait: { front: { ...defaultOffsets }, back: { ...defaultOffsets } },
    });
    const elementOffsets = allOffsets[orientation]?.[previewSide] ?? { ...defaultOffsets };
    const handleElementDrag = (key, x, y) => {
        setAllOffsets(prev => ({
            ...prev,
            [orientation]: {
                ...prev[orientation],
                [previewSide]: {
                    ...(prev[orientation]?.[previewSide] ?? { ...defaultOffsets }),
                    [key]: { x, y },
                },
            },
        }));
    };
    const resetPositions = () => setAllOffsets(prev => ({
        ...prev,
        [orientation]: {
            ...prev[orientation],
            [previewSide]: { ...defaultOffsets },
        },
    }));
    // Auto-correct positions based on orientation
    useEffect(() => {
        if (orientation === "landscape") {
            if (qrPosition !== "left" && qrPosition !== "right")
                setQrPosition("right");
            if (logoPosition !== "left" && logoPosition !== "right") {
                setLogoPosition("left");
            }
        }
        else {
            if (qrPosition !== "top" && qrPosition !== "bottom")
                setQrPosition("top");
            if (logoPosition !== "top-center" && logoPosition !== "bottom-center") {
                setLogoPosition("top-center");
            }
        }
    }, [orientation]);
    // ── Apply platform default template styling on mount ──────
    useEffect(() => {
        if (!editingDesign) {
            setDesign(d => ({ ...d, textColor: defaultTpl.textColor, qrColor: defaultTpl.qrColor }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ── Unsaved changes tracking ──────────────────────────────
    const [isDirty, setIsDirty] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingNavPath, setPendingNavPath] = useState(null);
    // Mark dirty on any design-related change
    const markDirty = useCallback(() => setIsDirty(true), []);
    useEffect(() => { markDirty(); }, [design.businessName, design.logoUrl, gradient1, gradient2, orientation, selectedTemplate, frontLine1, frontLine2, backLine1, backLine2]);
    // Don't count initial render
    useEffect(() => { setIsDirty(false); }, []);
    // Browser tab close / refresh warning
    useEffect(() => {
        const handler = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);
    // ── Auto-save draft every 30 seconds + version history ──────
    const [lastAutoSave, setLastAutoSave] = useState(null);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [remoteVersionHistory, setRemoteVersionHistory] = useState([]);
    const [isLoadingVersionHistory, setIsLoadingVersionHistory] = useState(false);
    const autoSaveInFlightRef = useRef(false);
    const placesSessionRef = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-places`);
    const initializedCartItemRef = useRef(null);

    const syncCartDesignSummary = useCallback((remoteDesign) => {
        if (!item || !remoteDesign)
            return;
        updateDesign(item.id, {
            ...(item.design || {}),
            id: remoteDesign.id,
            businessName: remoteDesign.businessName,
            cardModel: remoteDesign.cardModel,
            orientation: remoteDesign.orientation,
            status: remoteDesign.status,
            validatedAt: remoteDesign.validatedAt,
            version: remoteDesign.version,
        });
    }, [item, updateDesign]);

    const applyRemoteDesignData = useCallback((remoteDesign) => {
        if (!remoteDesign)
            return;
        setRemoteDesignId(remoteDesign.id);
        setDesign((prev) => ({
            ...prev,
            id: remoteDesign.id ?? prev.id,
            businessName: remoteDesign.businessName ?? prev.businessName,
            slogan: remoteDesign.slogan ?? prev.slogan,
            cta: remoteDesign.callToAction ?? prev.cta,
            googlePlaceId: remoteDesign.googlePlaceId ?? prev.googlePlaceId,
            googleReviewLink: remoteDesign.googleReviewUrl ?? prev.googleReviewLink,
            logoUrl: remoteDesign.logoUrl ?? prev.logoUrl,
            bgColor: remoteDesign.bgColor ?? prev.bgColor,
            textColor: remoteDesign.textColor ?? prev.textColor,
            qrColor: remoteDesign.accentColor ?? prev.qrColor,
            model: remoteDesign.cardModel ?? prev.model,
            status: remoteDesign.status ?? prev.status,
            errors: [],
        }));
        if (remoteDesign.businessName)
            setSearchQuery(remoteDesign.businessName);
        if (remoteDesign.logoUrl)
            setLogoFile(resolveAssetUrl(remoteDesign.logoUrl));
        if (remoteDesign.orientation)
            setOrientation(remoteDesign.orientation);
        if (remoteDesign.templateName && CARD_TEMPLATES.some((tpl) => tpl.id === remoteDesign.templateName))
            setSelectedTemplate(remoteDesign.templateName);
        if (remoteDesign.gradient1)
            setGradient1(remoteDesign.gradient1);
        if (remoteDesign.gradient2)
            setGradient2(remoteDesign.gradient2);
        if (remoteDesign.accentBand1)
            setAccentBand1(remoteDesign.accentBand1);
        if (remoteDesign.accentBand2)
            setAccentBand2(remoteDesign.accentBand2);
        if (remoteDesign.bandPosition)
            setBandPosition(remoteDesign.bandPosition);
        if (remoteDesign.colorMode)
            setColorMode(remoteDesign.colorMode);
        if (remoteDesign.logoPosition)
            setLogoPosition(remoteDesign.logoPosition);
        if (remoteDesign.logoSize != null)
            setLogoSize(remoteDesign.logoSize);
        if (remoteDesign.businessFont)
            setNameFont(remoteDesign.businessFont);
        if (remoteDesign.businessFontSize != null)
            setNameFontSize(remoteDesign.businessFontSize);
        if (remoteDesign.businessFontWeight)
            setNameFontWeight(String(remoteDesign.businessFontWeight));
        if (remoteDesign.businessFontSpacing)
            setNameLetterSpacing(remoteDesign.businessFontSpacing);
        if (remoteDesign.businessLineHeight)
            setNameLineHeight(String(remoteDesign.businessLineHeight));
        if (remoteDesign.businessAlign)
            setNameTextAlign(remoteDesign.businessAlign);
        if (remoteDesign.businessTextTransform)
            setNameTextTransform(remoteDesign.businessTextTransform);
        if (remoteDesign.sloganFont)
            setSloganFont(remoteDesign.sloganFont);
        if (remoteDesign.sloganFontSize != null)
            setSloganFontSize(remoteDesign.sloganFontSize);
        if (remoteDesign.sloganFontWeight)
            setSloganFontWeight(String(remoteDesign.sloganFontWeight));
        if (remoteDesign.sloganFontSpacing)
            setSloganLetterSpacing(remoteDesign.sloganFontSpacing);
        if (remoteDesign.sloganLineHeight)
            setSloganLineHeight(String(remoteDesign.sloganLineHeight));
        if (remoteDesign.sloganAlign)
            setSloganTextAlign(remoteDesign.sloganAlign);
        if (remoteDesign.sloganTextTransform)
            setSloganTextTransform(remoteDesign.sloganTextTransform);
        if (remoteDesign.textShadow)
            setTextShadow(remoteDesign.textShadow);
        if (remoteDesign.frontInstruction1 != null)
            setFrontLine1(remoteDesign.frontInstruction1);
        if (remoteDesign.frontInstruction2 != null)
            setFrontLine2(remoteDesign.frontInstruction2);
        if (remoteDesign.backInstruction1 != null)
            setBackLine1(remoteDesign.backInstruction1);
        if (remoteDesign.backInstruction2 != null)
            setBackLine2(remoteDesign.backInstruction2);
        if (remoteDesign.instrFont)
            setInstructionFont(remoteDesign.instrFont);
        if (remoteDesign.instrFontSize != null)
            setInstructionFontSize(remoteDesign.instrFontSize);
        if (remoteDesign.instrFontWeight)
            setInstructionFontWeight(String(remoteDesign.instrFontWeight));
        if (remoteDesign.instrFontSpacing)
            setInstructionLetterSpacing(remoteDesign.instrFontSpacing);
        if (remoteDesign.instrLineHeight)
            setInstructionLineHeight(String(remoteDesign.instrLineHeight));
        if (remoteDesign.instrAlign)
            setInstructionTextAlign(remoteDesign.instrAlign);
        if (remoteDesign.checkStrokeWidth != null)
            setCheckStrokeWidth(Number(remoteDesign.checkStrokeWidth));
        if (remoteDesign.qrCodeSize != null)
            setQrSize(remoteDesign.qrCodeSize);
        if (remoteDesign.starColor)
            setStarsColor(remoteDesign.starColor);
        if (remoteDesign.iconsColor)
            setIconsColor(remoteDesign.iconsColor);
        if (remoteDesign.showNfcIcon != null)
            setShowNfcIcon(remoteDesign.showNfcIcon);
        if (remoteDesign.showGoogleIcon != null)
            setShowGoogleIcon(remoteDesign.showGoogleIcon);
        if (remoteDesign.nfcIconSize != null)
            setNfcIconSize(remoteDesign.nfcIconSize);
        if (remoteDesign.googleLogoSize != null)
            setGoogleIconSize(remoteDesign.googleLogoSize);
        if (remoteDesign.frontBandHeight != null)
            setFrontBandHeight(remoteDesign.frontBandHeight);
        if (remoteDesign.backBandHeight != null)
            setBackBandHeight(remoteDesign.backBandHeight);
        if (remoteDesign.ctaPaddingTop != null)
            setCtaPaddingTop(remoteDesign.ctaPaddingTop);
        if (remoteDesign.elementOffsets?.landscape && remoteDesign.elementOffsets?.portrait)
            setAllOffsets(remoteDesign.elementOffsets);
        if (remoteDesign.platformUrl) {
          setLinkInput(remoteDesign.platformUrl);
          setDesign(d => ({ ...d, googleReviewLink: remoteDesign.platformUrl }));
        }
    }, []);

    const ensureRemoteDesign = useCallback(async ({ forceReload = false } = {}) => {
        if (isEditMode || !item?.id || !item?.productId)
            return null;
        if (remoteDesignId && !forceReload)
            return remoteDesignId;
        const existingResponse = await fetch(`${shopApiBase}/designs/cart-item/${item.id}`, {
            credentials: "include",
        });
        const existingPayload = await existingResponse.json().catch(() => ({}));
        if (!existingResponse.ok) {
            throw new Error(existingPayload?.error || "Failed to load design");
        }
        let remoteDesign = existingPayload?.data || null;
        if (!remoteDesign) {
            const createResponse = await fetch(`${shopApiBase}/designs`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cartItemId: item.id,
                    productId: item.productId,
                }),
            });
            const createPayload = await createResponse.json().catch(() => ({}));
            if (!createResponse.ok) {
                throw new Error(createPayload?.error || "Failed to create design");
            }
            remoteDesign = createPayload?.data || null;
        }
        if (remoteDesign) {
            applyRemoteDesignData(remoteDesign);
            syncCartDesignSummary(remoteDesign);
            return remoteDesign.id;
        }
        return null;
    }, [applyRemoteDesignData, isEditMode, item, remoteDesignId, shopApiBase, syncCartDesignSummary]);
    const buildDesignSnapshot = useCallback(() => {
        const now = new Date().toISOString().split("T")[0];
        return {
            name: design.businessName ? `${design.businessName} Design` : "Untitled Design",
            businessName: design.businessName || "Untitled",
            template: (CARD_TEMPLATES.find(tpl => tpl.id === selectedTemplate) || CARD_TEMPLATES[0]).label,
            templateColor1: gradient1,
            templateColor2: gradient2,
            orientation,
            model: isEditMode && editingDesign ? editingDesign.model : MODEL_LABELS[item?.model || "classic"],
            status: "draft",
            frontInstructions: [frontLine1, frontLine2].filter(Boolean).join("\n"),
            backInstructions: [backLine1, backLine2].filter(Boolean).join("\n"),
            updatedAt: now,
        };
    }, [design.businessName, gradient1, gradient2, orientation, selectedTemplate, frontLine1, frontLine2, backLine1, backLine2, isEditMode, editingDesign, item]);
    const activeRemoteDesignId = useMemo(() => {
        const rawId = isEditMode ? editDesignId : remoteDesignId;
        const parsedId = Number(rawId);
        return Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
    }, [editDesignId, isEditMode, remoteDesignId]);
    const normalizeVersionSnapshot = useCallback((snapshot) => ({
        businessName: snapshot?.businessName || "",
        template: CARD_TEMPLATES.find((tpl) => tpl.id === snapshot?.templateName)?.label || snapshot?.templateName || "Unknown",
        templateColor1: snapshot?.gradient1 || "#111111",
        templateColor2: snapshot?.gradient2 || "#333333",
        orientation: snapshot?.orientation || "landscape",
        frontInstructions: [snapshot?.frontInstruction1, snapshot?.frontInstruction2].filter(Boolean).join("\n"),
        backInstructions: [snapshot?.backInstruction1, snapshot?.backInstruction2].filter(Boolean).join("\n"),
    }), []);
    const refreshRemoteVersions = useCallback(async () => {
        if (!activeRemoteDesignId) {
            setRemoteVersionHistory([]);
            return;
        }
        setIsLoadingVersionHistory(true);
        try {
            const response = await fetch(`${shopApiBase}/designs/${activeRemoteDesignId}/versions`, {
                credentials: "include",
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload?.error || "Failed to load version history");
            }
            const normalized = Array.isArray(payload?.data)
                ? payload.data.map((version) => ({
                    ...version,
                    timestamp: version.savedAt,
                    snapshot: normalizeVersionSnapshot(version.snapshot),
                }))
                : [];
            setRemoteVersionHistory(normalized);
        }
        catch {
            setRemoteVersionHistory([]);
        }
        finally {
            setIsLoadingVersionHistory(false);
        }
    }, [activeRemoteDesignId, normalizeVersionSnapshot, shopApiBase]);
    const versionHistory = activeRemoteDesignId ? remoteVersionHistory : [];
    useEffect(() => {
        if (!activeRemoteDesignId)
            return;
        refreshRemoteVersions();
    }, [activeRemoteDesignId, refreshRemoteVersions]);
    const [compareVersion, setCompareVersion] = useState(null);
    const handleRestoreVersion = async (version) => {
        if (!activeRemoteDesignId || !version?.id)
            return;
        setIsSavingDesignStep(true);
        try {
            const response = await fetch(`${shopApiBase}/designs/${activeRemoteDesignId}/restore/${version.id}`, {
                method: "POST",
                credentials: "include",
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload?.error || "Failed to restore version");
            }
            if (payload?.data) {
                applyRemoteDesignData(payload.data);
                syncCartDesignSummary(payload.data);
            }
            await refreshRemoteVersions();
            setCompareVersion(null);
            setShowHistoryDialog(false);
            setIsDirty(false);
            toast({ title: t("customize.version_restored") || "Version restored", description: new Date(version.timestamp).toLocaleString() });
        }
        catch (error) {
            toast({
                title: t("customize.validation_failed"),
                description: error?.message || "Failed to restore version.",
                variant: "destructive",
            });
        }
        finally {
            setIsSavingDesignStep(false);
        }
    };
    const safeNavigate = (path) => {
        if (isDirty) {
            setPendingNavPath(path);
            setShowLeaveDialog(true);
        }
        else {
            navigate(path);
        }
    };
    const confirmLeave = () => {
        setIsDirty(false);
        setShowLeaveDialog(false);
        if (pendingNavPath)
            navigate(pendingNavPath);
    };
    const applyTemplate = (tpl) => {
        setSelectedTemplate(tpl.id);
        setGradient1(tpl.gradient1);
        setGradient2(tpl.gradient2);
        setAccentBand1(tpl.accentBand1);
        setAccentBand2(tpl.accentBand2);
        setDesign(d => ({ ...d, textColor: tpl.textColor, qrColor: tpl.qrColor }));
    };
    useEffect(() => {
        if (currentStep !== 0 || platformConfig.searchMode !== "google-maps") {
            return;
        }
        const query = searchQuery.trim();
        if (query.length < 2) {
            setBusinessResults([]);
            setIsSearchingBusinesses(false);
            return;
        }
        let active = true;
        const timer = setTimeout(async () => {
            setIsSearchingBusinesses(true);
            try {
                const response = await fetch(`${API_BASE_URL}/client/places/search?q=${encodeURIComponent(query)}&session=${encodeURIComponent(placesSessionRef.current)}&lang=fr`, {
                    credentials: "include",
                });
                const payload = await response.json().catch(() => ({}));
                if (!active)
                    return;
                if (!response.ok || !payload?.success) {
                    throw new Error(payload?.error || "Failed to search businesses");
                }
                setBusinessResults(Array.isArray(payload.data)
                    ? payload.data.map((place) => ({
                        placeId: place.placeId,
                        name: place.mainText || place.description || "",
                        address: place.secondaryText || "",
                        reviewLink: "",
                    }))
                    : []);
            }
            catch {
                if (active) {
                    setBusinessResults([]);
                }
            }
            finally {
                if (active) {
                    setIsSearchingBusinesses(false);
                }
            }
        }, 350);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [currentStep, platformConfig.searchMode, searchQuery]);

    useEffect(() => {
        if (isEditMode || !isCartReady || !item?.id || !item?.productId)
            return;
        if (initializedCartItemRef.current === item.id)
            return;
        initializedCartItemRef.current = item.id;
        let active = true;
        (async () => {
            setIsSyncingRemoteDesign(true);
            try {
                await ensureRemoteDesign({ forceReload: true });
            }
            catch (error) {
                if (active) {
                    toast({
                        title: t("customize.load_failed") || "Failed to load design",
                        description: error?.message || "Unable to load the current design.",
                        variant: "destructive",
                    });
                }
            }
            finally {
                if (active) {
                    setIsSyncingRemoteDesign(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, [ensureRemoteDesign, isCartReady, isEditMode, item?.id, item?.productId, t]);

    useEffect(() => {
        if (!isEditMode || !editDesignId) return;
        let active = true;
        setIsSyncingRemoteDesign(true);
        fetch(`${shopApiBase}/designs/${editDesignId}`, { credentials: "include" })
            .then((res) => res.json())
            .then((payload) => {
                if (!active) return;
                if (payload?.data) {
                    applyRemoteDesignData(payload.data);
                }
            })
            .catch((error) => {
                if (active) {
                    toast({
                        title: t("customize.load_failed") || "Failed to load design",
                        description: error?.message || "Unable to load the design.",
                        variant: "destructive",
                    });
                }
            })
            .finally(() => {
                if (active) setIsSyncingRemoteDesign(false);
            });
        return () => { active = false; };
    }, [isEditMode, editDesignId, shopApiBase, applyRemoteDesignData, t]);

    const designErrors = Array.isArray(design?.errors) ? design.errors : [];
    const selectBusiness = async (biz) => {
        try {
            const response = await fetch(`${API_BASE_URL}/client/places/details/${encodeURIComponent(biz.placeId)}?session=${encodeURIComponent(placesSessionRef.current)}`, {
                credentials: "include",
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok || !payload?.success) {
                throw new Error(payload?.error || "Failed to load place details");
            }
            const place = payload.data || {};
            setDesign((d) => ({
                ...d,
                businessName: place.name || biz.name,
                address: place.formattedAddress || biz.address,
                googlePlaceId: place.placeId || biz.placeId,
                googleReviewLink: place.reviewUrl || biz.reviewLink || "",
            }));
            setSearchQuery(place.name || biz.name);
        }
        catch {
            setDesign((d) => ({
                ...d,
                businessName: biz.name,
                address: biz.address,
                googlePlaceId: biz.placeId,
                googleReviewLink: biz.reviewLink || "",
            }));
            setSearchQuery(biz.name);
        }
        finally {
            setShowResults(false);
            setBusinessResults([]);
        }
    };
    const applyTheme = (themeId) => {
        const t = THEMES.find((t) => t.id === themeId);
        if (t)
            setDesign((d) => ({ ...d, theme: themeId, bgColor: t.bg, textColor: t.text, qrColor: t.qr }));
    };
    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setIsUploadingLogo(true);
        const reader = new FileReader();
        reader.onload = () => {
            const encodedLogo = typeof reader.result === "string" ? reader.result : null;
            if (!encodedLogo) {
                setIsUploadingLogo(false);
                toast({
                    title: t("customize.upload_logo"),
                    description: "Unable to read the selected logo.",
                    variant: "destructive",
                });
                return;
            }
            setLogoFile(encodedLogo);
            setDesign((d) => ({ ...d, logoUrl: encodedLogo }));
            toast({
                title: t("customize.upload_logo"),
                description: t("customize.logo_uploaded"),
            });
            setIsUploadingLogo(false);
            if (e.target)
                e.target.value = "";
        };
        reader.onerror = () => {
            toast({
                title: t("customize.upload_logo"),
                description: "Unable to read the selected logo.",
                variant: "destructive",
            });
            setIsUploadingLogo(false);
            if (e.target)
                e.target.value = "";
        };
        reader.readAsDataURL(file);
    };
    const changeModel = (model) => {
        setDesign((d) => ({ ...d, model }));
    };

    const buildStep1Payload = () => ({
        businessName: design.businessName,
        slogan: design.slogan,
        callToAction: design.cta,
        ctaPaddingTop,
        googlePlaceId: design.googlePlaceId || undefined,
        googleReviewUrl: design.googleReviewLink || undefined,
         platformUrl: platformConfig.searchMode === "link-input"
        ? (linkInput || design.googleReviewLink || undefined)
        : undefined,
    });
    const getWritableRemoteDesignId = async () => {
        if (activeRemoteDesignId)
            return activeRemoteDesignId;
        return ensureRemoteDesign();
    };

    const saveRemoteStep1 = async () => {
        const designId = await getWritableRemoteDesignId();
        if (!designId)
            throw new Error("Design not ready");
        const response = await fetch(`${shopApiBase}/designs/${designId}/step1`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildStep1Payload()),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Failed to save business step");
        }
        if (payload?.data) {
            applyRemoteDesignData(payload.data);
            syncCartDesignSummary(payload.data);
            return payload.data;
        }
        return null;
    };

    const buildStep2Payload = () => ({
        orientation,
        logo: typeof design.logoUrl === "string" && design.logoUrl.startsWith("data:image/") ? design.logoUrl : undefined,
        logoUrl: typeof design.logoUrl === "string" && !design.logoUrl.startsWith("data:image/") ? design.logoUrl : undefined,
        logoPosition,
        logoSize,
        colorMode,
        bgColor: design.bgColor,
        textColor: design.textColor,
        qrColor: design.qrColor,
        starColor: starsColor,
        iconsColor,
        templateName: selectedTemplate,
        gradient1,
        gradient2,
        accentBand1,
        accentBand2,
        bandPosition,
        frontBandHeight,
        backBandHeight,
        showNfcIcon,
        showGoogleIcon,
        nfcIconSize,
        googleLogoSize: googleIconSize,
        businessFont: nameFont,
        businessFontSize: nameFontSize,
        businessFontWeight: nameFontWeight,
        businessFontSpacing: nameLetterSpacing,
        businessLineHeight: nameLineHeight,
        businessAlign: nameTextAlign,
        businessTextTransform: nameTextTransform,
        sloganFont,
        sloganFontSize,
        sloganFontWeight,
        sloganFontSpacing: sloganLetterSpacing,
        sloganLineHeight,
        sloganAlign: sloganTextAlign,
        sloganTextTransform,
        textShadow,
        frontInstruction1: frontLine1,
        frontInstruction2: frontLine2,
        backInstruction1: backLine1,
        backInstruction2: backLine2,
        instrFont: instructionFont,
        instrFontSize: instructionFontSize,
        instrFontWeight: instructionFontWeight,
        instrFontSpacing: instructionLetterSpacing,
        instrLineHeight: instructionLineHeight,
        instrAlign: instructionTextAlign,
        checkStrokeWidth,
        qrCodeSize: qrSize,
        qrCodeStyle: qrPosition,
        cardModel: design.model,
        elementOffsets: allOffsets,
    });

    const saveRemoteStep2 = async () => {
        const designId = await getWritableRemoteDesignId();
        if (!designId)
            throw new Error("Design not ready");
        const response = await fetch(`${shopApiBase}/designs/${designId}/step2`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildStep2Payload()),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || "Failed to save design step");
        }
        if (payload?.data) {
            applyRemoteDesignData(payload.data);
            syncCartDesignSummary(payload.data);
            return payload.data;
        }
        return null;
    };
    useEffect(() => {
        if (!isDirty)
            return;
        const timer = setInterval(async () => {
            if (autoSaveInFlightRef.current)
                return;
            autoSaveInFlightRef.current = true;
            try {
                await saveRemoteStep1();
                if (currentStep >= 1) {
                    await saveRemoteStep2();
                }
                await refreshRemoteVersions();
                setLastAutoSave(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
                setIsDirty(false);
            }
            catch {
                // Silent auto-save failure: the explicit actions already surface errors.
            }
            finally {
                autoSaveInFlightRef.current = false;
            }
        }, 30000);
        return () => clearInterval(timer);
    }, [currentStep, isDirty, refreshRemoteVersions, saveRemoteStep1, saveRemoteStep2]);

    const persistCurrentDesign = async () => {
        const step1Response = await saveRemoteStep1();
        const step2Response = currentStep >= 1 ? await saveRemoteStep2() : null;
        await refreshRemoteVersions();
        setIsDirty(false);
        return step2Response || step1Response;
    };

    const validateDesign = async () => {
        const errors = [];
        if (!design.businessName)
            errors.push(t("customize.name_required"));
        if (!design.logoUrl)
            errors.push(t("customize.logo_required"));
        if (errors.length > 0) {
            setDesign((d) => ({ ...d, errors, status: "draft" }));
            toast({ title: t("customize.validation_failed"), description: `${errors.length} ${t("customize.issues_found")}`, variant: "destructive" });
            return;
        }
        setIsSavingDesignStep(true);
        try {
            await saveRemoteStep2();
            const designId = await getWritableRemoteDesignId();
            if (!designId)
                throw new Error("Design not ready");
            const response = await fetch(`${shopApiBase}/designs/${designId}/validate`, {
                method: "PUT",
                credentials: "include",
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload?.error || "Failed to validate design");
            }
            if (payload?.data) {
                applyRemoteDesignData(payload.data);
                syncCartDesignSummary(payload.data);
            } else {
                const validated = { ...design, status: "validated", errors: [] };
                setDesign(validated);
                if (item)
                    updateDesign(item.id, validated);
            }
            await refreshRemoteVersions();
            toast({ title: t("customize.design_ok"), description: t("customize.design_ok_desc") });
            setCurrentStep(2);
        }
        catch (error) {
            toast({
                title: t("customize.validation_failed"),
                description: error?.message || "Failed to validate design.",
                variant: "destructive",
            });
        }
        finally {
            setIsSavingDesignStep(false);
        }
    };
    const saveAndContinue = () => {
        if (design.status !== "validated") {
            toast({ title: t("customize.validate_first"), description: t("customize.validate_first_desc"), variant: "destructive" });
            return;
        }
        if (isEditMode) {
            setIsDirty(false);
            toast({ title: t("customize.saved"), description: t("customize.saved_edit_desc") });
            setTimeout(() => navigate("/dashboard/designs"), 500);
            return;
        }
        if (item) {
            updateDesign(item.id, design);
            setIsDirty(false);
            toast({ title: t("customize.saved"), description: t("customize.saved_desc") });
            setTimeout(() => navigate("/cross-sell"), 500);
        }
    };
    const goToNextStep = async () => {
        if (currentStep === 0) {
            if (!design.businessName) {
                toast({ title: t("customize.biz_required"), description: t("customize.biz_required_desc"), variant: "destructive" });
                return;
            }
            if (platformConfig.searchMode === "google-maps" && !design.googlePlaceId) {
                toast({
                    title: t("customize.biz_required"),
                    description: t("customize.select_google_business") || "Please select a business from Google Maps search results.",
                    variant: "destructive",
                });
                return;
            }
            setIsSavingDesignStep(true);
            try {
                await saveRemoteStep1();
                setCurrentStep(1);
            }
            catch (error) {
                toast({
                    title: t("customize.load_failed") || "Failed to save business step",
                    description: error?.message || "Unable to save the business details.",
                    variant: "destructive",
                });
            }
            finally {
                setIsSavingDesignStep(false);
            }
        }
        else if (currentStep === 1) {
            await validateDesign();
        }
    };
    if (!item && !isEditMode) {
        return (<div className="flex min-h-screen items-center justify-center bg-gradient-dark pt-20">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">{t("customize.not_found")}</h1>
          <Button onClick={() => navigate("/cart")} className="mt-4">{t("customize.back_to_cart")}</Button>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-dark pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible">
          <div className="flex items-center gap-3 flex-wrap">
            <motion.h1 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
              {t("customize.title_1")} <span className="text-gradient-red">{t("customize.title_2")}</span>
            </motion.h1>
            {isEditMode && editingDesign && (<Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                <Pencil size={12} className="mr-1"/> Editing: {editingDesign.name}
              </Badge>)}
          </div>
          <motion.p variants={fadeUp} custom={1} className="mt-2 text-muted-foreground">
            {isEditMode && editingDesign
            ? `${t("customize.editing_design") || "Editing saved design"} — ${editingDesign.template} · ${editingDesign.model}`
            : `${t("customize.subtitle_prefix")} ${item?.productName || ""} · ${platformConfig.iconLabel} Platform`}
          </motion.p>
        </motion.div>

        {/* Step Indicator */}
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          {STEPS.map((step, i) => (<div key={step.id} className="flex items-center gap-2">
              <button onClick={() => i <= currentStep ? setCurrentStep(i) : null} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${i === currentStep ? "bg-primary text-primary-foreground" :
                i < currentStep ? "bg-primary/20 text-primary cursor-pointer" :
                    "bg-secondary text-muted-foreground"}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs border border-current">
                  {i < currentStep ? "✓" : i + 1}
                </span>
                {step.labelKey ? t(step.labelKey) : step.id}
              </button>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-border"/>}
            </div>))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-5">
          {/* Editor Panel */}
          <motion.div initial="hidden" animate="visible" className="lg:col-span-3 space-y-8 order-2 lg:order-1">
            {/* Step 0: Business / Content (Platform-Dynamic) */}
            {currentStep === 0 && (<>
                <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 uppercase tracking-wider">{platformConfig.iconLabel}</Badge>
                  </div>
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <Search size={18} className="text-primary"/> {platformConfig.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{platformConfig.description}</p>

                  {platformConfig.searchMode === "google-maps" ? (<>
                      <div className="relative mt-4">
                        <Input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }} placeholder={platformConfig.placeholder} className="bg-background border-border/50"/>
                        {showResults && (isSearchingBusinesses || businessResults.length > 0 || searchQuery.trim().length >= 2) && (<div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border/50 bg-secondary shadow-lg">
                            {isSearchingBusinesses ? (<div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                                <Loader2 size={16} className="animate-spin text-primary"/>
                                <span>{t("customize.searching_business") || "Searching Google Maps..."}</span>
                              </div>) : businessResults.length > 0 ? (businessResults.map((b) => (<button key={b.placeId} onClick={() => selectBusiness(b)} className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/30 last:border-0">
                                <p className="text-sm font-medium">{b.name}</p>
                                <p className="text-xs text-muted-foreground">{b.address}</p>
                              </button>))) : (<div className="px-4 py-3 text-sm text-muted-foreground">
                                {t("customize.no_business_found") || "No business found."}
                              </div>)}
                          </div>)}
                      </div>
                      {design.googlePlaceId && (<div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle2 size={14}/> {t("customize.business_linked")} {design.businessName}
                        </div>)}
                    </>) : (<div className="relative mt-4">
                      <Input value={linkInput} onChange={(e) => {
                    setLinkInput(e.target.value);
                    setDesign((d) => ({ ...d, googleReviewLink: e.target.value }));
                }} placeholder={platformConfig.placeholder} className="bg-background border-border/50"/>
                      {linkInput && (<div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle2 size={14}/> Link saved
                        </div>)}
                    </div>)}
                </motion.div>

                <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6 space-y-4">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <Type size={18} className="text-primary"/> {t("customize.card_text")}
                  </h3>
                  <div>
                    <label className="text-sm text-muted-foreground">{t("customize.business_name")}</label>
                    <Input value={design.businessName} onChange={(e) => setDesign((d) => ({ ...d, businessName: e.target.value }))} className="mt-1 bg-background border-border/50"/>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">{t("customize.slogan_label")}</label>
                    <Input value={design.slogan} onChange={(e) => setDesign((d) => ({ ...d, slogan: e.target.value }))} className="mt-1 bg-background border-border/50" placeholder={t("customize.slogan_placeholder")}/>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">{t("customize.cta_label")}</label>
                    <Input value={design.cta} onChange={(e) => setDesign((d) => ({ ...d, cta: e.target.value }))} className="mt-1 bg-background border-border/50"/>
                  </div>
                </motion.div>
              </>)}

            {/* Step 1: Design */}
            {currentStep === 1 && (<>
                {/* Orientation */}
                <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <RotateCcw size={18} className="text-primary"/> {t("customize.orientation")} / Layout
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {["landscape", "portrait", "square", "circle"].map(o => {
                const isAllowed = productConfig.allowedLayouts.includes(o);
                const isActive = orientation === (o === "square" || o === "circle" ? "landscape" : o) && ((o === "square" && orientation === "landscape") ||
                    (o === "circle" && orientation === "landscape") ||
                    (o !== "square" && o !== "circle"));
                // Simplified: map layout to orientation state
                const handleClick = () => {
                    if (!isAllowed)
                        return;
                    if (o === "landscape" || o === "square" || o === "circle")
                        setOrientation("landscape");
                    if (o === "portrait")
                        setOrientation("portrait");
                };
                const selected = (o === "landscape" && orientation === "landscape") ||
                    (o === "portrait" && orientation === "portrait");
                return (<button key={o} onClick={handleClick} disabled={!isAllowed} className={cn("rounded-lg border p-4 text-center transition-all relative", selected ? "border-primary/50 bg-primary/10" : "border-border/50 hover:border-border", !isAllowed && "opacity-40 cursor-not-allowed hover:border-border/50")}>
                          {!isAllowed && (<Lock size={12} className="absolute top-2 right-2 text-muted-foreground"/>)}
                          <div className={cn("mx-auto border border-muted-foreground/30", o === "landscape" ? "w-16 h-10 rounded" : "", o === "portrait" ? "w-10 h-16 rounded" : "", o === "square" ? "w-12 h-12 rounded" : "", o === "circle" ? "w-12 h-12 rounded-full" : "")}/>
                          <span className="mt-2 block text-xs font-medium capitalize">{o}</span>
                        </button>);
            })}
                  </div>
                </motion.div>

                {/* Logo Upload */}
                <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <ImageIcon size={18} className="text-primary"/> {t("customize.upload_logo")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t("customize.logo_format")}</p>
                  <label className="mt-4 flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border/50 bg-background p-8 hover:border-primary/30 transition-colors">
                    <Upload size={24} className="text-muted-foreground"/>
                    <span className="text-sm text-muted-foreground">{isUploadingLogo ? "Uploading..." : logoFile ? t("customize.logo_uploaded") : t("customize.click_upload")}</span>
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleLogoUpload}/>
                  </label>

                  {/* Logo Position (Front card) */}
                  {logoFile && (<div className="mt-4 space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.logo_position")}</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {LOGO_POSITION_OPTIONS
                    .filter(pos => orientation === "landscape"
                    ? pos.id === "left" || pos.id === "right"
                    : pos.id === "top-center" || pos.id === "bottom-center")
                    .map(pos => (<button key={pos.id} onClick={() => setLogoPosition(pos.id)} className={`rounded-lg border p-2 text-center text-xs font-medium transition-all ${logoPosition === pos.id ? "border-primary/50 bg-primary/10" : "border-border/50 hover:border-border"}`}>
                              {pos.label}
                            </button>))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.logo_size")} ({logoSize}px)</label>
                        <div className="mt-1 flex gap-1 flex-wrap items-center">
                          {LOGO_SIZE_PRESETS.map((s) => (<button key={s} onClick={() => setLogoSize(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${logoSize === s ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>{s}</button>))}
                          <Input type="number" min={16} max={80} value={logoSize} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 16 && v <= 80)
                setLogoSize(v); }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                        </div>
                      </div>
                    </div>)}
                </motion.div>

                {/* Color Mode Toggle */}
                <motion.div variants={fadeUp} custom={4} className="rounded-xl border border-border/50 bg-gradient-card p-6 space-y-4">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <Palette size={18} className="text-primary"/> {t("customize.color_mode")}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t("customize.color_mode_desc")}</p>
                  <div className="flex gap-3">
                    {([
                { id: "single", label: t("customize.single_color"), desc: t("customize.single_color_desc") },
                { id: "template", label: t("customize.from_template"), desc: t("customize.from_template_desc") },
            ]).map(mode => (<button key={mode.id} onClick={() => setColorMode(mode.id)} className={`flex-1 rounded-lg border p-4 text-left transition-all ${colorMode === mode.id ? "border-primary/50 bg-primary/10" : "border-border/50 hover:border-border"}`}>
                        <span className="block text-sm font-semibold">{mode.label}</span>
                        <span className="block text-xs text-muted-foreground mt-1">{mode.desc}</span>
                      </button>))}
                  </div>

                  {/* Single Color mode */}
                  {colorMode === "single" && (<div className="space-y-4 pt-2">
                      {/* Preset Colors */}
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.quick_presets")}</label>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {SINGLE_COLOR_PRESETS.map((preset) => (<button key={preset.label} onClick={() => setDesign(d => ({ ...d, bgColor: preset.bg, textColor: preset.text, qrColor: preset.qr }))} className={`rounded-lg border p-2 text-center transition-all ${design.bgColor === preset.bg && design.textColor === preset.text && design.qrColor === preset.qr
                        ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                        : "border-border/50 hover:border-border"}`}>
                              <div className="mx-auto h-6 w-6 rounded-full border border-border/30" style={{ background: preset.bg }}/>
                              <span className="block text-[10px] mt-1 text-muted-foreground">{preset.label}</span>
                            </button>))}
                        </div>
                      </div>
                      <HexColorInput label={t("customize.bg_color")} value={design.bgColor} onChange={(v) => setDesign(d => ({ ...d, bgColor: v }))}/>
                      <div className="grid grid-cols-2 gap-4">
                        <HexColorInput label={t("customize.text_color")} value={design.textColor} onChange={(v) => setDesign(d => ({ ...d, textColor: v }))}/>
                        <HexColorInput label={t("customize.qr_color")} value={design.qrColor} onChange={(v) => setDesign(d => ({ ...d, qrColor: v }))}/>
                        <HexColorInput label={t("customize.stars_color")} value={starsColor} onChange={setStarsColor}/>
                        <HexColorInput label={t("customize.icons_color")} value={iconsColor} onChange={setIconsColor}/>
                      </div>
                      {/* NFC Icon Size */}
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.nfc_size")} ({nfcIconSize}px)</label>
                        <div className="mt-1 flex gap-1 flex-wrap items-center">
                          {NFC_SIZE_PRESETS.map((s) => (<button key={s} onClick={() => setNfcIconSize(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${nfcIconSize === s ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>{s}</button>))}
                          <Input type="number" min={12} max={48} value={nfcIconSize} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 12 && v <= 48)
                setNfcIconSize(v); }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                        </div>
                      </div>
                      {/* Icon Visibility Toggles */}
                      <div className="flex gap-4">
                        <button onClick={() => setShowNfcIcon(!showNfcIcon)} className={`flex-1 rounded-lg border p-3 text-center text-xs font-medium transition-all ${showNfcIcon ? "border-primary/50 bg-primary/10" : "border-border/50 opacity-50"}`}>
                          {showNfcIcon ? t("customize.nfc_on") : t("customize.nfc_off")}
                        </button>
                        <button onClick={() => setShowGoogleIcon(!showGoogleIcon)} className={`flex-1 rounded-lg border p-3 text-center text-xs font-medium transition-all ${showGoogleIcon ? "border-primary/50 bg-primary/10" : "border-border/50 opacity-50"}`}>
                          {showGoogleIcon ? t("customize.google_on") : t("customize.google_off")}
                        </button>
                      </div>
                    </div>)}

                  {/* Template mode */}
                  {colorMode === "template" && (<div className="space-y-4 pt-2">
                      {/* Category Filter */}
                      <div className="flex flex-wrap gap-2">
                        {TEMPLATE_CATEGORIES.map((cat) => {
                    const count = cat.id === "all" ? CARD_TEMPLATES.length : CARD_TEMPLATES.filter(t => t.category === cat.id).length;
                    return (<button key={cat.id} onClick={() => setTemplateFilter(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${templateFilter === cat.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
                              {cat.label}
                              <span className="ml-1.5 opacity-60">{count}</span>
                            </button>);
                })}
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {CARD_TEMPLATES
                    .filter(tpl => templateFilter === "all" || tpl.category === templateFilter)
                    .map((tpl) => (<button key={tpl.id} onClick={() => applyTemplate(tpl)} className={`rounded-lg border p-3 transition-all ${selectedTemplate === tpl.id ? "border-primary/50 bg-primary/10 glow-red-sm" : "border-border/50 hover:border-border"}`}>
                            <div className="aspect-[1.6/1] rounded-md overflow-hidden relative mb-2" style={{ background: `linear-gradient(160deg, ${tpl.gradient1} 0%, ${tpl.gradient2} 70%)` }}>
                              <PatternOverlay pattern={tpl.pattern}/>
                              {bandPosition !== "hidden" && <div className={`absolute left-0 right-0 h-[22%] ${bandPosition === "top" ? "top-0" : "bottom-0"}`} style={{ background: `linear-gradient(90deg, ${tpl.accentBand1} 0%, ${tpl.accentBand2} 100%)`, opacity: 0.9 }}/>}
                              <div className="p-2 relative z-10">
                                <div className="h-1.5 w-10 rounded bg-white/60"/>
                                <div className="h-1 w-6 rounded bg-white/30 mt-1"/>
                              </div>
                              {tpl.badge && (<span className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/90 text-primary-foreground z-10">
                                  {tpl.badge}
                                </span>)}
                            </div>
                            <span className="text-xs font-medium">{tpl.label}</span>
                          </button>))}
                      </div>

                      {/* Band Position */}
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.band_position")}</label>
                        <div className="mt-2 flex gap-3">
                          {["top", "bottom", "hidden"].map(pos => (<button key={pos} onClick={() => setBandPosition(pos)} className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium capitalize transition-all ${bandPosition === pos ? "border-primary/50 bg-primary/10" : "border-border/50 hover:border-border"}`}>
                              {pos === "hidden" ? t("customize.band_none") : pos === "top" ? t("customize.top") : t("customize.bottom")}
                            </button>))}
                        </div>
                      </div>

                      {/* Band Height */}
                      {bandPosition !== "hidden" && (<div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground font-medium">{t("customize.front_band")} ({frontBandHeight}%)</label>
                            <div className="mt-1 flex gap-1 flex-wrap items-center">
                              {BAND_HEIGHT_PRESETS.map((s) => (<button key={s} onClick={() => setFrontBandHeight(s)} className={`rounded-md border px-2 py-1 text-xs font-medium transition-all ${frontBandHeight === s ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>{s}%</button>))}
                              <Input type="number" min={4} max={50} value={frontBandHeight} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 4 && v <= 50)
                    setFrontBandHeight(v); }} className="w-16 h-7 text-xs text-center" placeholder="%"/>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground font-medium">{t("customize.back_band")} ({backBandHeight}%)</label>
                            <div className="mt-1 flex gap-1 flex-wrap items-center">
                              {BAND_HEIGHT_PRESETS.map((s) => (<button key={s} onClick={() => setBackBandHeight(s)} className={`rounded-md border px-2 py-1 text-xs font-medium transition-all ${backBandHeight === s ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>{s}%</button>))}
                              <Input type="number" min={4} max={50} value={backBandHeight} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 4 && v <= 50)
                    setBackBandHeight(v); }} className="w-16 h-7 text-xs text-center" placeholder="%"/>
                            </div>
                          </div>
                        </div>)}

                      {/* Gradient Color Customization with Hex */}
                      <div className="grid grid-cols-2 gap-4">
                        <HexColorInput label={t("customize.gradient_start")} value={gradient1} onChange={setGradient1}/>
                        <HexColorInput label={t("customize.gradient_end")} value={gradient2} onChange={setGradient2}/>
                        <HexColorInput label={t("customize.band_color_1")} value={accentBand1} onChange={setAccentBand1}/>
                        <HexColorInput label={t("customize.band_color_2")} value={accentBand2} onChange={setAccentBand2}/>
                      </div>

                      {/* Text & QR Colors */}
                      <div className="grid grid-cols-2 gap-4">
                        <HexColorInput label={t("customize.text_color")} value={design.textColor} onChange={(v) => setDesign(d => ({ ...d, textColor: v }))}/>
                        <HexColorInput label={t("customize.qr_color")} value={design.qrColor} onChange={(v) => setDesign(d => ({ ...d, qrColor: v }))}/>
                        <HexColorInput label={t("customize.stars_color")} value={starsColor} onChange={setStarsColor}/>
                        <HexColorInput label={t("customize.icons_color")} value={iconsColor} onChange={setIconsColor}/>
                      </div>

                      {/* NFC Icon Size */}
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.nfc_size")} ({nfcIconSize}px)</label>
                        <div className="mt-1 flex gap-1 flex-wrap items-center">
                          {NFC_SIZE_PRESETS.map((s) => (<button key={s} onClick={() => setNfcIconSize(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${nfcIconSize === s ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>{s}</button>))}
                          <Input type="number" min={12} max={48} value={nfcIconSize} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 12 && v <= 48)
                setNfcIconSize(v); }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                        </div>
                      </div>
                      {/* Icon Visibility Toggles */}
                      <div className="flex gap-4">
                        <button onClick={() => setShowNfcIcon(!showNfcIcon)} className={`flex-1 rounded-lg border p-3 text-center text-xs font-medium transition-all ${showNfcIcon ? "border-primary/50 bg-primary/10" : "border-border/50 opacity-50"}`}>
                          {showNfcIcon ? t("customize.nfc_on") : t("customize.nfc_off")}
                        </button>
                        <button onClick={() => setShowGoogleIcon(!showGoogleIcon)} className={`flex-1 rounded-lg border p-3 text-center text-xs font-medium transition-all ${showGoogleIcon ? "border-primary/50 bg-primary/10" : "border-border/50 opacity-50"}`}>
                          {showGoogleIcon ? t("customize.google_on") : t("customize.google_off")}
                        </button>
                      </div>
                    </div>)}
                </motion.div>

                {/* Font Selector */}
                <motion.div variants={fadeUp} custom={5} className="rounded-xl border border-border/50 bg-gradient-card p-6 space-y-4">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <Type size={18} className="text-primary"/> {t("customize.typography")}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t("customize.typo_desc")}</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">{t("customize.name_font")}</label>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {FONT_OPTIONS.map((font) => (<button key={font.id} onClick={() => setNameFont(font.family)} className={`rounded-lg border p-3 text-left transition-all ${nameFont === font.family
                    ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                    : "border-border/50 hover:border-border"}`}>
                            <span className="block text-sm font-bold truncate" style={{ fontFamily: font.family }}>{font.label}</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5">{font.category}</span>
                          </button>))}
                      </div>
                      <div className="mt-2">
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.size_px")}</label>
                        <div className="mt-1 flex gap-1 flex-wrap items-center">
                          {NAME_FONT_SIZE_PRESETS.map((s) => (<button key={s} onClick={() => setNameFontSize(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${nameFontSize === s
                    ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border/50 text-muted-foreground hover:border-border"}`}>
                              {s}
                            </button>))}
                          <Input type="number" min={6} max={48} value={nameFontSize} onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 6 && v <= 48)
                    setNameFontSize(v);
            }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-4 flex-wrap">
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.weight")}</label>
                          <div className="mt-1 flex gap-1">
                            {FONT_WEIGHT_OPTIONS.map((o) => (<button key={o.id} onClick={() => setNameFontWeight(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${nameFontWeight === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.spacing")}</label>
                          <div className="mt-1 flex gap-1">
                            {LETTER_SPACING_OPTIONS.map((o) => (<button key={o.id} onClick={() => setNameLetterSpacing(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${nameLetterSpacing === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.transform_label")}</label>
                          <div className="mt-1 flex gap-1">
                            {TEXT_TRANSFORM_OPTIONS.map((o) => (<button key={o.id} onClick={() => setNameTextTransform(o.id)} className={`rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all ${nameTextTransform === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.line_height")}</label>
                          <div className="mt-1 flex gap-1">
                            {LINE_HEIGHT_OPTIONS.map((o) => (<button key={o.id} onClick={() => setNameLineHeight(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${nameLineHeight === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.align")}</label>
                          <div className="mt-1 flex gap-1">
                            {TEXT_ALIGN_OPTIONS.map((o) => (<button key={o.id} onClick={() => setNameTextAlign(o.id)} className={`rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all ${nameTextAlign === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground font-medium">{t("customize.slogan_font")}</label>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {FONT_OPTIONS.map((font) => (<button key={font.id} onClick={() => setSloganFont(font.family)} className={`rounded-lg border p-3 text-left transition-all ${sloganFont === font.family
                    ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                    : "border-border/50 hover:border-border"}`}>
                            <span className="block text-sm truncate" style={{ fontFamily: font.family }}>{font.label}</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5">{font.category}</span>
                          </button>))}
                      </div>
                      <div className="mt-2">
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.size_px")}</label>
                        <div className="mt-1 flex gap-1 flex-wrap items-center">
                          {SLOGAN_FONT_SIZE_PRESETS.map((s) => (<button key={s} onClick={() => setSloganFontSize(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${sloganFontSize === s
                    ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border/50 text-muted-foreground hover:border-border"}`}>
                              {s}
                            </button>))}
                          <Input type="number" min={6} max={36} value={sloganFontSize} onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 6 && v <= 36)
                    setSloganFontSize(v);
            }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                        </div>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-4 flex-wrap">
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.weight")}</label>
                          <div className="mt-1 flex gap-1">
                            {FONT_WEIGHT_OPTIONS.map((o) => (<button key={o.id} onClick={() => setSloganFontWeight(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${sloganFontWeight === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.spacing")}</label>
                          <div className="mt-1 flex gap-1">
                            {LETTER_SPACING_OPTIONS.map((o) => (<button key={o.id} onClick={() => setSloganLetterSpacing(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${sloganLetterSpacing === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.transform_label")}</label>
                          <div className="mt-1 flex gap-1">
                            {TEXT_TRANSFORM_OPTIONS.map((o) => (<button key={o.id} onClick={() => setSloganTextTransform(o.id)} className={`rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all ${sloganTextTransform === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.line_height")}</label>
                          <div className="mt-1 flex gap-1">
                            {LINE_HEIGHT_OPTIONS.map((o) => (<button key={o.id} onClick={() => setSloganLineHeight(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${sloganLineHeight === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">{t("customize.align")}</label>
                          <div className="mt-1 flex gap-1">
                            {TEXT_ALIGN_OPTIONS.map((o) => (<button key={o.id} onClick={() => setSloganTextAlign(o.id)} className={`rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all ${sloganTextAlign === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                                {o.label}
                              </button>))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Text Shadow / Outline */}
                    <div className="border-t border-border/30 pt-4">
                      <label className="text-xs text-muted-foreground font-medium">{t("customize.text_shadow")}</label>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {TEXT_SHADOW_OPTIONS.map((o) => (<button key={o.id} onClick={() => setTextShadow(o.id)} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all ${textShadow === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                            {o.label}
                          </button>))}
                      </div>
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} custom={6} className="rounded-xl border border-border/50 bg-gradient-card p-6 space-y-4">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <Type size={18} className="text-primary"/> {t("customize.instructions")}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t("customize.instructions_desc")}</p>

                  <Tabs defaultValue="front" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="front" className="flex-1">{t("customize.front_recto")}</TabsTrigger>
                      <TabsTrigger value="back" className="flex-1">{t("customize.back_verso")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="front" className="space-y-3 pt-3">
                      <div>
                        <label className="text-sm text-muted-foreground">{t("customize.instr_line_1")}</label>
                        <CharInput value={frontLine1} onChange={setFrontLine1} max={45} placeholder="e.g. Approach the phone to the card"/>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">{t("customize.instr_line_2")}</label>
                        <CharInput value={frontLine2} onChange={setFrontLine2} max={45} placeholder="e.g. Tap to leave a review"/>
                      </div>
                    </TabsContent>

                    <TabsContent value="back" className="space-y-3 pt-3">
                      <div>
                        <label className="text-sm text-muted-foreground">{t("customize.instr_line_1")}</label>
                        <CharInput value={backLine1} onChange={setBackLine1} max={60} placeholder="e.g. Use your phone camera to scan the QR code"/>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">{t("customize.instr_line_2")}</label>
                        <CharInput value={backLine2} onChange={setBackLine2} max={60} placeholder="e.g. Write a review on our Google Maps page"/>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Instruction Font Controls */}
                  <div className="border-t border-border/30 pt-4 space-y-3">
                    <label className="text-xs text-muted-foreground font-medium">{t("customize.instr_font")}</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {FONT_OPTIONS.map((font) => (<button key={font.id} onClick={() => setInstructionFont(font.family)} className={`rounded-lg border p-2 text-left transition-all ${instructionFont === font.family
                    ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                    : "border-border/50 hover:border-border"}`}>
                          <span className="block text-xs font-medium truncate" style={{ fontFamily: font.family }}>{font.label}</span>
                          <span className="block text-[9px] text-muted-foreground mt-0.5">{font.category}</span>
                        </button>))}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">{t("customize.size_px")}</label>
                      <div className="mt-1 flex gap-1 flex-wrap items-center">
                        {INSTRUCTION_FONT_SIZE_PRESETS.map((s) => (<button key={s} onClick={() => setInstructionFontSize(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${instructionFontSize === s
                    ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "border-border/50 text-muted-foreground hover:border-border"}`}>
                            {s}
                          </button>))}
                        <Input type="number" min={6} max={24} value={instructionFontSize} onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 6 && v <= 24)
                    setInstructionFontSize(v);
            }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                      </div>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.weight")}</label>
                        <div className="mt-1 flex gap-1">
                          {FONT_WEIGHT_OPTIONS.map((o) => (<button key={o.id} onClick={() => setInstructionFontWeight(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${instructionFontWeight === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                              {o.label}
                            </button>))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.spacing")}</label>
                        <div className="mt-1 flex gap-1">
                          {LETTER_SPACING_OPTIONS.map((o) => (<button key={o.id} onClick={() => setInstructionLetterSpacing(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${instructionLetterSpacing === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                              {o.label}
                            </button>))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.line_height")}</label>
                        <div className="mt-1 flex gap-1">
                          {LINE_HEIGHT_OPTIONS.map((o) => (<button key={o.id} onClick={() => setInstructionLineHeight(o.id)} className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${instructionLineHeight === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                              {o.label}
                            </button>))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.align")}</label>
                        <div className="mt-1 flex gap-1">
                          {TEXT_ALIGN_OPTIONS.map((o) => (<button key={o.id} onClick={() => setInstructionTextAlign(o.id)} className={`rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all ${instructionTextAlign === o.id ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>
                              {o.label}
                            </button>))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">{t("customize.checkmark_stroke")}</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input type="range" min={1} max={5} step={0.5} value={checkStrokeWidth} onChange={(e) => setCheckStrokeWidth(Number(e.target.value))} className="flex-1 h-1.5 accent-primary"/>
                          <span className="text-[10px] text-muted-foreground font-mono w-6 text-right">{checkStrokeWidth}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Position */}
                  <div className="border-t border-border/30 pt-4 space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">{t("customize.qr_position")}</label>
                      <div className="mt-2 flex gap-2">
                        {ELEMENT_POSITION_OPTIONS
                .filter(pos => orientation === "landscape"
                ? pos.id === "left" || pos.id === "right"
                : pos.id === "top" || pos.id === "bottom")
                .map(pos => (<button key={pos.id} onClick={() => setQrPosition(pos.id)} className={`flex-1 rounded-lg border p-2 text-center text-xs font-medium transition-all ${qrPosition === pos.id ? "border-primary/50 bg-primary/10" : "border-border/50 hover:border-border"}`}>
                            {pos.label}
                          </button>))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">{t("customize.qr_size")} ({qrSize}px)</label>
                      <div className="mt-1 flex gap-1 flex-wrap items-center">
                        {QR_SIZE_PRESETS.map((s) => (<button key={s} onClick={() => setQrSize(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${qrSize === s ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>{s}</button>))}
                        <Input type="number" min={32} max={120} value={qrSize} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 32 && v <= 120)
            setQrSize(v); }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                      </div>
                    </div>
                   </div>

                   {/* CTA Padding */}
                   <div className="border-t border-border/30 pt-4">
                     <label className="text-xs text-muted-foreground font-medium">{t("customize.cta_padding")} ({ctaPaddingTop}px)</label>
                     <div className="mt-1 flex gap-1 flex-wrap items-center">
                       {CTA_PADDING_PRESETS.map((s) => (<button key={s} onClick={() => setCtaPaddingTop(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${ctaPaddingTop === s ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>{s}</button>))}
                       <Input type="number" min={0} max={40} value={ctaPaddingTop} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 0 && v <= 40)
            setCtaPaddingTop(v); }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                     </div>
                   </div>

                   {/* Google Icon Size */}
                   <div className="border-t border-border/30 pt-4">
                     <label className="text-xs text-muted-foreground font-medium">{t("customize.google_size")} ({googleIconSize}px)</label>
                     <div className="mt-1 flex gap-1 flex-wrap items-center">
                       {GOOGLE_ICON_SIZE_PRESETS.map((s) => (<button key={s} onClick={() => setGoogleIconSize(s)} className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${googleIconSize === s ? "border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/30" : "border-border/50 text-muted-foreground hover:border-border"}`}>{s}</button>))}
                       <Input type="number" min={12} max={48} value={googleIconSize} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 12 && v <= 48)
            setGoogleIconSize(v); }} className="w-16 h-7 text-xs text-center" placeholder="px"/>
                     </div>
                   </div>
                 </motion.div>

                {/* Model Selection */}
                <motion.div variants={fadeUp} custom={7} className="rounded-xl border border-border/50 bg-gradient-card p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <Smartphone size={18} className="text-primary"/> {t("customize.card_model")}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {MODELS.map((m) => (<button key={m} onClick={() => changeModel(m)} className={`rounded-lg border p-4 text-center transition-all ${design.model === m ? "border-primary/50 bg-primary/10 glow-red-sm" : "border-border/50 hover:border-border"}`}>
                        <span className="block text-sm font-semibold">{MODEL_LABELS[m]}</span>
                        <span className="block mt-1 text-lg font-bold text-primary">${MODEL_PRICES[m]}</span>
                      </button>))}
                  </div>
                </motion.div>
              </>)}

            {/* Step 2: Review */}
            {currentStep === 2 && (<motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold">{t("customize.summary")}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">{t("customize.summary_business")}</span> <span className="font-medium">{design.businessName}</span></div>
                  <div><span className="text-muted-foreground">{t("customize.summary_model")}</span> <span className="font-medium">{MODEL_LABELS[design.model]}</span></div>
                  <div><span className="text-muted-foreground">{t("customize.summary_orientation")}</span> <span className="font-medium capitalize">{orientation}</span></div>
                  <div><span className="text-muted-foreground">{t("customize.summary_template")}</span> <span className="font-medium">{CARD_TEMPLATES.find(t => t.id === selectedTemplate)?.label}</span></div>
                  <div><span className="text-muted-foreground">{t("customize.summary_cta")}</span> <span className="font-medium">{design.cta}</span></div>
                  <div><span className="text-muted-foreground">{t("customize.summary_status")}</span> <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{t("customize.validated")}</Badge></div>
                </div>
                {design.slogan && <div className="text-sm"><span className="text-muted-foreground">{t("customize.summary_slogan")}</span> <span className="font-medium">{design.slogan}</span></div>}
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">{t("customize.front_instructions")}</p>
                  <p className="text-xs">{frontLine1} / {frontLine2}</p>
                  <p className="text-muted-foreground mt-2">{t("customize.back_instructions")}</p>
                  <p className="text-xs">{backLine1} / {backLine2}</p>
                </div>
              </motion.div>)}

            {/* Auto-save indicator + Version History */}
            <div className="flex items-center gap-3 mb-1">
              {lastAutoSave && (<p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-green-500"/>
                  {t("customize.auto_saved") || "Auto-saved"} {lastAutoSave}
                </p>)}
              {isLoadingVersionHistory && (<p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin"/>
                  {t("customize.loading_versions") || "Loading versions..."}
                </p>)}
              {versionHistory.length > 0 && (<button onClick={() => setShowHistoryDialog(true)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                  <History size={12}/> {versionHistory.length} {t("customize.versions") || "versions"}
                </button>)}
            </div>
            <div className="flex gap-3 flex-wrap">
              {isEditMode && currentStep === 0 && (<Button variant="outline" onClick={() => safeNavigate("/dashboard/designs")}>
                  ← {t("customize.back_to_designs")}
                </Button>)}
              {currentStep > 0 && (<Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  {t("customize.btn_back")}
                </Button>)}
              {currentStep < 2 && (<Button onClick={goToNextStep} disabled={isSavingDesignStep} className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70">
                  {isSavingDesignStep && <Loader2 size={16} className="mr-2 animate-spin"/>}
                  {currentStep === 1 ? t("customize.btn_validate") : t("customize.btn_next")}
                </Button>)}
              {currentStep === 2 && (<Button onClick={saveAndContinue} className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90">
                  <CheckCircle2 size={16} className="mr-2"/> {t("customize.btn_save")}
                </Button>)}
              {/* Save as Draft — always available */}
              <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" disabled={isSavingDesignStep} onClick={async () => {
            setIsSavingDesignStep(true);
            try {
                await persistCurrentDesign();
                toast({ title: t("customize.draft_saved") || "Draft saved!", description: t("customize.draft_saved_desc") || "Your progress has been saved as a draft." });
                setTimeout(() => navigate("/dashboard/designs"), 500);
            }
            catch (error) {
                toast({
                    title: t("customize.validation_failed"),
                    description: error?.message || "Unable to save draft.",
                    variant: "destructive",
                });
            }
            finally {
                setIsSavingDesignStep(false);
            }
        }}>
                <Save size={16}/> {t("customize.save_draft") || "Save as Draft"}
              </Button>
              {/* Save / Update (from step 1+) */}
              {currentStep >= 1 && (<Button variant="outline" className="gap-2 border-border/50" disabled={isSavingDesignStep} onClick={async () => {
                setIsSavingDesignStep(true);
                try {
                    await persistCurrentDesign();
                    toast({ title: t("customize.saved_design") || "Design saved!", description: t("customize.saved_design_desc") || "Your design has been saved to My Designs for later editing." });
                    setTimeout(() => navigate("/dashboard/designs"), 500);
                }
                catch (error) {
                    toast({
                        title: t("customize.validation_failed"),
                        description: error?.message || "Unable to save design.",
                        variant: "destructive",
                    });
                }
                finally {
                    setIsSavingDesignStep(false);
                }
            }}>
                  <Save size={16}/> {isEditMode ? (t("customize.update_design") || "Update Design") : (t("customize.save_as_design") || "Save as Design")}
                </Button>)}
            </div>
          </motion.div>

          {/* Live Preview */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="lg:col-span-2 order-1 lg:order-2">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: platformConfig.iconColor }}>
                      {platformConfig.iconEmoji}
                    </div>
                    <h3 className="font-display text-lg font-semibold">{t("customize.live_preview")}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Drag Mode toggle */}
                    <button onClick={() => setDragMode(!dragMode)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dragMode
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-secondary text-muted-foreground hover:text-foreground border border-border/50"}`}>
                      <Move size={12}/> {dragMode ? t("customize.editing") : t("customize.move")}
                    </button>
                    {dragMode && (<button onClick={resetPositions} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground border border-border/50 transition-all">
                        <RotateCcw size={12}/> {t("customize.reset")}
                      </button>)}
                    {/* Front / Back toggle */}
                    <div className="flex rounded-lg border border-border/50 overflow-hidden">
                      <button onClick={() => setPreviewSide("front")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${previewSide === "front" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                        {t("customize.front")}
                      </button>
                      <button onClick={() => setPreviewSide("back")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${previewSide === "back" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                        {t("customize.back")}
                      </button>
                    </div>
                  </div>
                </div>

                <SharedCardPreview design={design} orientation={orientation} side={previewSide} frontLine1={frontLine1} frontLine2={frontLine2} backLine1={backLine1} backLine2={backLine2} gradient1={gradient1} gradient2={gradient2} accentBand1={accentBand1} accentBand2={accentBand2} pattern={activeTemplate.pattern} bandPosition={bandPosition} colorMode={colorMode} nameFont={nameFont} sloganFont={sloganFont} nameFontSize={nameFontSize} sloganFontSize={sloganFontSize} nameLetterSpacing={nameLetterSpacing} sloganLetterSpacing={sloganLetterSpacing} nameTextTransform={nameTextTransform} sloganTextTransform={sloganTextTransform} nameLineHeight={nameLineHeight} sloganLineHeight={sloganLineHeight} nameTextAlign={nameTextAlign} sloganTextAlign={sloganTextAlign} qrPosition={qrPosition} logoPosition={logoPosition} logoSize={logoSize} qrSize={qrSize} instructionFont={instructionFont} instructionFontSize={instructionFontSize} instructionLetterSpacing={instructionLetterSpacing} instructionLineHeight={instructionLineHeight} instructionTextAlign={instructionTextAlign} nameFontWeight={nameFontWeight} sloganFontWeight={sloganFontWeight} instructionFontWeight={instructionFontWeight} checkStrokeWidth={checkStrokeWidth} starsColor={starsColor} iconsColor={iconsColor} nfcIconSize={nfcIconSize} showNfcIcon={showNfcIcon} showGoogleIcon={showGoogleIcon} frontBandHeight={frontBandHeight} backBandHeight={backBandHeight} textShadow={textShadow} ctaPaddingTop={ctaPaddingTop} googleIconSize={googleIconSize} dragMode={dragMode} elementOffsets={elementOffsets} onElementDrag={handleElementDrag}/>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs gap-1" style={{ borderColor: platformConfig.iconColor + '40', color: platformConfig.iconColor }}>
                      <span className="text-[10px]">{platformConfig.iconEmoji}</span> {platformConfig.iconLabel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{MODEL_LABELS[design.model]}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{orientation}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{previewSide}</Badge>
                  </div>
                  <Badge className={design.status === "validated" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                    {design.status === "validated" ? t("customize.validated") : t("customize.draft")}
                  </Badge>
                </div>
              </div>

              {designErrors.length > 0 && (<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 space-y-2">
                  {designErrors.map((err, i) => (<p key={i} className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle size={14}/> {err}
                    </p>))}
                </div>)}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customize.unsaved_title")}</DialogTitle>
            <DialogDescription>
              {t("customize.unsaved_desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
              {t("customize.unsaved_stay")}
            </Button>
            <Button variant="destructive" onClick={confirmLeave}>
              {t("customize.unsaved_leave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog with Side-by-Side Comparison */}
      <Dialog open={showHistoryDialog} onOpenChange={(open) => { setShowHistoryDialog(open); if (!open)
        setCompareVersion(null); }}>
        <DialogContent className={cn("transition-all", compareVersion ? "sm:max-w-4xl" : "sm:max-w-lg")}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History size={18}/> {compareVersion ? (t("customize.compare_versions") || "Compare Versions") : (t("customize.version_history") || "Version History")}
            </DialogTitle>
            <DialogDescription>
              {compareVersion
            ? (t("customize.compare_desc") || "Compare your current design with the selected version side by side.")
            : (t("customize.version_history_desc") || "Browse and restore previous auto-saved versions of this design.")}
            </DialogDescription>
          </DialogHeader>

          {compareVersion ? (() => {
            const currentSnapshot = buildDesignSnapshot();
            const snap = compareVersion.snapshot;
            const diffs = {
                businessName: snap.businessName !== currentSnapshot.businessName,
                template: snap.template !== currentSnapshot.template,
                colors: snap.templateColor1 !== currentSnapshot.templateColor1 || snap.templateColor2 !== currentSnapshot.templateColor2,
                orientation: snap.orientation !== currentSnapshot.orientation,
                frontInstructions: snap.frontInstructions !== currentSnapshot.frontInstructions,
                backInstructions: snap.backInstructions !== currentSnapshot.backInstructions,
            };
            const diffCount = Object.values(diffs).filter(Boolean).length;
            const DiffBadge = () => diffCount > 0 ? (<Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary ml-2">{diffCount} {diffCount === 1 ? "change" : "changes"}</Badge>) : (<Badge variant="outline" className="text-[10px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground ml-2">Identical</Badge>);
            const DiffDot = ({ changed }) => changed ? (<span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 shrink-0"/>) : null;
            return (<div className="space-y-4">
              <div className="flex items-center justify-center">
                <DiffBadge />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Current Design */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-center uppercase tracking-wider text-muted-foreground">
                    {t("customize.current") || "Current"}
                  </p>
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <div className={cn("w-full h-20 rounded-md", diffs.colors && "ring-2 ring-primary/40")} style={{ background: `linear-gradient(135deg, ${gradient1}, ${gradient2})` }}/>
                    <div className="space-y-1 text-xs">
                      <p className={cn("font-medium truncate flex items-center", diffs.businessName && "bg-primary/10 rounded px-1 -mx-1")}><DiffDot changed={diffs.businessName}/>{design.businessName || "Untitled"}</p>
                      <p className={cn("text-muted-foreground flex items-center", diffs.template && "bg-primary/10 rounded px-1 -mx-1 text-foreground")}><DiffDot changed={diffs.template}/>{(CARD_TEMPLATES.find(tpl => tpl.id === selectedTemplate) || CARD_TEMPLATES[0]).label}</p>
                      <p className={cn("text-muted-foreground capitalize flex items-center", diffs.orientation && "bg-primary/10 rounded px-1 -mx-1 text-foreground")}><DiffDot changed={diffs.orientation}/>{orientation}</p>
                      <div className="pt-1 border-t border-border/50 mt-1">
                        <p className={cn("text-muted-foreground flex items-center", diffs.frontInstructions && "bg-primary/10 rounded px-1 -mx-1")}><DiffDot changed={diffs.frontInstructions}/><span className="font-medium text-foreground">Front:</span>&nbsp;{[frontLine1, frontLine2].filter(Boolean).join(" · ") || "—"}</p>
                        <p className={cn("text-muted-foreground flex items-center", diffs.backInstructions && "bg-primary/10 rounded px-1 -mx-1")}><DiffDot changed={diffs.backInstructions}/><span className="font-medium text-foreground">Back:</span>&nbsp;{[backLine1, backLine2].filter(Boolean).join(" · ") || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Version */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-center uppercase tracking-wider text-primary">
                    {t("customize.selected_version") || "Selected Version"}
                    <span className="block font-normal normal-case text-muted-foreground">
                      {new Date(compareVersion.timestamp).toLocaleString()}
                    </span>
                  </p>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                    <div className={cn("w-full h-20 rounded-md", diffs.colors && "ring-2 ring-primary/40")} style={{ background: `linear-gradient(135deg, ${snap.templateColor1}, ${snap.templateColor2})` }}/>
                    <div className="space-y-1 text-xs">
                      <p className={cn("font-medium truncate flex items-center", diffs.businessName && "bg-primary/10 rounded px-1 -mx-1")}><DiffDot changed={diffs.businessName}/>{snap.businessName}</p>
                      <p className={cn("text-muted-foreground flex items-center", diffs.template && "bg-primary/10 rounded px-1 -mx-1 text-foreground")}><DiffDot changed={diffs.template}/>{snap.template}</p>
                      <p className={cn("text-muted-foreground capitalize flex items-center", diffs.orientation && "bg-primary/10 rounded px-1 -mx-1 text-foreground")}><DiffDot changed={diffs.orientation}/>{snap.orientation}</p>
                      <div className="pt-1 border-t border-border/50 mt-1">
                        <p className={cn("text-muted-foreground flex items-center", diffs.frontInstructions && "bg-primary/10 rounded px-1 -mx-1")}><DiffDot changed={diffs.frontInstructions}/><span className="font-medium text-foreground">Front:</span>&nbsp;{snap.frontInstructions || "—"}</p>
                        <p className={cn("text-muted-foreground flex items-center", diffs.backInstructions && "bg-primary/10 rounded px-1 -mx-1")}><DiffDot changed={diffs.backInstructions}/><span className="font-medium text-foreground">Back:</span>&nbsp;{snap.backInstructions || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setCompareVersion(null)}>
                  {t("customize.back_to_list") || "Back to list"}
                </Button>
                <Button size="sm" className="gap-1" onClick={() => handleRestoreVersion(compareVersion)}>
                  <RotateCcw size={12}/> {t("customize.restore_this") || "Restore this version"}
                </Button>
              </div>
            </div>);
        })() : versionHistory.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-6">
              {t("customize.no_versions") || "No saved versions yet. Versions are created automatically every 30 seconds."}
            </p>) : (<ScrollArea className="max-h-[400px] pr-3">
              <div className="space-y-2">
                {versionHistory.map((v, i) => {
                const date = new Date(v.timestamp);
                return (<div key={v.timestamp} className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-all group cursor-pointer" onClick={() => setCompareVersion(v)}>
                      <div className="w-10 h-7 rounded shrink-0" style={{ background: `linear-gradient(135deg, ${v.snapshot.templateColor1}, ${v.snapshot.templateColor2})` }}/>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {v.snapshot.template} · {v.snapshot.orientation}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={10}/>
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          {i === 0 && <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0">Latest</Badge>}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs gap-1" onClick={(e) => { e.stopPropagation(); setCompareVersion(v); }}>
                        <Eye size={12}/> {t("customize.compare") || "Compare"}
                      </Button>
                    </div>);
            })}
              </div>
            </ScrollArea>)}
          {!compareVersion && (<DialogFooter>
              <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
                {t("customize.close") || "Close"}
              </Button>
            </DialogFooter>)}
        </DialogContent>
      </Dialog>
    </div>);
};
export default Customize;



