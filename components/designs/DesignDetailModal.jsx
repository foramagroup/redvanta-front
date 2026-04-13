"use client";

import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Pencil, RefreshCw, Star, Check, QrCode, Move } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

// ─── Constants (miroir de Customize.tsx) ─────────────────────
const STATUS_CONFIG = {
  active:   { label: "Active",   className: "bg-green-500/15 text-green-400 border-green-500/30" },
  draft:    { label: "Draft",    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  archived: { label: "Archived", className: "bg-muted/50 text-muted-foreground border-border/50" },
};

const LETTER_SPACING_MAP = {
  tight:  "-0.025em",
  normal: "0em",
  wide:   "0.05em",
  wider:  "0.1em",
};

const TEXT_SHADOW_MAP = {
  none:    undefined,
  subtle:  "0 1px 2px rgba(0,0,0,0.3)",
  medium:  "0 2px 4px rgba(0,0,0,0.5)",
  strong:  "0 2px 8px rgba(0,0,0,0.7)",
  outline: "-1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6), 1px 1px 0 rgba(0,0,0,0.6)",
};

// Pattern correspondance templateName → pattern SVG id
const CARD_TEMPLATES = [
  { id: "crimson-noir",     pattern: "none"          },
  { id: "midnight-gold",    pattern: "none"          },
  { id: "arctic-fire",      pattern: "none"          },
  { id: "emerald-dark",     pattern: "none"          },
  { id: "royal-plum",       pattern: "none"          },
  { id: "sunset-blaze",     pattern: "none"          },
  { id: "geo-obsidian",     pattern: "geometric"     },
  { id: "geo-ruby",         pattern: "geometric"     },
  { id: "glass-frost",      pattern: "glassmorphism" },
  { id: "glass-rose",       pattern: "glassmorphism" },
  { id: "metal-silver",     pattern: "metallic"      },
  { id: "metal-gold",       pattern: "metallic"      },
  { id: "pinstripe-navy",   pattern: "diagonal-lines"},
  { id: "pinstripe-charcoal",pattern:"diagonal-lines"},
  { id: "dot-luxe",         pattern: "dots"          },
  { id: "diamond-sapphire", pattern: "diamonds"      },
  { id: "chevron-titanium", pattern: "chevrons"      },
  { id: "crosshatch-noir",  pattern: "crosshatch"    },
  { id: "hex-cyber",        pattern: "hexagons"      },
  { id: "circuit-neon",     pattern: "circuit"       },
  { id: "wave-ocean",       pattern: "waves"         },
  { id: "citrus-burst",     pattern: "triangles"     },
  { id: "clean-tangerine",  pattern: "none"          },
  { id: "sunflower-pop",    pattern: "confetti"      },
  { id: "electric-coral",   pattern: "zigzag"        },
  { id: "mint-fresh",       pattern: "none"          },
  { id: "mosaic-rainbow",   pattern: "mosaic"        },
  { id: "corporate-sky",    pattern: "none"          },
  { id: "sunburst-gold",    pattern: "sunburst"      },
  { id: "tropical-vibes",   pattern: "waves"         },
  { id: "blush-minimal",    pattern: "dots"          },
  { id: "neon-matrix",      pattern: "circuit"       },
  { id: "lavender-dream",   pattern: "none"          },
  { id: "onyx-orbit",       pattern: "circle-tl-br"  },
  { id: "ivory-flame",      pattern: "circle-tr-bl"  },
  { id: "deep-ocean",       pattern: "arc-top"       },
  { id: "velvet-noir",      pattern: "blob-corners"  },
  { id: "aurora-mint",      pattern: "half-moon-right"},
  { id: "magma-split",      pattern: "quarter-circles"},
  { id: "cosmic-purple",    pattern: "bubble-cluster" },
  { id: "zen-wave",         pattern: "swoosh"        },
  { id: "rose-petal",       pattern: "petal"         },
  { id: "midnight-arc",     pattern: "arc-bottom"    },
  { id: "material-light",   pattern: "none"          },
  { id: "material-blue",    pattern: "none"          },
  { id: "material-rose",    pattern: "none"          },
  { id: "blob-ocean",       pattern: "dots"          },
  { id: "blob-coral",       pattern: "dots"          },
  { id: "blob-jungle",      pattern: "dots"          },
  { id: "memphis-google",   pattern: "confetti"      },
  { id: "memphis-party",    pattern: "confetti"      },
  { id: "memphis-pop",      pattern: "zigzag"        },
  { id: "geo-corporate",    pattern: "geometric"     },
  { id: "geo-travel",       pattern: "geometric"     },
  { id: "geo-navy",         pattern: "geometric"     },
  { id: "poly-prism",       pattern: "triangles"     },
  { id: "poly-tech",        pattern: "triangles"     },
  { id: "poly-nature",      pattern: "triangles"     },
  { id: "luxury-gold",      pattern: "none"          },
  { id: "luxury-noir",      pattern: "none"          },
  { id: "luxury-blush",     pattern: "none"          },
  { id: "neon-tiktok",      pattern: "circuit"       },
  { id: "neon-blue",        pattern: "circuit"       },
  { id: "neon-purple",      pattern: "circuit"       },
  { id: "glass-google",     pattern: "glassmorphism" },
  { id: "glass-travel",     pattern: "glassmorphism" },
  { id: "glass-dark",       pattern: "glassmorphism" },
  { id: "layer-google",     pattern: "chevrons"      },
  { id: "layer-booking",    pattern: "chevrons"      },
  { id: "layer-airbnb",     pattern: "chevrons"      },
];

// ─── PatternOverlay (miroir exact de Customize.tsx) ───────────
function PatternOverlay({ pattern, color = "rgba(255,255,255,0.06)" }) {
  if (!pattern || pattern === "none") return null;

  const map = {
    geometric: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="geo" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="20" height="20" fill="none" stroke={color} strokeWidth="0.5" transform="rotate(45 20 20)"/>
          <circle cx="20" cy="20" r="2" fill={color}/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#geo)"/>
      </svg>
    ),
    "diagonal-lines": (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="diag" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke={color} strokeWidth="1"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#diag)"/>
      </svg>
    ),
    dots: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="1.2" fill={color}/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>
    ),
    hexagons: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="hex" x="0" y="0" width="28" height="49" patternUnits="userSpaceOnUse">
          <polygon points="14,2 25,10 25,24 14,32 3,24 3,10" fill="none" stroke={color} strokeWidth="0.6"/>
          <polygon points="14,19 25,27 25,41 14,49 3,41 3,27" fill="none" stroke={color} strokeWidth="0.6"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#hex)"/>
      </svg>
    ),
    glassmorphism: (
      <div className="absolute inset-0">
        <div className="absolute inset-0 backdrop-blur-sm"/>
        <div className="absolute top-[15%] left-[10%] w-[45%] h-[45%] rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent)" }}/>
        <div className="absolute bottom-[10%] right-[5%] w-[35%] h-[35%] rounded-full opacity-15" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent)" }}/>
      </div>
    ),
    metallic: (
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)" }}/>
      </div>
    ),
    waves: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="wave" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
          <path d="M0 15 Q15 0 30 15 Q45 30 60 15" fill="none" stroke={color} strokeWidth="0.8"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#wave)"/>
      </svg>
    ),
    circuit: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="circ" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 H15 V10 H25 V30 H40" fill="none" stroke={color} strokeWidth="0.7"/>
          <circle cx="15" cy="20" r="2" fill={color}/><circle cx="25" cy="10" r="2" fill={color}/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#circ)"/>
      </svg>
    ),
    chevrons: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="chev" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <polyline points="0,12 12,0 24,12" fill="none" stroke={color} strokeWidth="0.6"/>
          <polyline points="0,24 12,12 24,24" fill="none" stroke={color} strokeWidth="0.6"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#chev)"/>
      </svg>
    ),
    diamonds: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="dia" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <polygon points="12,0 24,12 12,24 0,12" fill="none" stroke={color} strokeWidth="0.6"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#dia)"/>
      </svg>
    ),
    crosshatch: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="cross" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="12" y2="12" stroke={color} strokeWidth="0.5"/>
          <line x1="12" y1="0" x2="0" y2="12" stroke={color} strokeWidth="0.5"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#cross)"/>
      </svg>
    ),
    triangles: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="tri" x="0" y="0" width="30" height="26" patternUnits="userSpaceOnUse">
          <polygon points="15,0 30,26 0,26" fill="none" stroke={color} strokeWidth="0.6"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#tri)"/>
      </svg>
    ),
    confetti: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="conf" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="5" y="3" width="4" height="4" fill={color} transform="rotate(30 7 5)"/>
          <circle cx="25" cy="15" r="2" fill={color}/>
          <rect x="35" y="28" width="3" height="6" fill={color} transform="rotate(-20 36 31)"/>
          <circle cx="12" cy="32" r="1.5" fill={color}/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#conf)"/>
      </svg>
    ),
    zigzag: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="zz" x="0" y="0" width="20" height="16" patternUnits="userSpaceOnUse">
          <polyline points="0,8 5,0 10,8 15,0 20,8" fill="none" stroke={color} strokeWidth="0.7"/>
          <polyline points="0,16 5,8 10,16 15,8 20,16" fill="none" stroke={color} strokeWidth="0.7"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#zz)"/>
      </svg>
    ),
    mosaic: (
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="mos" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="11" height="11" fill={color} rx="1"/>
          <rect x="13" y="13" width="11" height="11" fill={color} rx="1"/>
          <rect x="13" y="0" width="11" height="5" fill={color} opacity="0.5" rx="1"/>
          <rect x="0" y="13" width="5" height="11" fill={color} opacity="0.5" rx="1"/>
        </pattern></defs><rect width="100%" height="100%" fill="url(#mos)"/>
      </svg>
    ),
    sunburst: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: `repeating-conic-gradient(from 0deg, ${color} 0deg 10deg, transparent 10deg 20deg)`, opacity: 0.15 }}/>
      </div>
    ),
    "circle-tl-br": (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-30%", left: "-20%", width: "65%", height: "90%", borderRadius: "50%", background: color, opacity: 0.25 }}/>
        <div className="absolute" style={{ bottom: "-30%", right: "-20%", width: "65%", height: "90%", borderRadius: "50%", background: color, opacity: 0.25 }}/>
      </div>
    ),
    "circle-tr-bl": (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-30%", right: "-20%", width: "65%", height: "90%", borderRadius: "50%", background: color, opacity: 0.25 }}/>
        <div className="absolute" style={{ bottom: "-30%", left: "-20%", width: "65%", height: "90%", borderRadius: "50%", background: color, opacity: 0.25 }}/>
      </div>
    ),
    "arc-top": (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-60%", left: "10%", width: "80%", height: "100%", borderRadius: "50%", background: color, opacity: 0.2 }}/>
        <div className="absolute" style={{ bottom: "-75%", right: "-10%", width: "50%", height: "90%", borderRadius: "50%", border: `2px solid ${color}`, opacity: 0.15 }}/>
      </div>
    ),
    "arc-bottom": (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ bottom: "-55%", left: "-10%", width: "120%", height: "100%", borderRadius: "50%", background: color, opacity: 0.18 }}/>
      </div>
    ),
    "blob-corners": (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-15%", left: "-10%", width: "40%", height: "55%", borderRadius: "50% 50% 50% 20%", background: color, opacity: 0.22 }}/>
        <div className="absolute" style={{ bottom: "-15%", right: "-10%", width: "45%", height: "55%", borderRadius: "20% 50% 50% 50%", background: color, opacity: 0.22 }}/>
      </div>
    ),
    "half-moon-right": (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-10%", right: "-35%", width: "70%", height: "120%", borderRadius: "50%", background: color, opacity: 0.2 }}/>
      </div>
    ),
    "quarter-circles": (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: 0, left: 0, width: "40%", height: "50%", borderRadius: "0 0 100% 0", background: color, opacity: 0.2 }}/>
        <div className="absolute" style={{ bottom: 0, right: 0, width: "35%", height: "45%", borderRadius: "100% 0 0 0", background: color, opacity: 0.2 }}/>
      </div>
    ),
    "bubble-cluster": (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-10%", right: "5%", width: "30%", height: "42%", borderRadius: "50%", background: color, opacity: 0.2 }}/>
        <div className="absolute" style={{ top: "10%", right: "22%", width: "18%", height: "26%", borderRadius: "50%", background: color, opacity: 0.15 }}/>
        <div className="absolute" style={{ bottom: "5%", left: "8%", width: "22%", height: "32%", borderRadius: "50%", background: color, opacity: 0.18 }}/>
      </div>
    ),
    swoosh: (
      <svg className="absolute inset-0 w-full h-full overflow-hidden" viewBox="0 0 400 250" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-50,200 Q100,100 200,180 Q300,260 450,120" fill="none" stroke={color} strokeWidth="40" opacity="0.15" strokeLinecap="round"/>
      </svg>
    ),
    petal: (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "-20%", left: "-15%", width: "55%", height: "70%", borderRadius: "0 70% 70% 0", background: color, opacity: 0.18, transform: "rotate(-15deg)" }}/>
        <div className="absolute" style={{ bottom: "-20%", right: "-15%", width: "50%", height: "65%", borderRadius: "70% 0 0 70%", background: color, opacity: 0.18, transform: "rotate(-15deg)" }}/>
      </div>
    ),
  };

  return <>{map[pattern] ?? null}</>;
}

// ─── Stars ────────────────────────────────────────────────────
function StarsRow({ color = "#FBBF24", size = 12 }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} fill={color} stroke="none" />
      ))}
    </div>
  );
}

// ─── Google Icon SVG ──────────────────────────────────────────
function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── FaithfulCardPreview ──────────────────────────────────────
// Reproduit fidèlement le rendu de Customize.tsx
// Props directement issues du design formaté par formatDesign()
function FaithfulCardPreview({ design, side }) {
  // Résoudre le pattern depuis templateName
  const tpl       = CARD_TEMPLATES.find((t) => t.id === design.templateName);
  const pattern   = tpl?.pattern ?? "none";

  // Résoudre les offsets sauvegardés
  const savedOffsets = design.elementOffsets
    ? (design.elementOffsets?.[design.orientation]?.[side] ?? {})
    : {};
  const offset = (key) => {
    const o = savedOffsets[key];
    return o ? { transform: `translate(${o.x}px, ${o.y}px)` } : undefined;
  };

  // Helpers typo
  const nameSpacing   = LETTER_SPACING_MAP[design.businessFontSpacing?.toLowerCase()]   ?? "0em";
  const sloganSpacing = LETTER_SPACING_MAP[design.sloganFontSpacing?.toLowerCase()]     ?? "0em";
  const instrSpacing  = LETTER_SPACING_MAP[design.instrFontSpacing?.toLowerCase()]      ?? "0em";
  const shadowStyle   = TEXT_SHADOW_MAP[design.textShadow?.toLowerCase()] ?? undefined;

  const isLandscape   = design.orientation === "landscape";
  const aspectClass   = isLandscape ? "aspect-[1.6/1]" : "aspect-[1/1.6]";
  const colorMode     = design.colorMode ?? "template";

  // Styles de fond
  const bgStyle = colorMode === "single"
    ? { background: design.bgColor, color: design.textColor }
    : { background: `linear-gradient(160deg, ${design.gradient1} 0%, ${design.gradient2} 70%)`, color: design.textColor };

  const bgStyleBack = colorMode === "single"
    ? { background: design.bgColor, color: design.textColor }
    : { background: `linear-gradient(160deg, ${design.gradient2} 0%, ${design.gradient1} 100%)`, color: design.textColor };

  // Styles typo
  const nameStyle = {
    fontSize:      `${design.businessFontSize ?? 16}px`,
    fontFamily:    design.businessFont,
    fontWeight:    design.businessFontWeight ?? "700",
    letterSpacing: nameSpacing,
    textTransform: design.businessTextTransform !== "none" ? design.businessTextTransform : undefined,
    lineHeight:    design.businessLineHeight ?? "1.2",
    textAlign:     design.businessAlign ?? "left",
    textShadow:    shadowStyle,
  };
  const sloganStyle = {
    fontSize:      `${design.sloganFontSize ?? 12}px`,
    fontFamily:    design.sloganFont,
    fontWeight:    design.sloganFontWeight ?? "400",
    letterSpacing: sloganSpacing,
    textTransform: design.sloganTextTransform !== "none" ? design.sloganTextTransform : undefined,
    lineHeight:    design.sloganLineHeight ?? "1.4",
    textAlign:     design.sloganAlign ?? "left",
    textShadow:    shadowStyle,
    opacity:       0.7,
  };
  const instrStyle = {
    fontSize:      `${design.instrFontSize ?? 10}px`,
    fontFamily:    design.instrFont,
    fontWeight:    design.instrFontWeight ?? "400",
    letterSpacing: instrSpacing,
    lineHeight:    design.instrLineHeight ?? "1.4",
    textShadow:    shadowStyle,
    opacity:       0.9,
  };

  const bandHeight    = side === "front" ? (design.frontBandHeight ?? 22) : (design.backBandHeight ?? 12);
  const bandPosition  = design.bandPosition ?? "bottom";
  const showBand      = colorMode === "template" && bandPosition !== "hidden";
  const bandStyle     = {
    height:     `${bandHeight}%`,
    background: `linear-gradient(90deg, ${design.accentBand1} 0%, ${design.accentBand2} 100%)`,
    opacity:    0.9,
  };

  const instrJustify = design.instrAlign === "center"
    ? "justify-center"
    : design.instrAlign === "right"
    ? "justify-end"
    : "justify-start";

  const qrSize    = design.qrCodeSize  ?? 80;
  const logoSize  = design.logoSize    ?? 32;
  const nfcSize   = design.nfcIconSize ?? 24;
  const gIconSize = design.googleLogoSize ?? 20;

  // Logo image
  const resolvedLogoUrl = design.logoUrl?.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}${design.logoUrl}`
    : design.logoUrl;

  const logoImg = resolvedLogoUrl ? (
    <img
      src={resolvedLogoUrl}
      alt="Logo"
      draggable={false}
      className="w-auto object-contain"
      style={{ height: `${logoSize}px` }}
    />
  ) : null;

  // ── FRONT ──────────────────────────────────────────────────
  if (side === "front") {
    const isLogoLeft = (design.logoPosition ?? "left") === "left";

    const businessBlock = (
      <div style={{ textAlign: design.businessAlign ?? "left" }}>
        <p style={nameStyle}>{design.businessName || "Business Name"}</p>
        {design.slogan && <p style={sloganStyle} className="mt-1">{design.slogan}</p>}
        <StarsRow color={design.starColor ?? "#FBBF24"} size={isLandscape ? 14 : 12} />
      </div>
    );

    const instructionsBlock = (
      <div className="space-y-1.5">
        {design.frontInstruction1 && (
          <div className={`flex items-center gap-1.5 ${instrJustify}`}>
            <Check size={12} strokeWidth={design.checkStrokeWidth ?? 3.5} className="shrink-0" style={{ color: design.iconsColor ?? "#22C55E" }} />
            <span style={instrStyle}>{design.frontInstruction1}</span>
          </div>
        )}
        {design.frontInstruction2 && (
          <div className={`flex items-center gap-1.5 ${instrJustify}`}>
            <Check size={12} strokeWidth={design.checkStrokeWidth ?? 3.5} className="shrink-0" style={{ color: design.iconsColor ?? "#22C55E" }} />
            <span style={instrStyle}>{design.frontInstruction2}</span>
          </div>
        )}
      </div>
    );

    const ctaBlock = (
      <div style={{ paddingTop: `${design.ctaPaddingTop ?? 8}px` }}>
        <p className="text-xs font-medium opacity-80" style={{ textShadow: shadowStyle }}>
          {design.callToAction || "Powered by RedVanta"}
        </p>
      </div>
    );

    return (
      <div className={`${aspectClass} rounded-xl overflow-hidden shadow-2xl relative`} style={bgStyle}>
        {colorMode === "template" && <PatternOverlay pattern={pattern} />}

        {/* NFC icon */}
        {(design.showNfcIcon ?? true) && (
          <div className="absolute top-3 right-3 opacity-30 z-20" style={offset("nfcIcon")}>
            <svg width={nfcSize} height={nfcSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/>
              <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/>
              <path d="M12.91 4.1a16.09 16.09 0 0 1 0 15.8"/>
            </svg>
          </div>
        )}

        {/* Google icon */}
        {(design.showGoogleIcon ?? true) && (
          <div className="absolute bottom-3 right-3 opacity-60 z-20" style={offset("googleIcon")}>
            <GoogleIcon size={gIconSize} />
          </div>
        )}

        {/* Main content */}
        <div className="h-full flex flex-col justify-center gap-3 relative z-10 p-5">
          {isLandscape ? (
            <>
              {/* Landscape : logo + business side by side */}
              <div className={`flex items-center gap-1.5 w-full ${isLogoLeft ? "flex-row" : "flex-row-reverse"}`}>
                {logoImg && (
                  <div className="shrink-0" style={offset("logo")}>{logoImg}</div>
                )}
                <div className="flex-1" style={offset("businessInfo")}>{businessBlock}</div>
              </div>
              <div style={offset("instructions")}>{instructionsBlock}</div>
              <div style={offset("cta")}>{ctaBlock}</div>
            </>
          ) : (
            <>
              {/* Portrait : logo top-center optionnel */}
              {logoImg && design.logoPosition === "top-center" && (
                <div className="flex justify-center" style={offset("logo")}>{logoImg}</div>
              )}
              <div style={offset("businessInfo")}>{businessBlock}</div>
              <div style={offset("instructions")}>{instructionsBlock}</div>
              {logoImg && design.logoPosition === "bottom-center" && (
                <div className="mt-1 flex justify-center" style={offset("logo")}>{logoImg}</div>
              )}
              <div style={offset("cta")}>{ctaBlock}</div>
            </>
          )}
        </div>

        {/* Accent band */}
        {showBand && (
          <div
            className={`absolute left-0 right-0 ${bandPosition === "top" ? "top-0" : "bottom-0"}`}
            style={bandStyle}
          />
        )}
      </div>
    );
  }

  // ── BACK ───────────────────────────────────────────────────
  const qrEl = (
    <div
      className="rounded-lg flex items-center justify-center shrink-0"
      style={{
        height:          `${qrSize}px`,
        width:           `${qrSize}px`,
        backgroundColor: (design.accentColor ?? "#E10600") + "18",
        border:          `1px solid ${design.accentColor ?? "#E10600"}33`,
      }}
    >
      <QrCode size={Math.round(qrSize * 0.6)} style={{ color: design.accentColor ?? "#E10600" }} />
    </div>
  );

  const qrPos      = design.qrCodeStyle ?? "top";
  const isQrHoriz  = qrPos === "left" || qrPos === "right";
  const isQrFirst  = qrPos === "left" || qrPos === "top";

  const backBizBlock = (
    <div className="flex flex-col items-center gap-1">
      <p className="text-center" style={{ ...nameStyle, fontSize: `${Math.max((design.businessFontSize ?? 16) - 4, 8)}px` }}>
        {design.businessName || "Business Name"}
      </p>
      {design.slogan && (
        <p className="opacity-70 text-center" style={{ ...sloganStyle, fontSize: `${Math.max((design.sloganFontSize ?? 12) - 2, 7)}px` }}>
          {design.slogan}
        </p>
      )}
      <StarsRow color={design.starColor ?? "#FBBF24"} size={11} />
    </div>
  );

  const backInstrBlock = (
    <div className="flex flex-col items-center gap-1.5">
      {design.backInstruction1 && (
        <div className={`flex items-center gap-1.5 ${instrJustify}`}>
          <Check size={11} strokeWidth={design.checkStrokeWidth ?? 3.5} className="shrink-0" style={{ color: design.iconsColor ?? "#22C55E" }} />
          <span style={{ ...instrStyle, fontSize: `${Math.max((design.instrFontSize ?? 10) - 1, 7)}px` }}>
            {design.backInstruction1}
          </span>
        </div>
      )}
      {design.backInstruction2 && (
        <div className={`flex items-center gap-1.5 ${instrJustify}`}>
          <Check size={11} strokeWidth={design.checkStrokeWidth ?? 3.5} className="shrink-0" style={{ color: design.iconsColor ?? "#22C55E" }} />
          <span style={{ ...instrStyle, fontSize: `${Math.max((design.instrFontSize ?? 10) - 1, 7)}px` }}>
            {design.backInstruction2}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${aspectClass} rounded-xl overflow-hidden shadow-2xl relative`} style={bgStyleBack}>
      {colorMode === "template" && <PatternOverlay pattern={pattern} />}

      {/* Google icon */}
      {(design.showGoogleIcon ?? true) && (
        <div className="absolute bottom-3 right-3 opacity-60 z-20" style={offset("googleIcon")}>
          <GoogleIcon size={gIconSize} />
        </div>
      )}

      <div className="h-full flex flex-col items-center justify-center gap-4 relative z-10 p-5">
        <div className={`flex ${isQrHoriz ? "flex-row" : "flex-col"} items-center gap-3`}>
          {isQrFirst && <div style={offset("qrCode")}>{qrEl}</div>}
          <div style={offset("businessInfo")}>{backBizBlock}</div>
          {!isQrFirst && <div style={offset("qrCode")}>{qrEl}</div>}
        </div>
        <div style={offset("instructions")}>{backInstrBlock}</div>
        <div style={offset("cta")}>
          <p className="text-[10px] font-medium opacity-70" style={{ textShadow: shadowStyle }}>
            {design.callToAction || "Powered by RedVanta"}
          </p>
        </div>
      </div>

      {/* Accent band */}
      {showBand && (
        <div
          className={`absolute left-0 right-0 ${bandPosition === "top" ? "top-0" : "bottom-0"}`}
          style={bandStyle}
        />
      )}
    </div>
  );
}

// ─── PrintReadyPage — version fidèle pour PDF ─────────────────
// Reprend les mêmes données visuelles mais dans un layout A4/print
function PrintReadyPage({ design, side, previewRef }) {
  const tpl     = CARD_TEMPLATES.find((t) => t.id === design?.templateName);
  const pattern = tpl?.pattern ?? "none";
  const isLandscape = design?.orientation === "landscape";

  const cardW = isLandscape ? 408 : 257;
  const cardH = isLandscape ? 257 : 408;

  const pageTitle   = side === "front" ? "RECTO (Front)" : "VERSO (Back)";
  const footerLabel = side === "front" ? "RECTO" : "VERSO";

  const g1 = side === "front" ? (design?.gradient1 ?? "#0D0D0D") : (design?.gradient2 ?? "#1A1A1A");
  const g2 = side === "front" ? (design?.gradient2 ?? "#1A1A1A") : (design?.gradient1 ?? "#0D0D0D");

  const instr1 = side === "front" ? design?.frontInstruction1 : design?.backInstruction1;
  const instr2 = side === "front" ? design?.frontInstruction2 : design?.backInstruction2;

  return (
    <div
      ref={previewRef}
      style={{
        width: "1000px",
        minHeight: "760px",
        background: "#ffffff",
        color: "#111111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "72px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "26px", fontWeight: 700, marginBottom: "8px" }}>{pageTitle}</div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {design?.businessName} · 85.6mm × 54.0mm · Print-ready
        </div>
      </div>

      <div style={{ border: "2px dashed #d1d5db", padding: "8px", borderRadius: "12px" }}>
        <div
          style={{
            width:        `${cardW}px`,
            height:       `${cardH}px`,
            borderRadius: "16px",
            background:   `linear-gradient(160deg, ${g1} 0%, ${g2} 70%)`,
            display:      "flex",
            flexDirection: "column",
            alignItems:   "center",
            justifyContent: "center",
            textAlign:    "center",
            padding:      "28px",
            boxSizing:    "border-box",
            position:     "relative",
            overflow:     "hidden",
          }}
        >
          {side === "front" && (
            <div style={{ fontSize: "22px", color: design?.starColor ?? "#fbbf24", marginBottom: "14px", letterSpacing: "2px" }}>
              ★★★★★
            </div>
          )}

          <div style={{
            fontSize:   `${design?.businessFontSize ?? 16}px`,
            fontWeight: design?.businessFontWeight ?? "700",
            color:      design?.textColor ?? "#FFFFFF",
            marginBottom: "8px",
          }}>
            {design?.businessName || "Business Name"}
          </div>

          {design?.slogan && (
            <div style={{ fontSize: `${design?.sloganFontSize ?? 12}px`, color: design?.textColor ?? "#FFFFFF", opacity: 0.7, marginBottom: "12px" }}>
              {design.slogan}
            </div>
          )}

          {(instr1 || instr2) && (
            <div style={{ marginTop: "8px", textAlign: "left" }}>
              {instr1 && (
                <div style={{ fontSize: `${design?.instrFontSize ?? 10}px`, color: design?.textColor ?? "#FFFFFF", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: design?.iconsColor ?? "#22C55E" }}>✓</span> {instr1}
                </div>
              )}
              {instr2 && (
                <div style={{ fontSize: `${design?.instrFontSize ?? 10}px`, color: design?.textColor ?? "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: design?.iconsColor ?? "#22C55E" }}>✓</span> {instr2}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: "auto", fontSize: "10px", color: design?.textColor ?? "#FFFFFF", opacity: 0.55 }}>
            {design?.callToAction || "Powered by RedVanta"} · {footerLabel}
          </div>

          {/* Bande accent */}
          {design?.bandPosition !== "hidden" && design?.colorMode === "template" && (
            <div style={{
              position:   "absolute",
              left:       0, right: 0,
              [design?.bandPosition === "top" ? "top" : "bottom"]: 0,
              height:     `${side === "front" ? (design?.frontBandHeight ?? 22) : (design?.backBandHeight ?? 12)}%`,
              background: `linear-gradient(90deg, ${design?.accentBand1 ?? "#E10600"} 0%, ${design?.accentBand2 ?? "#FF4444"} 100%)`,
              opacity:    0.9,
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DesignDetailModal — export principal ─────────────────────
export default function DesignDetailModal({
  design,
  onClose,
  onEdit,
  onDownloadCardExport,
  onRegenerateCard,
  cardActionLoading = false,
}) {
  const [previewSide, setPreviewSide] = useState("front");
  const [isGenerating, setIsGenerating] = useState(false);
  const frontPreviewRef = useRef(null);
  const backPreviewRef  = useRef(null);

  const status = STATUS_CONFIG[design?.status] ?? STATUS_CONFIG.draft;

  const handleClose = () => { setPreviewSide("front"); onClose(); };
  const handleEdit  = () => { setPreviewSide("front"); onEdit?.(design); };

  const handleDownloadPdf = async () => {
    if (!design || !frontPreviewRef.current || !backPreviewRef.current) return;
    setIsGenerating(true);
    try {
      const frontCanvas = await html2canvas(frontPreviewRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      const backCanvas  = await html2canvas(backPreviewRef.current,  { backgroundColor: "#ffffff", scale: 2, useCORS: true });

      const w = frontCanvas.width, h = frontCanvas.height;
      const pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "px", format: [w, h] });
      pdf.addImage(frontCanvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.addPage([backCanvas.width, backCanvas.height], backCanvas.width > backCanvas.height ? "landscape" : "portrait");
      pdf.addImage(backCanvas.toDataURL("image/png"), "PNG", 0, 0, backCanvas.width, backCanvas.height);
      pdf.save(`${design.name || "design"}.pdf`);
    } catch {
      toast({ title: "Download failed", description: "Unable to generate the PDF file.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={Boolean(design)} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{design?.name}</DialogTitle>
          <DialogDescription>{design?.businessName} · {design?.template}</DialogDescription>
        </DialogHeader>

        {design && (
          <div className="space-y-4">
            {/* ── Barre d'actions (inchangée) ─────────────────── */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex rounded-lg border border-border/50 bg-secondary/40 p-1">
                {["front", "back"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPreviewSide(s)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                      previewSide === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "front" ? "Recto" : "Verso"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {design?.primaryCardUid && onRegenerateCard && (
                  <Button variant="outline" onClick={() => onRegenerateCard(design)} disabled={cardActionLoading} className="gap-2">
                    <RefreshCw size={14} className={cardActionLoading ? "animate-spin" : ""} />
                    {cardActionLoading ? "Regenerating..." : "Regenerate"}
                  </Button>
                )}
                {design?.primaryCardUid && onDownloadCardExport && (
                  <Button variant="outline" onClick={() => onDownloadCardExport(design, "pdf")} className="gap-2">
                    <Download size={14} /> Card Export
                  </Button>
                )}
                <Button variant="outline" onClick={handleDownloadPdf} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>

            {/* ── Carte NFC liée (inchangé) ───────────────────── */}
            {design?.primaryCardUid && (
              <div className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                API linked card: <span className="font-medium text-foreground">{design.primaryCardUid}</span>
              </div>
            )}

            {/* ── RENDU FIDÈLE ─────────────────────────────────── */}
            <FaithfulCardPreview design={design} side={previewSide} />

            {/* ── Détails (inchangés) ─────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Model</span><p className="font-medium">{design.model}</p></div>
              <div><span className="text-muted-foreground text-xs">Orientation</span><p className="font-medium capitalize">{design.orientation}</p></div>
              <div><span className="text-muted-foreground text-xs">Status</span><Badge variant="outline" className={status.className}>{status.label}</Badge></div>
              <div><span className="text-muted-foreground text-xs">Linked Card</span><p className="font-medium">{design.linkedCard || "—"}</p></div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs">Front Instructions</span>
                <p className="text-xs">{[design.frontInstruction1, design.frontInstruction2].filter(Boolean).join(" · ") || "—"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs">Back Instructions</span>
                <p className="text-xs">{[design.backInstruction1, design.backInstruction2].filter(Boolean).join(" · ") || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer (inchangé) ───────────────────────────────── */}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>Close</Button>
          <Button onClick={handleEdit} className="gap-2">
            <Pencil size={14} /> Edit Design
          </Button>
        </DialogFooter>

        {/* ── Pages print pour PDF (hors écran) ──────────────── */}
        {design && (
          <div className="pointer-events-none absolute -left-[9999px] top-0 w-[1000px]">
            <PrintReadyPage design={design} side="front" previewRef={frontPreviewRef} />
            <div className="h-8" />
            <PrintReadyPage design={design} side="back" previewRef={backPreviewRef} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}