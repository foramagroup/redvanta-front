"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingCart, Save, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PLATFORM_META } from "@/lib/cart";
import SharedCardPreview from "@/components/designs/SharedCardPreview";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const PRESET_COLORS = ["#0A0A0A", "#E10600", "#1E40AF", "#047857", "#9333EA", "#F59E0B", "#FFFFFF"];

const getTextColor = (hex) => {
  const c = (hex || "#0A0A0A").replace("#", "");
  if (c.length !== 6) return "#fff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#111" : "#fff";
};

const newLocation = (qty, color = null, platform = null) => ({
  id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  quantity: qty,
  platform,
  data: {},
  cardColor: color,
});

// ─────────────────────────────────────────────────────────────
// Convertit les locations du format modal → format API backend
// ─────────────────────────────────────────────────────────────
const toApiLocations = (locations, fallbackPlatform) =>
  locations.map((l) => ({
    quantity: l.quantity,
    platform: l.platform || fallbackPlatform || "google",
    data: l.data || {},
    cardColor: l.cardColor ?? null,
  }));

// ─────────────────────────────────────────────────────────────
// Props :
//   open              : boolean
//   onClose           : () => void
//   totalQuantity     : number      — nb total de cartes
//   unitPrice         : number
//   packageLabel      : string
//   productId         : number|string
//   packageTierId     : number|string|null
//   productName       : string
//   initialLocations  : Location[]  — locations existantes (mode édition)
//   editItemId        : number|null — id du CartItem à modifier (mode édition DB)
//   onSaved           : () => void  — callback après sauvegarde réussie (refresh du panier)
// ─────────────────────────────────────────────────────────────
export const ConfiguratorModal = ({
  open,
  onClose,
  totalQuantity,
  unitPrice,
  packageLabel,
  productId,
  packageTierId,
  productName,
  initialLocations,
  editItemId,
  onSaved,
  defaultTemplate,
  productPlatform,
  defaultCardColor,
}) => {
  const router = useRouter();
  const { isAuthenticated, addLocalItem, replaceLocalItem } = useCart();

  const [locations, setLocations] = useState([newLocation(totalQuantity)]);
  const [activeId, setActiveId] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [previewSide, setPreviewSide] = useState("front");
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [resolvedEditId, setResolvedEditId] = useState(editItemId || null);
  const resolvedPlatform = productPlatform || defaultTemplate?.platform || "google";
  const resolvedDefaultCardColor = defaultCardColor || defaultTemplate?.gradient?.[0] || "#0A0A0A";


  useEffect(() => {
    if (!open) return;

    setApplyToAll(false);
    setSaving(false);
    setResolvedEditId(editItemId || null);

    // Case 1: parent passed locations explicitly (edit mode)
    if (initialLocations && initialLocations.length > 0) {
      const normalizedLocations = initialLocations.map((location) => ({
        ...location,
        platform: resolvedPlatform,
        cardColor: location.cardColor ?? null,
      }));
      setLocations(normalizedLocations);
      setActiveId(normalizedLocations[0].id);
      return;
    }

    // Case 2: authenticated — try to auto-populate from existing cart item
    if (isAuthenticated && productId) {
      setLoadingExisting(true);
      fetch(`${API_BASE}/client/shop/cart`, { credentials: "include" })
        .then((res) => res.json())
        .then((payload) => {
          const cartItems = payload?.data?.items || [];
          const match = cartItems.find(
            (item) =>
              item.productId === productId &&
              (packageTierId != null
                ? item.packageTier?.id === packageTierId
                : true)
          );

          if (match && Array.isArray(match.locations) && match.locations.length > 0) {
            const mapped = match.locations.map((loc) => ({
              id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              quantity: loc.quantity,
              platform: resolvedPlatform,
              data: {
                ...(loc.businessName ? { businessName: loc.businessName } : {}),
                ...(loc.handle ? { handle: loc.handle } : {}),
                ...(loc.url ? { url: loc.url } : {}),
              },
              cardColor: loc.cardColor || null,
            }));
            setLocations(mapped);
            setActiveId(mapped[0].id);
            setResolvedEditId(match.id);
          } else {
            const init = newLocation(totalQuantity, null, resolvedPlatform);
            setLocations([init]);
            setActiveId(init.id);
          }
        })
        .catch(() => {
          const init = newLocation(totalQuantity, null, resolvedPlatform);
          setLocations([init]);
          setActiveId(init.id);
        })
        .finally(() => setLoadingExisting(false));
      return;
    }

    // Case 3: unauthenticated or no productId
    const init = newLocation(totalQuantity, null, resolvedPlatform);
    setLocations([init]);
    setActiveId(init.id);
  }, [open, totalQuantity, initialLocations, isAuthenticated, productId, packageTierId, editItemId, resolvedPlatform]);

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
      const created = newLocation(1, null, resolvedPlatform);
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
      const v = l.data?.businessName || l.data?.handle || l.data?.url;
      return Boolean(v && v.trim().length > 0);
    });
  }, [locations, assigned, totalQuantity]);

  const handleClose = () => setConfirmExit(true);

  const confirmedClose = () => {
    setConfirmExit(false);
    onClose();
  };

  // ─────────────────────────────────────────────────────────────
  // Sauvegarde — 3 cas :
  //   1. Authentifié + nouveau → POST /api/client/shop/cart
  //   2. Authentifié + édition → PUT  /api/client/shop/cart/:editItemId/locations
  //   3. Non authentifié       → localStorage (garde le comportement legacy)
  // ─────────────────────────────────────────────────────────────
  const handleSaveAddToCart = async () => {
    if (!isValid) {
      toast.error("Please complete all locations and assign all cards.");
      return;
    }

    // ── Cas 3 : non authentifié → localStorage ──────────────
    if (!isAuthenticated) {
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
      if (resolvedEditId) {
        replaceLocalItem(resolvedEditId, payload);
        toast.success("Your configuration has been updated.");
      } else {
        addLocalItem(payload);
        toast.success("Your cards have been added to the cart.");
      }
      onClose();
      router.push("/cart");
      return;
    }

    // ── Cas 1 & 2 : authentifié → appel API ─────────────────
    setSaving(true);

    try {
      const apiLocations = toApiLocations(locations, resolvedPlatform);

      let response;

      if (resolvedEditId) {
        // ── Cas 2 : mettre à jour les locations d'un item existant ──
        response = await fetch(`${API_BASE}/client/shop/cart/${resolvedEditId}/locations`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ locations: apiLocations }),
        });
      } else {
        // ── Cas 1 : ajouter un nouvel item avec ses locations ──
        response = await fetch(`${API_BASE}/client/shop/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId,
            packageTierId: packageTierId || undefined,
            locations: apiLocations,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "An error occurred while saving.");
      }

      toast.success(
        resolvedEditId
          ? "Your configuration has been updated."
          : "Your cards have been added to the cart successfully."
      );

      // Notifier le parent (rafraîchir le panier)
      onSaved?.();
      onClose();

      if (!resolvedEditId) {
        router.push("/cart");
      }
    } catch (err) {
      console.error("ConfiguratorModal save error:", err);
      toast.error(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-neutral-950 text-neutral-100 border border-neutral-800 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-6xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-display font-bold leading-tight">
              {resolvedEditId ? "Edit Card Configuration" : "Customize & Add Your Cards"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Add locations, customize design, and connect your platforms.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 p-2 rounded-lg hover:bg-neutral-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {loadingExisting && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-neutral-950/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm">Loading your existing configuration…</span>
              </div>
            </div>
          )}
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={distributeEvenly}
                    className="border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 w-full"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    <span className="truncate">Distribute Evenly</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={addLocation}
                    disabled={locations.length >= totalQuantity}
                    className="gradient-primary text-primary-foreground w-full"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    <span className="truncate">Add Location</span>
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
                  fixedPlatform={resolvedPlatform}
                  defaultCardColor={resolvedDefaultCardColor}
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
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      previewSide === "front"
                        ? "bg-primary text-primary-foreground"
                        : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setPreviewSide("back")}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      previewSide === "back"
                        ? "bg-primary text-primary-foreground"
                        : "bg-neutral-900 text-neutral-400 hover:text-neutral-100"
                    }`}
                  >
                    Back
                  </button>
                </div>
              </div>
              {active && (() => {
                const tpl = defaultTemplate;
                const hasCustomColor = Boolean(active.cardColor);
                const previewColor = active.cardColor || resolvedDefaultCardColor;
                const templateBandPosition = tpl?.bandPosition || "bottom";
                const previewUsesTemplate = !hasCustomColor && !!tpl && templateBandPosition !== "hidden";
                const g1 = hasCustomColor ? previewColor : (tpl?.gradient?.[0] || previewColor || "#0A0A0A");
                const g2 = hasCustomColor ? previewColor : (tpl?.gradient?.[1] || tpl?.gradient?.[0] || previewColor || "#0A0A0A");
                const colorMode = previewUsesTemplate ? "template" : "single";
                const textColor = hasCustomColor ? getTextColor(previewColor) : (tpl?.textColor || getTextColor(previewColor || "#0A0A0A"));
                const accentColor = tpl?.accentColor || "#4285F4";
                const bandColor1 = tpl?.bandColor1 || accentColor;
                const bandColor2 = tpl?.bandColor2 || bandColor1;
                const pattern = tpl?.pattern || "none";
                return (
                  <div className="w-full">
                    <SharedCardPreview
                      design={{
                        businessName:
                          active.data?.businessName || active.data?.handle || active.data?.url || "Your Business",
                        bgColor: g1,
                        textColor,
                        accentColor,
                        cta: "Powered by Opinoor",
                        qrColor: tpl?.qrColor || "#000000",
                      }}
                      colorMode={colorMode}
                      gradient1={g1}
                      gradient2={g2}
                      accentBand1={bandColor1}
                      accentBand2={bandColor2}
                      orientation="landscape"
                      side={previewSide}
                      frontLine1={tpl?.frontLine1 || "Approach your phone to the card"}
                      frontLine2={tpl?.frontLine2 || "Tap to leave a review"}
                      backLine1={tpl?.backLine1 || "Scan the QR code with your camera"}
                      backLine2={tpl?.backLine2 || "No app needed"}
                      platform={active.platform || resolvedPlatform}
                      showGoogleIcon={tpl?.showGoogleIcon ?? true}
                      showNfcIcon={tpl?.showNfcIcon ?? true}
                      nameFontSize={tpl?.nameFontSize || 16}
                      sloganFontSize={tpl?.sloganFontSize || 12}
                      instructionFontSize={tpl?.instructionFontSize || 10}
                      nameFontWeight={tpl?.nameFontWeight || "700"}
                      sloganFontWeight={tpl?.sloganFontWeight || "400"}
                      instructionFontWeight={tpl?.instructionFontWeight || "400"}
                      nameLetterSpacing={tpl?.nameLetterSpacing || "normal"}
                      sloganLetterSpacing="normal"
                      instructionLetterSpacing="normal"
                      nameLineHeight={tpl?.nameLineHeight || "1.2"}
                      sloganLineHeight="1.4"
                      instructionLineHeight="1.4"
                      nameTextAlign={tpl?.nameTextAlign || "left"}
                      sloganTextAlign="left"
                      instructionTextAlign="left"
                      nameTextTransform={tpl?.nameTextTransform || "none"}
                      sloganTextTransform="none"
                      qrSize={tpl?.qrSize || 80}
                      qrPosition={tpl?.qrPosition || "right"}
                      logoPosition={tpl?.logoPosition || "left"}
                      logoSize={tpl?.logoSize || 32}
                      googleIconSize={tpl?.googleIconSize || 20}
                      nfcIconSize={tpl?.nfcIconSize || 24}
                      checkStrokeWidth={tpl?.checkStrokeWidth || 3.5}
                      starsColor={tpl?.starsColor || "#FBBF24"}
                      iconsColor={tpl?.iconsColor || "#22C55E"}
                      textShadow={tpl?.textShadow || "none"}
                      ctaPaddingTop={tpl?.ctaPaddingTop ?? 8}
                      frontBandHeight={tpl?.frontBandHeight || 22}
                      backBandHeight={tpl?.backBandHeight || 12}
                      bandPosition={previewUsesTemplate ? templateBandPosition : "hidden"}
                      pattern={pattern}
                    />
                  </div>
                );
              })()}
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
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100"
            >
              <Save className="w-4 h-4 mr-2" />
              <span className="truncate">Save</span>
            </Button>
            <Button
              onClick={handleSaveAddToCart}
              disabled={!isValid || saving}
              className="gradient-primary text-primary-foreground"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              <span className="truncate">{resolvedEditId ? "Save Changes" : "Add to Cart"}</span>
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
                <Button
                  variant="outline"
                  className="border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100"
                  onClick={() => setConfirmExit(false)}
                >
                  Keep editing
                </Button>
                <Button variant="destructive" onClick={confirmedClose}>
                  Exit anyway
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// LocationEditor (inchangé)
// ─────────────────────────────────────────────────────────────
const LocationEditor = ({
  location,
  onChange,
  onInc,
  onDec,
  onRemove,
  canRemove,
  canIncrease,
  fixedPlatform,
  defaultCardColor,
}) => {
  const platforms = ["google", "facebook", "instagram", "custom"];
  const platform = location.platform || fixedPlatform || "google";
  const meta = PLATFORM_META[platform] || PLATFORM_META.google;
  const businessMeta = PLATFORM_META.google;
  const resolvedCardColor = location.cardColor || defaultCardColor || "#0A0A0A";

  const inputValue =
    platform === "google"
      ? location.data?.businessName || ""
      : platform === "instagram"
      ? location.data?.handle || ""
      : location.data?.url || "";

  const setInput = (value) => {
    if (platform === "google") onChange({ data: { ...location.data, businessName: value } });
    else if (platform === "instagram") onChange({ data: { ...location.data, handle: value } });
    else onChange({ data: { ...location.data, url: value } });
  };

  return (
    <div className="space-y-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div>
        <Label className="text-xs uppercase tracking-wider text-neutral-400">Platform</Label>
        <div className="mt-2 space-y-2">
          <select
            value={platform}
            onChange={(e) => onChange({ platform: e.target.value, data: {} })}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 outline-none transition focus:border-primary"
          >
            {platforms.map((id) => (
              <option key={id} value={id}>
                {PLATFORM_META[id]?.name || id}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-400">
            Default product platform: <span className="text-neutral-200">{PLATFORM_META[fixedPlatform || "google"]?.name || fixedPlatform || "Google Reviews"}</span>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-neutral-100">{businessMeta.title}</h4>
        <Label htmlFor={`platform-input-${platform}`} className="text-xs text-neutral-300">
          {businessMeta.inputLabel}
        </Label>
        <Input
          key={platform}
          id={`platform-input-${platform}`}
          value={inputValue}
          onChange={(e) => setInput(e.target.value)}
          placeholder={businessMeta.placeholder}
          className="bg-neutral-950 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
        />
      </div>

      {/* Color */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-neutral-400">Card color</Label>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            onClick={() => onChange({ cardColor: null })}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
              location.cardColor == null
                ? "border-primary bg-primary/10 text-primary"
                : "border-neutral-700 bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <span
              className="h-4 w-4 rounded-full border border-neutral-700"
              style={{ backgroundColor: defaultCardColor || "#0A0A0A" }}
            />
            Default color
          </button>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ cardColor: c })}
              className={`w-8 h-8 rounded-full border-2 transition ${
                resolvedCardColor.toLowerCase() === c.toLowerCase()
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
              value={resolvedCardColor}
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
          <Button
            variant="ghost"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Remove location
          </Button>
        )}
      </div>
    </div>
  );
};
