"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Copy, Palette, Package, CreditCard, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeUp } from "@/lib/animations";

const upsells = [
  { icon: Package, title: "Premium Table Stand", desc: "Elegant acrylic stand to display your card at reception or checkout counter.", longDesc: "Crafted from high-quality clear acrylic, the Premium Table Stand elegantly displays your Opinoor Smart Review Card at your reception desk, checkout counter, or any customer-facing area.", price: 39, badge: null },
  { icon: Sparkles, title: "QR Sticker Pack (10x)", desc: "Waterproof vinyl stickers with your unique QR code for windows, receipts, and packaging.", longDesc: "A set of 10 premium waterproof vinyl stickers featuring your unique QR code. Apply them to windows, receipts, packaging, menus, or any surface.", price: 19, badge: null },
  { icon: CreditCard, title: "Premium Card Upgrade", desc: "Upgrade your card to the Premium model with metallic finish and enhanced durability.", longDesc: "Elevate your review collection experience with the Premium Card Upgrade. Features a luxurious metallic finish, enhanced NFC chip range, and superior scratch-resistant coating.", price: 20, badge: "Popular" },
  { icon: Copy, title: "Duplicate Card (Different Color)", desc: "Create a color variant of your existing design. Both cards linked to the same location.", longDesc: "Order an additional Smart Review Card in a different color while keeping it linked to your existing location profile.", price: 24, badge: null },
  { icon: Palette, title: "NFC + QR Bundle", desc: "Get a Smart Review Card + Table Stand + 10 QR Stickers at 20% off.", longDesc: "The ultimate review collection bundle. Includes one Smart Review Card, one Premium Table Stand, and a pack of 10 QR Stickers — all at 20% off.", price: 69, badge: "-20%", originalPrice: 87 },
];

const CrossSell = () => {
  const router = useRouter();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [previewItem, setPreviewItem] = useState(null);

  const handleAdd = (upsell) => {
    addItem({ productName: upsell.title, model: "classic", quantity: 1, unitPrice: upsell.price, design: null, isBundle: !!upsell.badge?.includes("%"), bundleLabel: upsell.badge || undefined });
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
          <motion.h1 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
            {t("cross.title_1")} <span className="text-gradient-red">{t("cross.title_2")}</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground">{t("cross.subtitle")}</motion.p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {upsells.map((item, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} className="group rounded-xl border border-border/50 bg-gradient-card p-6 transition-all hover:border-primary/30">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><item.icon size={20} className="text-primary" /></div>
                {item.badge && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">{item.badge}</Badge>}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold">{formatPrice(item.price)}</span>
                  {"originalPrice" in item && item.originalPrice && <span className="text-sm text-muted-foreground line-through">{formatPrice(item.originalPrice)}</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="ghost" onClick={() => setPreviewItem(item)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"><Eye size={14} /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleAdd(item)} className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"><Plus size={14} className="mr-1" /> {t("shop.add")}</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="mt-12 flex flex-col items-center gap-4">
          <Button size="lg" className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 px-12" onClick={() => router.push("/checkout")}>{t("shop.continue_checkout")}</Button>
          <button onClick={() => router.push("/cart")} className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("shop.back_to_cart")}</button>
        </motion.div>
      </div>

      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/30 bg-card shadow-2xl">
          {previewItem && (
            <div className="relative">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary to-card flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent z-10" />
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20"><previewItem.icon size={48} className="text-primary" /></div>
                {previewItem.badge && <div className="absolute top-4 right-4 z-20"><Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">{previewItem.badge}</Badge></div>}
              </div>
              <div className="p-6 space-y-4">
                <div><h2 className="font-display text-2xl font-bold">{previewItem.title}</h2><p className="mt-3 text-sm text-muted-foreground leading-relaxed">{previewItem.longDesc}</p></div>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold">{formatPrice(previewItem.price)}</span>
                    {"originalPrice" in previewItem && previewItem.originalPrice && <span className="text-base text-muted-foreground line-through">{formatPrice(previewItem.originalPrice)}</span>}
                  </div>
                  <Button onClick={() => { handleAdd(previewItem); setPreviewItem(null); }} className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 px-6"><Plus size={14} className="mr-1" /> {t("shop.add_to_cart")}</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrossSell;
