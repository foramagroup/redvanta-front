"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Palette, Minus, Plus, ShoppingCart, Lock, Truck, CreditCard, Package, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductGallery } from "@/components/ProductGallery";
import { fadeUp } from "@/lib/animations";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Demo gallery images
const GALLERY_IMAGES = [
  "/placeholder.svg",
  "/placeholder.svg",
];

const PRICE = 69;
const ORIGINAL = 87;
const includes = [
  { icon: CreditCard, title: "1× Smart Review Card", desc: "NFC + QR enabled premium card" },
  { icon: Package, title: "1× Premium Table Stand", desc: "Acrylic display stand for your card" },
  { icon: Sparkles, title: "10× QR Stickers", desc: "Waterproof vinyl stickers" },
];
const benefits = [
  { icon: CheckCircle2, title: "Complete Coverage", desc: "Cover every customer touchpoint — counter, window, packaging, and more." },
  { icon: Palette, title: "20% Savings", desc: "Save $18 compared to buying each item separately." },
  { icon: Sparkles, title: "Everything Included", desc: "One order, one setup. Everything you need to start collecting reviews." },
];
const faqs = [
  { q: "What's included in the bundle?", a: "1 Smart Review Card, 1 Premium Table Stand, and 10 QR Stickers — all linked to the same review profile." },
  { q: "How much do I save?", a: "You save $18 (20%) compared to purchasing each item separately ($87 vs $69)." },
  { q: "Can I customize the card in the bundle?", a: "Yes, you'll go through the same customization flow during checkout." },
];

const NfcQrBundle = () => {
  const [quantity, setQuantity] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const totalPrice = quantity * PRICE;

  const handleAddToCart = () => {
    addItem({ productName: "NFC + QR Bundle", model: "classic", quantity, unitPrice: PRICE, design: null, isBundle: true, bundleLabel: "-20%" });
    router.push("/cart");
  };

  useEffect(() => { const h = () => setIsSticky(window.scrollY > 400); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);

  return (
    <div className="bg-gradient-dark pt-32">
      <motion.div initial={{ y: -100 }} animate={{ y: isSticky ? 0 : -100 }} transition={{ duration: 0.3 }} className="fixed top-[110px] left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Palette size={20} className="text-primary" /></div>
            <div><p className="text-sm font-semibold">NFC + QR Bundle</p><p className="text-xs text-muted-foreground">{quantity} × {formatPrice(PRICE)}</p></div>
          </div>
          <Button className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddToCart}><ShoppingCart size={16} className="mr-2" />{t("shop.add_to_cart")}</Button>
        </div>
      </motion.div>

      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div initial="hidden" animate="visible">
              <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <Badge className="bg-primary text-primary-foreground">-20%</Badge>
                <span className="text-xs font-medium text-primary">Best Value Bundle</span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">NFC + QR <span className="text-gradient-red">Bundle</span></motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">The ultimate review collection bundle — Smart Card + Table Stand + 10 QR Stickers at 20% off.</motion.p>
              
              {/* What's Included */}
              <motion.div variants={fadeUp} custom={3} className="mt-8 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{t("shop.whats_included")}</p>
                {includes.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/30">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center"><item.icon size={16} className="text-primary" /></div>
                    <div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="mt-8 flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{t("shop.qty")}</span>
                <div className="flex items-center rounded-lg border border-border/50 bg-secondary overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted"><Minus size={16} /></button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-muted"><Plus size={16} /></button>
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-bold font-display">{formatPrice(totalPrice)}</span>
                   <span className="text-sm text-muted-foreground line-through">{formatPrice(quantity * ORIGINAL)}</span>
                </div>
              </motion.div>
              <motion.div variants={fadeUp} custom={5} className="mt-8 flex flex-col gap-3 sm:flex-row">
                 <Button size="lg" className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8" onClick={handleAddToCart}><ShoppingCart size={18} className="mr-2" />{t("shop.add_to_cart")} — {formatPrice(totalPrice)}</Button>
                 <div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Lock size={12} />{t("shop.secure")}</span><span className="flex items-center gap-1"><Truck size={12} />{t("shop.ships_5_7_short")}</span></div>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
              <div className="absolute -inset-4 flex items-center justify-center pointer-events-none"><div className="h-72 w-72 rounded-full bg-primary/15 blur-[100px]" /></div>
              <div className="relative z-10">
                <ProductGallery images={GALLERY_IMAGES} productName="NFC + QR Bundle" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-spacing border-t border-border/30"><div className="container mx-auto px-6">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl font-bold text-center md:text-4xl">Why the <span className="text-gradient-red">Bundle</span></motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {benefits.map((b, i) => (<motion.div key={i} variants={fadeUp} custom={i} className="rounded-xl border border-border/50 bg-gradient-card p-6 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><b.icon size={24} className="text-primary" /></div><h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3><p className="mt-2 text-sm text-muted-foreground">{b.desc}</p></motion.div>))}
        </motion.div>
      </div></section>

      <section className="section-spacing border-t border-border/30"><div className="container mx-auto px-6">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl font-bold text-center md:text-4xl mb-12">FAQ</motion.h2>
        <div className="mx-auto max-w-3xl"><Accordion type="single" collapsible>{faqs.map((f, i) => (<AccordionItem key={i} value={`faq-${i}`} className="border-border/30"><AccordionTrigger className="text-left font-display hover:no-underline hover:text-primary">{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{f.a}</AccordionContent></AccordionItem>))}</Accordion></div>
      </div></section>

      <section className="section-spacing border-t border-border/30"><div className="container mx-auto px-6 text-center">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold md:text-5xl">Get the Complete <span className="text-gradient-red">Kit.</span></motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="mt-8">
          <Button size="lg" className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 py-6" onClick={handleAddToCart}><ShoppingCart size={18} className="mr-2" />{t("shop.add_to_cart")} — {formatPrice(totalPrice)}</Button>
        </motion.div>
      </div></section>
    </div>
  );
};

export default NfcQrBundle;
