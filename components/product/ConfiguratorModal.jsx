"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingCart, Save, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PLATFORM_META } from "@/lib/cart";
import SharedCardPreview from "@/components/designs/SharedCardPreview";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const PRESET_COLORS = ["#0A0A0A", "#E10600", "#1E40AF", "#047857", "#9333EA", "#F59E0B", "#FFFFFF"];

const getTextColor = (hex) => {
  const c = (hex || "#0A0A0A").replace("#", "");
  if (c.length !== 6) return "#fff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#111" : "#fff";
};

const newLocation = (qty, color = "#0A0A0A") => ({
  id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  quantity: qty,
  platform: null,
  data: {},
  cardColor: color,
});

export const ConfiguratorModal = ({ open, onClose, totalQuantity, unitPrice, packageLabel, productId, packageTierId, productName, initialLocations, editItemId }) => {
  const router = useRouter();
  const { addLocalItem, replaceLocalItem } = useCart();
  const [locations, setLocations] = useState([newLocation(totalQuantity)]);
  const [activeId, setActiveId] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [previewSide, setPreviewSide] = useState("front");

  useEffect(() => {
    if (open) {
      if (initialLocations && initialLocations.length > 0) {
        setLocations(initialLocations);
        setActiveId(initialLocations[0].id);
      } else {
        const init = newLocation(totalQuantity);
        setLocations([init]);
        setActiveId(init.id);
      }
      setApplyToAll(false);
    }
  }, [open, totalQuantity, initialLocations]);

  const assigned = locations.reduce((s, l) => s + l.quantity, 0);
  const remaining = totalQuantity - assigned;
  const active = locations.find((l) => l.id === activeId) || locations[0];

  const updateLocation = (id, patch) => {
    setLocations((prev) => {
      let next = prev.map((l) => (l.id === id ? { ...l, ...patch } : l));
      if (applyToAll && (patch.platform !== undefined || patch.cardColor !== undefined || patch.data !== undefined)) {
        const src = next.find((l) => l.id === id);
        next = next.map((l) => ({ ...l, platform: src.platform, cardColor: src.cardColor, data: { ...src.data } }));
      }
      return next;
    });
  };

  const addLocation = () => {
    if (locations.length >= totalQuantity) return;
    setLocations((prev) => {
      const sorted = [...prev].sort((a, b) => b.quantity - a.quantity);
      const largest = sorted[0];
      if (largest.quantity <= 1) return prev;
      const next = prev.map((l) => (l.id === largest.id ? { ...l, quantity: l.quantity - 1 } : l));
      const created = newLocation(1);
      setActiveId(created.id);
      return [...next, created];
    });
  };

  const removeLocation = (id) => {
    setLocations((prev) => {
      if (prev.length === 1) return prev;
      const removed = prev.find((l) => l.id === id);
      const rest = prev.filter((l) => l.id !== id);
      rest[0] = { ...rest[0], quantity: rest[0].quantity + removed.quantity };
      if (activeId === id) setActiveId(rest[0].id);
      return rest;
    });
  };

  const incQty = (id) => {
    if (remaining <= 0) return;
    const loc = locations.find((l) => l.id === id);
    updateLocation(id, { quantity: loc.quantity + 1 });
  };

  const decQty = (id) => {
    const loc = locations.find((l) => l.id === id);
    if (loc.quantity <= 1) return;
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, quantity: l.quantity - 1 } : l)));
  };

  const distributeEvenly = () => {
    setLocations((prev) => {
      const n = prev.length;
      const base = Math.floor(totalQuantity / n);
      const extra = totalQuantity - base * n;
      return prev.map((l, i) => ({ ...l, quantity: base + (i < extra ? 1 : 0) }));
    });
  };

  const isValid = useMemo(() => {
    if (assigned !== totalQuantity) return false;
    return locations.every((l) => {
      if (!l.platform) return false;
      const v = l.data.businessName || l.data.handle || l.data.url;
      return Boolean(v && v.trim().length > 0);
    });
  }, [locations, assigned, totalQuantity]);

  const handleClose = () => setConfirmExit(true);

  const confirmedClose = () => {
    setConfirmExit(false);
    onClose();
  };

  const handleSaveAddToCart = () => {
    if (!isValid) {
      toast.error("Please complete all locations and assign all cards.");
      return;
    }
    const payload = {
      productId: productId || undefined,
      packageTierId: packageTierId || undefined,
      productName,
      unitPrice,
      totalPrice: totalQuantity * unitPrice,
      totalQuantity,
      packageLabel,
      locations,
    };
    if (editItemId) {
      replaceLocalItem(editItemId, payload);
      toast.success("Your configuration has been updated.");
    } else {
      addLocalItem(payload);
      toast.success("Your cards have been added to the cart successfully.");
    }
    onClose();
    router.push("/cart");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-neutral-950 text-neutral-100 border border-neutral-800 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-6xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-display font-bold leading-tight">Customize & Add Your Cards</h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Add locations, customize design, and connect your platforms.
            </p>
          </div>
          <button onClick={handleClose} className="shrink-0 p-2 rounded-lg hover:bg-neutral-800 transition" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="grid lg:grid-cols-[1fr,500px] gap-0">
            {/* Left: editor */}
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 min-w-0">
              {/* Summary bar */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="px-2 py-1 rounded-md bg-primary/15 text-primary font-semibold">
                    {totalQuantity} cards total
                  </span>
                  <span className={remaining === 0 ? "text-emerald-400" : "text-amber-400"}>
                    Remaining: <strong>{remaining}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={distributeEvenly} className="border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 w-full">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> <span className="truncate">Distribute Evenly</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={addLocation}
                    disabled={locations.length >= totalQuantity}
                    className="gradient-primary text-primary-foreground w-full"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> <span className="truncate">Add Location</span>
                  </Button>
                </div>
              </div>

              {/* Apply to all */}
              <div className="flex items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                <Label htmlFor="apply-all" className="text-sm text-neutral-200 min-w-0">
                  Apply this setup to all cards
                </Label>
                <Switch id="apply-all" checked={applyToAll} onCheckedChange={setApplyToAll} className="shrink-0" />
              </div>

              {/* Location tabs */}
              <div className="flex flex-wrap gap-2">
                {locations.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => setActiveId(l.id)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition ${
                      activeId === l.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    Location {i + 1} · {l.quantity}
                  </button>
                ))}
              </div>

              {active && (
                <LocationEditor
                  location={active}
                  onChange={(patch) => updateLocation(active.id, patch)}
                  onInc={() => incQty(active.id)}
                  onDec={() => decQty(active.id)}
                  onRemove={() => removeLocation(active.id)}
                  canRemove={locations.length > 1}
                  canIncrease={remaining > 0}
                />
              )}
            </div>

            {/* Right: live preview */}
            <div className="border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-neutral-200">Live Preview</div>
                <div className="flex overflow-hidden rounded-lg border border-neutral-700 text-xs w-fit">
                  <button
                    onClick={() => setPreviewSide("front")}
                    className={`px-3 py-1.5 font-medium transition-colors ${previewSide === "front" ? "bg-primary text-primary-foreground" : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"}`}
                  >Front</button>
                  <button
                    onClick={() => setPreviewSide("back")}
                    className={`px-3 py-1.5 font-medium transition-colors ${previewSide === "back" ? "bg-primary text-primary-foreground" : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"}`}
                  >Back</button>
                </div>
              </div>
              {active && (
                <div className="w-full">
                  <SharedCardPreview
                    design={{
                      businessName: active.data?.businessName || active.data?.handle || active.data?.url || "Your Business",
                      bgColor: active.cardColor || "#0A0A0A",
                      textColor: getTextColor(active.cardColor),
                      cta: "Powered by Opinoor",
                      qrColor: "#000000",
                    }}
                    colorMode="single"
                    gradient1={active.cardColor || "#0A0A0A"}
                    gradient2={active.cardColor || "#0A0A0A"}
                    orientation="landscape"
                    side={previewSide}
                    frontLine1="Approach your phone to the card"
                    frontLine2="Tap to leave a review"
                    backLine1="Scan the QR code with your camera"
                    backLine2="No app needed"
                    platform={active.platform || "google"}
                    showGoogleIcon={true}
                    showNfcIcon={true}
                    nameFontSize={16}
                    sloganFontSize={12}
                    instructionFontSize={10}
                    nameFontWeight="700"
                    sloganFontWeight="400"
                    instructionFontWeight="400"
                    nameLetterSpacing="normal"
                    sloganLetterSpacing="normal"
                    instructionLetterSpacing="normal"
                    nameLineHeight="1.2"
                    sloganLineHeight="1.4"
                    instructionLineHeight="1.4"
                    nameTextAlign="left"
                    sloganTextAlign="left"
                    instructionTextAlign="left"
                    nameTextTransform="none"
                    sloganTextTransform="none"
                    qrSize={80}
                    qrPosition="right"
                    logoPosition="left"
                    logoSize={32}
                    googleIconSize={20}
                    nfcIconSize={24}
                    checkStrokeWidth={3.5}
                    starsColor="#FBBF24"
                    iconsColor="#22C55E"
                    textShadow="none"
                    ctaPaddingTop={8}
                    frontBandHeight={22}
                    backBandHeight={12}
                    bandPosition="hidden"
                    pattern="none"
                  />
                </div>
              )}
              <div className="text-xs text-neutral-400 text-center">
                Updates in real time as you customize.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 p-3 sm:p-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center bg-neutral-950 sticky bottom-0">
          <div className="text-xs text-neutral-400 text-center sm:text-left order-last sm:order-first">
            {assigned}/{totalQuantity} cards assigned · {locations.length} location{locations.length > 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100">
              <Save className="w-4 h-4 mr-2" /> <span className="truncate">Save</span>
            </Button>
            <Button onClick={handleSaveAddToCart} disabled={!isValid} className="gradient-primary text-primary-foreground">
              <ShoppingCart className="w-4 h-4 mr-2" /> <span className="truncate">Add to Cart</span>
            </Button>
          </div>
        </div>

        {/* Exit confirm */}
        {confirmExit && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-sm w-full">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold">Discard configuration?</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Your configuration is not saved. Are you sure you want to exit?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" className="border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100" onClick={() => setConfirmExit(false)}>
                  Keep editing
                </Button>
                <Button variant="destructive" onClick={confirmedClose}>Exit anyway</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LocationEditor = ({ location, onChange, onInc, onDec, onRemove, canRemove, canIncrease }) => {
  const platforms = ["google", "facebook", "instagram", "custom"];
  const meta = location.platform ? PLATFORM_META[location.platform] : null;

  const inputValue =
    location.platform === "google"
      ? location.data.businessName || ""
      : location.platform === "instagram"
      ? location.data.handle || ""
      : location.data.url || "";

  const setInput = (v) => {
    if (location.platform === "google") onChange({ data: { ...location.data, businessName: v } });
    else if (location.platform === "instagram") onChange({ data: { ...location.data, handle: v } });
    else onChange({ data: { ...location.data, url: v } });
  };

  return (
    <div className="space-y-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      {/* Platform selector */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-neutral-400">Platform</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {platforms.map((p) => {
            const m = PLATFORM_META[p];
            const isActive = location.platform === p;
            return (
              <button
                key={p}
                onClick={() => onChange({ platform: p, data: {} })}
                className={`px-3 py-2.5 rounded-lg border text-sm transition flex items-center justify-center ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-neutral-200"
                }`}
              >
                <span className="truncate">{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {meta && (
        <div className="space-y-2">
          <h4 className="font-semibold text-neutral-100">{meta.title}</h4>
          <p className="text-xs text-neutral-400">{meta.description}</p>
          <Label htmlFor="platform-input" className="text-xs text-neutral-300">{meta.inputLabel}</Label>
          <Input
            id="platform-input"
            value={inputValue}
            onChange={(e) => setInput(e.target.value)}
            placeholder={meta.placeholder}
            className="bg-neutral-950 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
          />
        </div>
      )}

      {/* Color */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-neutral-400">Card color</Label>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ cardColor: c })}
              className={`w-8 h-8 rounded-full border-2 transition ${
                location.cardColor.toLowerCase() === c.toLowerCase()
                  ? "border-primary scale-110"
                  : "border-neutral-700 hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
          <label className="ml-1 inline-flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
            <input
              type="color"
              value={location.cardColor}
              onChange={(e) => onChange({ cardColor: e.target.value })}
              className="w-8 h-8 rounded-full overflow-hidden bg-transparent border border-neutral-700 cursor-pointer"
            />
            Custom
          </label>
        </div>
      </div>

      {/* Quantity + remove */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs uppercase tracking-wider text-neutral-400">Quantity</Label>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onDec}
              disabled={location.quantity <= 1}
              className="w-9 h-9 rounded-lg border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 grid place-items-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-display font-bold text-lg">{location.quantity}</span>
            <button
              onClick={onInc}
              disabled={!canIncrease}
              className="w-9 h-9 rounded-lg border border-neutral-700 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 grid place-items-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {canRemove && (
          <Button variant="ghost" onClick={onRemove} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-1.5" /> Remove location
          </Button>
        )}
      </div>
    </div>
  );
};
