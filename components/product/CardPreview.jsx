"use client";

import { useState } from "react";
import { Check, Star, QrCode } from "lucide-react";


function getContrast(hex) {
  const c = (hex || "#0A0A0A").replace("#", "");
  if (c.length !== 6) return "#fff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#111" : "#fff";
}

const NfcSvg = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
    <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
    <path d="M12.91 4.1a16.09 16.09 0 0 1 0 15.8" />
  </svg>
);

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#1877F2" />
    <path d="M16.5 8H14c-.3 0-.5.2-.5.5V10h3l-.4 2.5H13.5V19h-3v-6.5H9V10h1.5V8.2C10.5 6.4 11.7 5 13.8 5H16.5v3z" fill="#fff" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="5" fill="url(#ig-grad)" />
    <rect x="6" y="6" width="12" height="12" rx="3" fill="none" stroke="#fff" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="1.5" />
    <circle cx="17" cy="7" r="1" fill="#fff" />
  </svg>
);

const CustomLinkIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const PLATFORM_ICONS = {
  google:    (size) => <GoogleIcon size={size} />,
  facebook:  (size) => <FacebookIcon size={size} />,
  instagram: (size) => <InstagramIcon size={size} />,
  custom:    (size, color) => <CustomLinkIcon size={size} color={color} />,
};

const StarsRow = ({ size = 12 }) => (
  <div className="flex gap-0.5 mt-2">
    {[...Array(5)].map((_, i) => <Star key={i} size={size} fill="#FBBF24" stroke="none" />)}
  </div>
);

const QrPlaceholder = ({ color = "#000", size = 72 }) => {
  const bSize = Math.round(size * 0.28);
  const bW = Math.round(bSize * 0.25);
  const bracket = (pos) => ({
    position: "absolute",
    width: bSize,
    height: bSize,
    zIndex: 3,
    ...(pos.top    !== undefined ? { top: pos.top }       : { bottom: pos.bottom }),
    ...(pos.left   !== undefined ? { left: pos.left }     : { right: pos.right }),
    borderTop:    pos.top    !== undefined ? `${bW}px solid #fff` : "none",
    borderBottom: pos.bottom !== undefined ? `${bW}px solid #fff` : "none",
    borderLeft:   pos.left   !== undefined ? `${bW}px solid #fff` : "none",
    borderRight:  pos.right  !== undefined ? `${bW}px solid #fff` : "none",
    borderRadius:
      pos.top !== undefined && pos.left  !== undefined ? "3px 0 0 0" :
      pos.top !== undefined && pos.right !== undefined ? "0 3px 0 0" :
      pos.bottom !== undefined && pos.left !== undefined ? "0 0 0 3px" : "0 0 3px 0",
  });
  const pad = Math.round(size * 0.16);
  return (
    <div style={{ position: "relative", display: "inline-flex", padding: pad }}>
      <div style={bracket({ top: 0, left: 0 })} />
      <div style={bracket({ top: 0, right: 0 })} />
      <div style={bracket({ bottom: 0, left: 0 })} />
      <div style={bracket({ bottom: 0, right: 0 })} />
      <div style={{ width: size, height: size, backgroundColor: "#fff", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <QrCode size={size * 0.65} color={color} />
      </div>
    </div>
  );
};

const FrontFace = ({ location, businessName }) => {
  const line1 = "Approach your phone to the card";
  const line2 = "Tap to leave a review";
  const textColor = getContrast(location.cardColor);

  return (
    <>
      {/* NFC icon */}
      <div className="absolute top-3 right-3 opacity-30 z-20">
        <NfcSvg size={20} />
      </div>

      {/* Platform icon */}
      {location.platform && PLATFORM_ICONS[location.platform] && (
        <div className="absolute bottom-3 right-3 opacity-70 z-20">
          {PLATFORM_ICONS[location.platform](18, textColor)}
        </div>
      )}

      {/* Content */}
      <div className="h-full flex flex-col justify-center gap-3 relative z-10 p-5">
        <div>
          <p className="font-bold text-base leading-tight truncate">{businessName}</p>
          <StarsRow size={14} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5" style={{ lineHeight: 1 }}>
            <Check size={12} strokeWidth={2} className="shrink-0 opacity-80" />
            <span className="text-xs opacity-90">{line1}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ lineHeight: 1 }}>
            <Check size={12} strokeWidth={2} className="shrink-0 opacity-80" />
            <span className="text-xs opacity-90">{line2}</span>
          </div>
        </div>
        <p className="text-xs font-medium opacity-70">Powered by Opinoor</p>
      </div>
    </>
  );
};

const BackFace = ({ location, businessName }) => {
  const line1 = "Scan the QR code with your camera";
  const line2 = "No app needed";
  const textColor = getContrast(location.cardColor);

  return (
    <>
      {/* Platform icon */}
      {location.platform && PLATFORM_ICONS[location.platform] && (
        <div className="absolute bottom-3 right-3 opacity-70 z-20">
          {PLATFORM_ICONS[location.platform](18, textColor)}
        </div>
      )}

      {/* Content */}
      <div className="h-full flex flex-col items-center justify-center gap-3 relative z-10 p-5">
        <div className="flex flex-row items-center gap-4">
          <QrPlaceholder size={72} />
          <div className="flex flex-col items-center gap-1">
            <p className="text-center font-bold text-sm leading-tight truncate max-w-[100px]">{businessName}</p>
            <StarsRow size={11} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5" style={{ lineHeight: 1 }}>
            <Check size={11} strokeWidth={2} className="shrink-0 opacity-80" />
            <span className="text-xs opacity-80">{line1}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ lineHeight: 1 }}>
            <Check size={11} strokeWidth={2} className="shrink-0 opacity-80" />
            <span className="text-xs opacity-80">{line2}</span>
          </div>
        </div>
        <p className="text-[10px] font-medium opacity-70">Powered by Opinoor</p>
      </div>
    </>
  );
};

export const CardPreview = ({ location, label }) => {
  const [side, setSide] = useState("front");
  const textColor = getContrast(location.cardColor);
  const businessName =
    location.data.businessName ||
    location.data.handle ||
    location.data.url ||
    "Your Business";

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Side toggle — same style as customize page */}
      <div className="flex overflow-hidden rounded-lg border border-neutral-700 text-sm w-fit">
        <button
          onClick={() => setSide("front")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${side === "front" ? "bg-primary text-primary-foreground" : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"}`}
        >
          Front
        </button>
        <button
          onClick={() => setSide("back")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${side === "back" ? "bg-primary text-primary-foreground" : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"}`}
        >
          Back
        </button>
      </div>

      {label && (
        <span className="text-xs uppercase tracking-wider text-neutral-400">{label}</span>
      )}

      {/* Card */}
      <div
        className="aspect-[1.6/1] rounded-xl overflow-hidden shadow-2xl relative w-full max-w-[340px] transition-colors duration-300"
        style={{ background: location.cardColor, color: textColor }}
      >
        {side === "front"
          ? <FrontFace location={location} businessName={businessName} />
          : <BackFace  location={location} businessName={businessName} />
        }
      </div>
    </div>
  );
};
