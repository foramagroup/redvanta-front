"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, QrCode, Star } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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

const LETTER_SPACING_OPTIONS = [
    { id: "tight", label: "Tight", value: "-0.025em" },
    { id: "normal", label: "Normal", value: "0em" },
    { id: "wide", label: "Wide", value: "0.05em" },
    { id: "wider", label: "Wider", value: "0.1em" },
];

const TEXT_SHADOW_OPTIONS = [
    { id: "none", label: "None", value: "none" },
    { id: "subtle", label: "Subtle", value: "0 1px 2px rgba(0,0,0,0.3)" },
    { id: "medium", label: "Medium", value: "0 2px 4px rgba(0,0,0,0.5)" },
    { id: "strong", label: "Strong", value: "0 2px 8px rgba(0,0,0,0.7)" },
    { id: "outline", label: "Outline", value: "-1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6), 1px 1px 0 rgba(0,0,0,0.6)" },
];

const StarsRow = ({ color = "#FBBF24", size = 12 }) => (<div className="flex gap-0.5 mt-2">
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
export default function SharedCardPreview({ design, orientation, side, frontLine1, frontLine2, backLine1, backLine2, gradient1, gradient2, accentBand1, accentBand2, pattern, bandPosition, colorMode, nameFont, sloganFont, nameFontSize, sloganFontSize, nameLetterSpacing, sloganLetterSpacing, nameTextTransform, sloganTextTransform, nameLineHeight, sloganLineHeight, nameTextAlign, sloganTextAlign, qrPosition, logoPosition, logoSize, qrSize, instructionFont, instructionFontSize, instructionLetterSpacing, instructionLineHeight, instructionTextAlign, nameFontWeight, sloganFontWeight, instructionFontWeight, checkStrokeWidth, starsColor, iconsColor, nfcIconSize, showNfcIcon, showGoogleIcon, frontBandHeight, backBandHeight, textShadow, ctaPaddingTop, googleIconSize, dragMode, elementOffsets, onElementDrag, platform = "google", useLogo = true, customIcon: CustomIcon = null, customIconColor = "#4285F4" }) {
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
    const PLATFORM_ICONS_MAP = {
      google: (size) => (<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>),
      facebook: (size) => (<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="5" fill="#1877F2"/><path d="M16.5 8H14c-.3 0-.5.2-.5.5V10h3l-.4 2.5H13.5V19h-3v-6.5H9V10h1.5V8.2C10.5 6.4 11.7 5 13.8 5H16.5v3z" fill="#fff"/></svg>),
      instagram: (size) => (<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ig-prev-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#dc2743"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig-prev-grad)"/><rect x="6" y="6" width="12" height="12" rx="3.5" fill="none" stroke="#fff" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="1.5"/><circle cx="17.2" cy="6.8" r="1" fill="#fff"/></svg>),
      tiktok: (size) => (<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="5" fill="#010101"/><path d="M16.5 7.5c-.9-.6-1.5-1.5-1.7-2.5h-2.3v12c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.2 0 .4 0 .6.1V12.6c-.2 0-.4-.1-.6-.1-2.4 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3V10c.8.6 1.7 1 2.7 1V8.8c-.5 0-1-.1-1-.1l.5-1.2z" fill="#fff"/><path d="M15.5 8c.8.5 1.7.8 2.5.8V7c-.5 0-.9-.1-1.3-.3-.6-.3-1-.8-1.2-1.4h-1.8v9.5c0 .9-.7 1.7-1.7 1.7s-1.7-.7-1.7-1.7.7-1.7 1.7-1.7h.3v-1.8h-.3c-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5 3.5-1.6 3.5-3.5V8z" fill="#69C9D0"/></svg>),
      booking: (size) => (<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#003580"/><text x="12" y="16.5" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="sans-serif">B.</text></svg>),
      tripadvisor: (size) => (<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#34E0A1"/><circle cx="8.5" cy="12" r="3" fill="#fff" stroke="#00AA6C" strokeWidth="1"/><circle cx="15.5" cy="12" r="3" fill="#fff" stroke="#00AA6C" strokeWidth="1"/><circle cx="8.5" cy="12" r="1.2" fill="#00AA6C"/><circle cx="15.5" cy="12" r="1.2" fill="#00AA6C"/></svg>),
      airbnb: (size) => (<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#FF5A5F"/><path d="M12 4c-1 2.5-3.5 5.5-3.5 8 0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5C15.5 9.5 13 6.5 12 4z" fill="#fff"/></svg>),
      custom: (size) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>),
    };
    const PlatformIcon = ({ size }) => {
      if (!useLogo && CustomIcon) {
        return <CustomIcon size={size} style={{ color: customIconColor }} />;
      }
      const render = PLATFORM_ICONS_MAP[platform] || PLATFORM_ICONS_MAP.google;
      return render(size);
    };
    const bgStyle = colorMode === "single"
        ? { background: design.bgColor, color: design.textColor }
        : { background: `linear-gradient(160deg, ${gradient1} 0%, ${gradient2} 70%)`, color: design.textColor };
    const bgStyleBack = colorMode === "single"
        ? { background: design.bgColor, color: design.textColor }
        : { background: `linear-gradient(160deg, ${gradient2} 0%, ${gradient1} 100%)`, color: design.textColor };
    const aspectClass = orientation === "landscape" ? "aspect-[1.6/1]" : orientation === "portrait" ? "aspect-[1/1.6]" : "aspect-[1/1]";
    const roundedClass = orientation === "circle" ? "rounded-full" : "rounded-xl";
    const isLandscape = orientation === "landscape" || orientation === "square" || orientation === "circle";
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
          {frontLine1 && (<div className={`flex items-center gap-1.5 ${instrJustify}`} style={{ lineHeight: "1" }}>
              <Check size={12} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor, transform: "translateY(1.5px)" }}/>
              <span className="opacity-90" style={{ fontSize: `${instructionFontSize}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: "1", textShadow: textShadowStyle }}>{frontLine1}</span>
            </div>)}
          {frontLine2 && (<div className={`flex items-center gap-1.5 ${instrJustify}`} style={{ lineHeight: "1" }}>
              <Check size={12} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor, transform: "translateY(1.5px)" }}/>
              <span className="opacity-90" style={{ fontSize: `${instructionFontSize}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: "1", textShadow: textShadowStyle }}>{frontLine2}</span>
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
            return (<div ref={cardRef} className={`${aspectClass} ${roundedClass} overflow-hidden shadow-2xl relative transition-all`} style={bgStyle}>
          <AlignmentGuides />
          {colorMode === "template" && <PatternOverlay pattern={pattern}/>}
          {showNfcIcon && renderDraggable("nfcIcon", <svg width={nfcIconSize} height={nfcIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a16.09 16.09 0 0 1 0 15.8"/>
            </svg>, "absolute top-3 right-3 opacity-30 z-20")}
          {showGoogleIcon && renderDraggable("googleIcon", <PlatformIcon size={googleIconSize}/>, "absolute bottom-3 right-3 opacity-60 z-20")}
          <div className="h-full flex flex-col justify-center gap-4 relative z-10 p-5">
            {businessRow}
            {renderDraggable("instructions", frontSecondGroup)}
            {renderDraggable("cta", frontCtaBlock)}
          </div>
          {colorMode === "template" && bandPosition !== "hidden" && (<div className={`absolute left-0 right-0 ${bandPosition === "top" ? "top-0" : "bottom-0"}`} style={{ height: `${frontBandHeight}%`, background: `linear-gradient(90deg, ${accentBand1} 0%, ${accentBand2} 100%)`, opacity: 0.9 }}/>)}
        </div>);
        }
        // Portrait
        return (<div ref={cardRef} className={`${aspectClass} ${roundedClass} overflow-hidden shadow-2xl relative transition-all`} style={bgStyle}>
        <AlignmentGuides />
        {colorMode === "template" && <PatternOverlay pattern={pattern}/>}
        {showNfcIcon && renderDraggable("nfcIcon", <svg width={nfcIconSize} height={nfcIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a16.09 16.09 0 0 1 0 15.8"/>
          </svg>, "absolute top-3 right-3 opacity-30 z-20")}
        {showGoogleIcon && renderDraggable("googleIcon", <PlatformIcon size={googleIconSize}/>, "absolute bottom-3 right-3 opacity-60 z-20")}
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
              {frontLine1 && (<div className={`flex items-center gap-1.5 ${instructionTextAlign === "center" ? "justify-center" : instructionTextAlign === "right" ? "justify-end" : "justify-start"}`} style={{ lineHeight: "1" }}>
                  <Check size={12} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor, transform: "translateY(1px)" }}/>
                  <span className="opacity-90" style={{ fontSize: `${instructionFontSize}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: "1", textShadow: textShadowStyle }}>{frontLine1}</span>
                </div>)}
              {frontLine2 && (<div className={`flex items-center gap-1.5 ${instructionTextAlign === "center" ? "justify-center" : instructionTextAlign === "right" ? "justify-end" : "justify-start"}`} style={{ lineHeight: "1" }}>
                  <Check size={12} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor, transform: "translateY(1px)" }}/>
                  <span className="opacity-90" style={{ fontSize: `${instructionFontSize}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: "1", textShadow: textShadowStyle }}>{frontLine2}</span>
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
    const qrUrl = design.googleReviewUrl ?? design.googleReviewLink ?? design.platformUrl ?? null;
    // Couleur des crochets = couleur du fond de la carte (dos)
    // const bracketColor = colorMode === "single" ? (design.bgColor ?? "#000000") : (gradient2 ?? "#000000");
    
    const bracketColor = "#ffffff"; // Blanc semi-transparent pour assurer une bonne visibilité sur tous les fonds
    const bracketSize  = Math.round(qrSize * 0.28);
    const bracketW     = Math.round(bracketSize * 0.25);
    const bracketCornerStyle = (pos) => ({
      position: "absolute",
      width:  bracketSize,
      height: bracketSize,
      zIndex: 3,
      ...(pos.top    !== undefined ? { top:    pos.top    } : { bottom: pos.bottom }),
      ...(pos.left   !== undefined ? { left:   pos.left   } : { right:  pos.right  }),
      borderTop:    pos.top    !== undefined ? `${bracketW}px solid ${bracketColor}` : "none",
      borderBottom: pos.bottom !== undefined ? `${bracketW}px solid ${bracketColor}` : "none",
      borderLeft:   pos.left   !== undefined ? `${bracketW}px solid ${bracketColor}` : "none",
      borderRight:  pos.right  !== undefined ? `${bracketW}px solid ${bracketColor}` : "none",
      borderRadius: pos.top !== undefined && pos.left  !== undefined ? "3px 0 0 0" :
                    pos.top !== undefined && pos.right !== undefined ? "0 3px 0 0" :
                    pos.bottom !== undefined && pos.left !== undefined ? "0 0 0 3px" : "0 0 3px 0",
    });
    const qrElement = (
      <div style={{ position: "relative", display: "inline-flex", padding: `${Math.round(qrSize * 0.16)}px` }}>
        {/* Crochets de coin */}
        <div style={bracketCornerStyle({ top: 0,    left:  0   })} />
        <div style={bracketCornerStyle({ top: 0,    right: 0   })} />
        <div style={bracketCornerStyle({ bottom: 0, left:  0   })} />
        <div style={bracketCornerStyle({ bottom: 0, right: 0   })} />
        {/* QR code */}
        <div className="flex items-center justify-center shrink-0 overflow-hidden"
          style={{ height: `${qrSize}px`, width: `${qrSize}px`, backgroundColor: "#FFFFFF", padding: "4px" }}>
          {qrUrl ? (
            <QRCodeSVG
              value={qrUrl}
              size={qrSize - 10}
              fgColor={design.qrColor ?? "#000000"}
              bgColor="#FFFFFF"
              level="M"
            />
          ) : (
            <QrCode size={Math.round(qrSize * 0.6)} style={{ color: design.qrColor }}/>
          )}
        </div>
      </div>
    );
    const isQrHorizontal = qrPosition === "left" || qrPosition === "right";
    const isQrFirst = qrPosition === "left" || qrPosition === "top";
    const backBusinessInfo = (<div className="flex flex-col items-center gap-1">
      <p className="text-center" style={{ fontSize: `${Math.max(nameFontSize - 4, 8)}px`, fontFamily: nameFont, fontWeight: nameFontWeight, letterSpacing: nameSpacing, textTransform: nameTextTransform === "none" ? undefined : nameTextTransform, lineHeight: nameLineHeight, textShadow: textShadowStyle }}>{design.businessName || "Business Name"}</p>
      {design.slogan && <p className="opacity-70 text-center" style={{ fontSize: `${Math.max(sloganFontSize - 2, 7)}px`, fontFamily: sloganFont, fontWeight: sloganFontWeight, letterSpacing: sloganSpacing, textTransform: sloganTextTransform === "none" ? undefined : sloganTextTransform, lineHeight: sloganLineHeight, textShadow: textShadowStyle }}>{design.slogan}</p>}
      <StarsRow color={starsColor} size={11}/>
    </div>);
    const backInstrJustify = instructionTextAlign === "center" ? "justify-center" : instructionTextAlign === "right" ? "justify-end" : "justify-start";
    const secondGroup = (<div className="flex flex-col items-center gap-1.5">
      {backLine1 && (<div className={`flex items-center gap-1.5 ${backInstrJustify}`} style={{ lineHeight: "1" }}>
          <Check size={11} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor, transform: "translateY(1.5px)" }}/>
          <span className="opacity-80" style={{ fontSize: `${Math.max(instructionFontSize - 1, 7)}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: "1", textShadow: textShadowStyle }}>{backLine1}</span>
        </div>)}
      {backLine2 && (<div className={`flex items-center gap-1.5 ${backInstrJustify}`} style={{ lineHeight: "1" }}>
          <Check size={11} strokeWidth={checkStrokeWidth} className="shrink-0" style={{ color: iconsColor, transform: "translateY(1.5px)" }}/>
          <span className="opacity-80" style={{ fontSize: `${Math.max(instructionFontSize - 1, 7)}px`, fontFamily: instructionFont, fontWeight: instructionFontWeight, letterSpacing: instrSpacing, lineHeight: "1", textShadow: textShadowStyle }}>{backLine2}</span>
        </div>)}
    </div>);
    const backCtaBlock = (<div style={{ paddingTop: `${ctaPaddingTop}px` }}>
      <p className="text-[10px] font-medium opacity-70" style={{ textShadow: textShadowStyle }}>{design.cta || "Powered by RedVanta"}</p>
    </div>);
    return (<div ref={cardRef} className={`${aspectClass} ${roundedClass} overflow-hidden shadow-2xl relative transition-all`} style={bgStyleBack}>
      <AlignmentGuides />
      {colorMode === "template" && <PatternOverlay pattern={pattern}/>}
      {showGoogleIcon && renderDraggable("googleIcon", <PlatformIcon size={googleIconSize}/>, "absolute bottom-3 right-3 opacity-60 z-20")}
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
