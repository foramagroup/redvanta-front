"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import SharedCardPreview from "@/components/designs/SharedCardPreview";

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
    <div style={{ display: "flex", gap: "2px", marginTop: "10px", alignItems: "center", lineHeight: 1 }}>
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
  const colorMode     = design.colorMode ?? "template";

  // Styles de fond
  const bgStyle = colorMode === "single"
    ? { background: design.bgColor, color: design.textColor }
    : { background: `linear-gradient(160deg, ${design.gradient1} 0%, ${design.gradient2} 70%)`, color: design.textColor };

  const bgStyleBack = colorMode === "single"
    ? { background: design.bgColor, color: design.textColor }
    : { background: `linear-gradient(160deg, ${design.gradient2} 0%, ${design.gradient1} 100%)`, color: design.textColor };

  const cardBaseStyle = {
    ...((side === "front" ? bgStyle : bgStyleBack) || {}),
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.28)",
    width: "100%",
    aspectRatio: isLandscape ? "1.6 / 1" : "1 / 1.6",
  };

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

  const justifyContent = design.instrAlign === "center"
    ? "center"
    : design.instrAlign === "right"
    ? "flex-end"
    : "flex-start";

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
      style={{ height: `${logoSize}px`, width: "auto", objectFit: "contain", display: "block" }}
    />
  ) : null;

  // ── FRONT ──────────────────────────────────────────────────
  if (side === "front") {
    const isLogoLeft = (design.logoPosition ?? "left") === "left";

    const businessBlock = (
      <div style={{ textAlign: design.businessAlign ?? "left", display: "flex", flexDirection: "column" }}>
        <p style={{ ...nameStyle, margin: 0 }}>{design.businessName || "Business Name"}</p>
        {design.slogan && <p style={{ ...sloganStyle, margin: "4px 0 0" }}>{design.slogan}</p>}
        <StarsRow color={design.starColor ?? "#FBBF24"} size={isLandscape ? 14 : 12} />
      </div>
    );

    const instructionsBlock = (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {design.frontInstruction1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent, gap: "6px" }}>
            <Check
              size={12}
              strokeWidth={design.checkStrokeWidth ?? 3.5}
              style={{ color: design.iconsColor ?? "#22C55E", flexShrink: 0, display: "block" }}
            />
            <span style={{ ...instrStyle, margin: 0 }}>{design.frontInstruction1}</span>
          </div>
        )}
        {design.frontInstruction2 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent, gap: "6px" }}>
            <Check
              size={12}
              strokeWidth={design.checkStrokeWidth ?? 3.5}
              style={{ color: design.iconsColor ?? "#22C55E", flexShrink: 0, display: "block" }}
            />
            <span style={{ ...instrStyle, margin: 0 }}>{design.frontInstruction2}</span>
          </div>
        )}
      </div>
    );

    const ctaBlock = (
      <div style={{ paddingTop: `${design.ctaPaddingTop ?? 8}px` }}>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: 500, opacity: 0.8, textShadow: shadowStyle }}>
          {design.callToAction || "Powered by RedVanta"}
        </p>
      </div>
    );

    return (
      <div style={cardBaseStyle}>
        {colorMode === "template" && <PatternOverlay pattern={pattern} />}

        {/* NFC icon */}
        {(design.showNfcIcon ?? true) && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              opacity: 0.3,
              zIndex: 20,
              ...offset("nfcIcon"),
            }}
          >
            <svg width={nfcSize} height={nfcSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/>
              <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/>
              <path d="M12.91 4.1a16.09 16.09 0 0 1 0 15.8"/>
            </svg>
          </div>
        )}

        {/* Google icon */}
        {(design.showGoogleIcon ?? true) && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              bottom: "12px",
              opacity: 0.6,
              zIndex: 20,
              ...offset("googleIcon"),
            }}
          >
            <GoogleIcon size={gIconSize} />
          </div>
        )}

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "16px",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          {isLandscape ? (
            <>
              {/* Landscape : logo + business side by side */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isLogoLeft ? "row" : "row-reverse",
                  alignItems: "center",
                  gap: "6px",
                  width: "100%",
                }}
              >
                {logoImg && (
                  <div style={{ flexShrink: 0, ...offset("logo") }}>{logoImg}</div>
                )}
                <div style={{ flex: 1, minWidth: 0, ...offset("businessInfo") }}>{businessBlock}</div>
              </div>
              <div style={offset("instructions")}>{instructionsBlock}</div>
              <div style={offset("cta")}>{ctaBlock}</div>
            </>
          ) : (
            <>
              {/* Portrait : logo top-center optionnel */}
              {logoImg && design.logoPosition === "top-center" && (
                <div style={{ display: "flex", justifyContent: "center", ...offset("logo") }}>{logoImg}</div>
              )}
              <div style={offset("businessInfo")}>{businessBlock}</div>
              <div style={offset("instructions")}>{instructionsBlock}</div>
              {logoImg && design.logoPosition === "bottom-center" && (
                <div style={{ marginTop: "4px", display: "flex", justifyContent: "center", ...offset("logo") }}>{logoImg}</div>
              )}
              <div style={offset("cta")}>{ctaBlock}</div>
            </>
          )}
        </div>

        {/* Accent band */}
        {showBand && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              ...(bandPosition === "top" ? { top: 0 } : { bottom: 0 }),
              ...bandStyle,
            }}
          />
        )}
      </div>
    );
  }

  // ── BACK ───────────────────────────────────────────────────
  const qrEl = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        height:          `${qrSize}px`,
        width:           `${qrSize}px`,
        borderRadius: "8px",
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <p style={{ ...nameStyle, fontSize: `${Math.max((design.businessFontSize ?? 16) - 4, 8)}px`, margin: 0, textAlign: "center" }}>
        {design.businessName || "Business Name"}
      </p>
      {design.slogan && (
        <p style={{ ...sloganStyle, fontSize: `${Math.max((design.sloganFontSize ?? 12) - 2, 7)}px`, margin: 0, textAlign: "center" }}>
          {design.slogan}
        </p>
      )}
      <StarsRow color={design.starColor ?? "#FBBF24"} size={11} />
    </div>
  );

  const backInstrBlock = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      {design.backInstruction1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent, gap: "6px" }}>
          <Check size={11} strokeWidth={design.checkStrokeWidth ?? 3.5} style={{ color: design.iconsColor ?? "#22C55E", flexShrink: 0, display: "block" }} />
          <span style={{ ...instrStyle, fontSize: `${Math.max((design.instrFontSize ?? 10) - 1, 7)}px`, margin: 0 }}>
            {design.backInstruction1}
          </span>
        </div>
      )}
      {design.backInstruction2 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent, gap: "6px" }}>
          <Check size={11} strokeWidth={design.checkStrokeWidth ?? 3.5} style={{ color: design.iconsColor ?? "#22C55E", flexShrink: 0, display: "block" }} />
          <span style={{ ...instrStyle, fontSize: `${Math.max((design.instrFontSize ?? 10) - 1, 7)}px`, margin: 0 }}>
            {design.backInstruction2}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div style={cardBaseStyle}>
      {colorMode === "template" && <PatternOverlay pattern={pattern} />}

      {/* Google icon */}
      {(design.showGoogleIcon ?? true) && (
        <div
          style={{
            position: "absolute",
            right: "12px",
            bottom: "12px",
            opacity: 0.6,
            zIndex: 20,
            ...offset("googleIcon"),
          }}
        >
          <GoogleIcon size={gIconSize} />
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isQrHoriz ? "row" : "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {isQrFirst && <div style={offset("qrCode")}>{qrEl}</div>}
          <div style={offset("businessInfo")}>{backBizBlock}</div>
          {!isQrFirst && <div style={offset("qrCode")}>{qrEl}</div>}
        </div>
        <div style={offset("instructions")}>{backInstrBlock}</div>
        <div style={offset("cta")}>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: 500, opacity: 0.7, textShadow: shadowStyle }}>
            {design.callToAction || "Powered by RedVanta"}
          </p>
        </div>
      </div>

      {/* Accent band */}
      {showBand && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            ...(bandPosition === "top" ? { top: 0 } : { bottom: 0 }),
            ...bandStyle,
          }}
        />
      )}
    </div>
  );
}

// ─── PrintReadyPage — capture PDF basée sur le vrai rendu carte ───────────
function PrintReadyPage({ design, side, previewRef, cardWidth }) {
  const isLandscape = design?.orientation === "landscape";
  const fallbackCardW = isLandscape ? 408 : 257;
  const effectiveCardW = cardWidth || fallbackCardW;
  const pageTitle = side === "front" ? "RECTO (Front)" : "VERSO (Back)";
  const tpl = CARD_TEMPLATES.find((t) => t.id === design?.templateName);
  const previewProps = {
    design: { ...design, cta: design?.callToAction ?? design?.cta, qrColor: design?.qrColor ?? design?.accentColor },
    orientation: design?.orientation,
    side,
    frontLine1: design?.frontInstruction1,
    frontLine2: design?.frontInstruction2,
    backLine1: design?.backInstruction1,
    backLine2: design?.backInstruction2,
    gradient1: design?.gradient1,
    gradient2: design?.gradient2,
    accentBand1: design?.accentBand1,
    accentBand2: design?.accentBand2,
    pattern: tpl?.pattern ?? "none",
    bandPosition: design?.bandPosition,
    colorMode: design?.colorMode,
    nameFont: design?.businessFont,
    sloganFont: design?.sloganFont,
    nameFontSize: design?.businessFontSize,
    sloganFontSize: design?.sloganFontSize,
    nameLetterSpacing: design?.businessFontSpacing,
    sloganLetterSpacing: design?.sloganFontSpacing,
    nameTextTransform: design?.businessTextTransform,
    sloganTextTransform: design?.sloganTextTransform,
    nameLineHeight: String(design?.businessLineHeight ?? "1.2"),
    sloganLineHeight: String(design?.sloganLineHeight ?? "1.4"),
    nameTextAlign: design?.businessAlign,
    sloganTextAlign: design?.sloganAlign,
    qrPosition: design?.qrCodeStyle ?? "top",
    logoPosition: design?.logoPosition,
    logoSize: design?.logoSize,
    qrSize: design?.qrCodeSize,
    instructionFont: design?.instrFont,
    instructionFontSize: design?.instrFontSize,
    instructionLetterSpacing: design?.instrFontSpacing,
    instructionLineHeight: String(design?.instrLineHeight ?? "1.4"),
    instructionTextAlign: design?.instrAlign,
    nameFontWeight: String(design?.businessFontWeight ?? "700"),
    sloganFontWeight: String(design?.sloganFontWeight ?? "400"),
    instructionFontWeight: String(design?.instrFontWeight ?? "400"),
    checkStrokeWidth: design?.checkStrokeWidth,
    starsColor: design?.starColor,
    iconsColor: design?.iconsColor,
    nfcIconSize: design?.nfcIconSize,
    showNfcIcon: design?.showNfcIcon,
    showGoogleIcon: design?.showGoogleIcon,
    frontBandHeight: design?.frontBandHeight,
    backBandHeight: design?.backBandHeight,
    textShadow: design?.textShadow,
    ctaPaddingTop: design?.ctaPaddingTop,
    googleIconSize: design?.googleLogoSize,
    dragMode: false,
    elementOffsets: design?.elementOffsets?.[design?.orientation]?.[side] ?? {},
  };

  return (
    <div
      ref={previewRef}
      style={{
        width: "760px",
        minHeight: "520px",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "28px 24px 40px",
        boxSizing: "border-box",
        color: "#111111",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "26px", fontWeight: 700, marginBottom: "8px" }}>{pageTitle}</div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {design?.businessName} · 85.6mm × 54.0mm · Print-ready
        </div>
      </div>

      <div
        style={{
          width: "fit-content",
          maxWidth: "100%",
          border: "2px dashed #d1d5db",
          borderRadius: "16px",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: `${effectiveCardW}px` }}>
          <SharedCardPreview {...previewProps} />
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
  const [previewSide, setPreviewSide]   = useState("front");
  const [printSide,   setPrintSide]     = useState("front");
  const [isGenerating, setIsGenerating] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const livePreviewWrapRef = useRef(null);
  const printRef           = useRef(null);

  // Monter le portail uniquement côté client (évite les erreurs SSR)
  useEffect(() => { setPortalMounted(true); }, []);

  const status = STATUS_CONFIG[design?.status] ?? STATUS_CONFIG.draft;
  const currentTemplate = CARD_TEMPLATES.find((t) => t.id === design?.templateName);
  const previewProps = design ? {
    design: { ...design, cta: design?.callToAction ?? design?.cta, qrColor: design?.qrColor ?? design?.accentColor },
    orientation: design.orientation,
    side: previewSide,
    frontLine1: design.frontInstruction1,
    frontLine2: design.frontInstruction2,
    backLine1: design.backInstruction1,
    backLine2: design.backInstruction2,
    gradient1: design.gradient1,
    gradient2: design.gradient2,
    accentBand1: design.accentBand1,
    accentBand2: design.accentBand2,
    pattern: currentTemplate?.pattern ?? "none",
    bandPosition: design.bandPosition,
    colorMode: design.colorMode,
    nameFont: design.businessFont,
    sloganFont: design.sloganFont,
    nameFontSize: design.businessFontSize,
    sloganFontSize: design.sloganFontSize,
    nameLetterSpacing: design.businessFontSpacing,
    sloganLetterSpacing: design.sloganFontSpacing,
    nameTextTransform: design.businessTextTransform,
    sloganTextTransform: design.sloganTextTransform,
    nameLineHeight: String(design.businessLineHeight ?? "1.2"),
    sloganLineHeight: String(design.sloganLineHeight ?? "1.4"),
    nameTextAlign: design.businessAlign,
    sloganTextAlign: design.sloganAlign,
    qrPosition: design.qrCodeStyle ?? "top",
    logoPosition: design.logoPosition,
    logoSize: design.logoSize,
    qrSize: design.qrCodeSize,
    instructionFont: design.instrFont,
    instructionFontSize: design.instrFontSize,
    instructionLetterSpacing: design.instrFontSpacing,
    instructionLineHeight: String(design.instrLineHeight ?? "1.4"),
    instructionTextAlign: design.instrAlign,
    nameFontWeight: String(design.businessFontWeight ?? "700"),
    sloganFontWeight: String(design.sloganFontWeight ?? "400"),
    instructionFontWeight: String(design.instrFontWeight ?? "400"),
    checkStrokeWidth: design.checkStrokeWidth,
    starsColor: design.starColor,
    iconsColor: design.iconsColor,
    nfcIconSize: design.nfcIconSize,
    showNfcIcon: design.showNfcIcon,
    showGoogleIcon: design.showGoogleIcon,
    frontBandHeight: design.frontBandHeight,
    backBandHeight: design.backBandHeight,
    textShadow: design.textShadow,
    ctaPaddingTop: design.ctaPaddingTop,
    googleIconSize: design.googleLogoSize,
    dragMode: false,
    elementOffsets: design.elementOffsets?.[design.orientation]?.[previewSide] ?? {},
  } : null;

  const handleClose = () => { setPreviewSide("front"); onClose(); };
  const handleEdit  = () => { setPreviewSide("front"); onEdit?.(design); };

  const cropCanvasToContent = (sourceCanvas) => {
    const ctx = sourceCanvas.getContext("2d");
    if (!ctx) return sourceCanvas;

    const { width, height } = sourceCanvas;
    const { data } = ctx.getImageData(0, 0, width, height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) return sourceCanvas;

    const croppedWidth = maxX - minX + 1;
    const croppedHeight = maxY - minY + 1;
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    const croppedCtx = croppedCanvas.getContext("2d");

    if (!croppedCtx) return sourceCanvas;

    croppedCtx.drawImage(
      sourceCanvas,
      minX,
      minY,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );

    return croppedCanvas;
  };

  const handleDownloadPdf = async () => {
    if (!design || !printRef.current) return;
    setIsGenerating(true);
    try {
      if (document?.fonts?.ready) {
        await document.fonts.ready;
      }

      // Capture depuis le portail (rendu sur document.body, hors de tout transform Dialog)
      const captureFromPortal = async (targetSide) => {
        setPrintSide(targetSide);
        // Attendre le re-render React + paint
        await new Promise((resolve) => setTimeout(resolve, 400));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        // Attendre les images
        if (printRef.current) {
          const imgs = Array.from(printRef.current.querySelectorAll("img"));
          await Promise.all(
            imgs.map((img) =>
              img.complete
                ? Promise.resolve()
                : new Promise((res) => { img.onload = res; img.onerror = res; })
            )
          );
        }
        // Double RAF post-images pour s'assurer du repaint
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return html2canvas(printRef.current, {
          backgroundColor: null,
          scale: Math.max(window.devicePixelRatio || 1, 2),
          useCORS: true,
          allowTaint: false,
          removeContainer: true,
          logging: false,
          // Désactiver transitions/animations dans le clone capturé
          onclone: (_clonedDoc, clonedEl) => {
            clonedEl.style.transition = "none";
            clonedEl.querySelectorAll("*").forEach((el) => {
              el.style.transition  = "none";
              el.style.animation   = "none";
            });
          },
        });
      };

      const frontCanvasRaw = await captureFromPortal("front");
      const backCanvasRaw  = await captureFromPortal("back");
      const frontCanvas = cropCanvasToContent(frontCanvasRaw);
      const backCanvas = cropCanvasToContent(backCanvasRaw);

      const pageWidth = 760;
      const pageHeight = 520;
      const frameX = 20;
      const frameY = 110;
      const frameWidth = pageWidth - 40;
      const frameHeight = pageHeight - 140;
      const innerPadding = 10;

      const renderPrintPage = (pdf, canvas, title) => {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        pdf.setTextColor(17, 17, 17);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(26);
        pdf.text(title, pageWidth / 2, 48, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`${design.businessName} · 85.6mm × 54.0mm · Print-ready`, pageWidth / 2, 78, { align: "center" });

        pdf.setDrawColor(209, 213, 219);
        pdf.setLineWidth(2);
        pdf.setLineDashPattern([6, 4], 0);
        pdf.roundedRect(frameX, frameY, frameWidth, frameHeight, 16, 16, "S");
        pdf.setLineDashPattern([], 0);

        const innerWidth = frameWidth - innerPadding * 2;
        const innerHeight = frameHeight - innerPadding * 2;
        const availableWidth = innerWidth * 0.6;
        const availableHeight = innerHeight * 0.6;
        const imageRatio = canvas.width / canvas.height;
        let imageWidth = availableWidth;
        let imageHeight = imageWidth / imageRatio;

        if (imageHeight > availableHeight) {
          imageHeight = availableHeight;
          imageWidth = imageHeight * imageRatio;
        }

        const imageX = frameX + innerPadding + (innerWidth - imageWidth) / 2;
        const imageY = frameY + innerPadding + (innerHeight - imageHeight) / 2;
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", imageX, imageY, imageWidth, imageHeight);
      };

      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [pageWidth, pageHeight] });
      renderPrintPage(pdf, frontCanvas, "RECTO (Front)");
      pdf.addPage([pageWidth, pageHeight], "landscape");
      renderPrintPage(pdf, backCanvas, "VERSO (Back)");
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
            <div ref={livePreviewWrapRef}>
              {previewProps && <SharedCardPreview {...previewProps} />}
            </div>

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

      </DialogContent>

      {/* ── Portail de capture PDF — rendu sur document.body (hors Dialog transform) ── */}
      {portalMounted && design && previewProps && createPortal(
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: `${livePreviewWrapRef.current?.offsetWidth ?? 460}px`,
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <div ref={printRef}>
            <SharedCardPreview
              {...previewProps}
              side={printSide}
              elementOffsets={design.elementOffsets?.[design.orientation]?.[printSide] ?? {}}
            />
          </div>
        </div>,
        document.body
      )}
    </Dialog>
  );
}
