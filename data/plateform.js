import {
  FaGoogle, FaGooglePlusG,
  FaFacebook, FaFacebookF,
  FaInstagram, FaInstagramSquare,
  FaTiktok,
  FaAirbnb,
} from "react-icons/fa";
import { FaSquareInstagram, FaSquareFacebook } from "react-icons/fa6";
import { SiGoogle, SiTiktok, SiAirbnb, SiTripadvisor, SiBookingdotcom } from "react-icons/si";
import { Star, StarHalf, Sparkles, Heart } from "lucide-react";

// ── Inline SVG logos (used in the platform selector) ──────────────────────────

const GoogleLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#1877F2"/>
    <path d="M16.5 8H14c-.3 0-.5.2-.5.5V10h3l-.4 2.5H13.5V19h-3v-6.5H9V10h1.5V8.2C10.5 6.4 11.7 5 13.8 5H16.5v3z" fill="#fff"/>
  </svg>
);

const InstagramLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433"/>
        <stop offset="25%" stopColor="#e6683c"/>
        <stop offset="50%" stopColor="#dc2743"/>
        <stop offset="75%" stopColor="#cc2366"/>
        <stop offset="100%" stopColor="#bc1888"/>
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-logo-grad)"/>
    <rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="#fff" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="1.5"/>
    <circle cx="17.2" cy="6.8" r="1" fill="#fff"/>
  </svg>
);

const TikTokLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#010101"/>
    <path d="M17 7.5c-.9-.6-1.5-1.5-1.7-2.5h-2.3v12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.2 0 .4 0 .6.1V12.6c-.2 0-.4-.1-.6-.1-2.4 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3V10c.8.6 1.7 1 2.7 1V8.8c-.5 0-1-.1-1-.1l.5-1.2z" fill="#fff"/>
    <path d="M16.5 8.5c.8.5 1.7.8 2.5.8V7.5c-.5 0-.9-.1-1.3-.3-.6-.3-1-.8-1.2-1.4h-1.8v9.5c0 .9-.7 1.7-1.7 1.7s-1.7-.7-1.7-1.7.7-1.7 1.7-1.7h.3v-1.8h-.3c-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5V8.5z" fill="#69C9D0"/>
  </svg>
);

const BookingLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#003580"/>
    <text x="12" y="16.5" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800" fontFamily="sans-serif">B.</text>
  </svg>
);

const TripAdvisorLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#34E0A1"/>
    <circle cx="8.5" cy="12" r="3" fill="#fff" stroke="#00AA6C" strokeWidth="1"/>
    <circle cx="15.5" cy="12" r="3" fill="#fff" stroke="#00AA6C" strokeWidth="1"/>
    <circle cx="8.5" cy="12" r="1.2" fill="#00AA6C"/>
    <circle cx="15.5" cy="12" r="1.2" fill="#00AA6C"/>
  </svg>
);

const AirbnbLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#FF5A5F"/>
    <path d="M12 4c-1 2.5-3.5 5.5-3.5 8 0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5C15.5 9.5 13 6.5 12 4z" fill="#fff"/>
    <circle cx="12" cy="14.5" r="1.5" fill="#FF5A5F"/>
  </svg>
);

const CustomLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);

// ── Platforms data ─────────────────────────────────────────────────────────────

export const PLATFORMS = [
  {
    id: "google",
    name: "Google",
    Logo: GoogleLogo,
    defaultColor: "#4285F4",
    icons: [
      { id: "google-filled",  label: "Filled",  Icon: FaGoogle },
      { id: "google-outline", label: "Outline", Icon: SiGoogle },
      { id: "google-rounded", label: "Rounded", Icon: FaGooglePlusG },
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    Logo: FacebookLogo,
    defaultColor: "#1877F2",
    icons: [
      { id: "fb-filled",  label: "Filled",  Icon: FaFacebook },
      { id: "fb-outline", label: "Outline", Icon: FaFacebookF },
      { id: "fb-rounded", label: "Rounded", Icon: FaSquareFacebook },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    Logo: InstagramLogo,
    defaultColor: "#E1306C",
    icons: [
      { id: "ig-filled",  label: "Filled",  Icon: FaInstagramSquare },
      { id: "ig-outline", label: "Outline", Icon: FaInstagram },
      { id: "ig-rounded", label: "Rounded", Icon: FaSquareInstagram },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    Logo: TikTokLogo,
    defaultColor: "#010101",
    icons: [
      { id: "tt-filled",  label: "Filled",  Icon: FaTiktok },
      { id: "tt-outline", label: "Outline", Icon: SiTiktok },
    ],
  },
  {
    id: "booking",
    name: "Booking",
    Logo: BookingLogo,
    defaultColor: "#003580",
    icons: [
      { id: "bk-filled", label: "Filled", Icon: SiBookingdotcom },
    ],
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    Logo: TripAdvisorLogo,
    defaultColor: "#34E0A1",
    icons: [
      { id: "ta-filled", label: "Filled", Icon: SiTripadvisor },
    ],
  },
  {
    id: "airbnb",
    name: "Airbnb",
    Logo: AirbnbLogo,
    defaultColor: "#FF5A5F",
    icons: [
      { id: "ab-filled",  label: "Filled",  Icon: FaAirbnb },
      { id: "ab-outline", label: "Outline", Icon: SiAirbnb },
    ],
  },
  {
    id: "custom",
    name: "Custom",
    Logo: CustomLogo,
    defaultColor: "#6366F1",
    icons: [
      { id: "cu-star",     label: "Star",     Icon: Star },
      { id: "cu-half",     label: "Half",     Icon: StarHalf },
      { id: "cu-sparkles", label: "Sparkles", Icon: Sparkles },
      { id: "cu-heart",    label: "Heart",    Icon: Heart },
    ],
  },
];

export const getPlatform = (id) => PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
