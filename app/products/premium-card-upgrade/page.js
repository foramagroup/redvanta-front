"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CreditCard, Minus, Plus, ShoppingCart, Lock, Truck, Star, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/ProductGallery";
import { fadeUp } from "@/lib/animations";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

const GALLERY_IMAGES = ["/placeholder.svg", "/placeholder.svg"];

const PRICE = 20;
const benefits = [
  { icon: Star, title: "Metallic Finish", desc: "Luxurious metallic sheen that leaves a lasting premium impression on every customer." },
  { icon: Zap, title: "Enhanced NFC Range", desc: "Extended NFC chip range for faster, more reliable tap recognition." },
  { icon: Shield, title: "Scratch-Resistant", desc: "Superior coating protects against daily wear, keeping your card looking new." },
];
const steps = [
  { num: "01", title: "Choose Upgrade", desc: "Select the Premium Card Upgrade during checkout or from your dashboard." },
  { num: "02", title: "Same Setup", desc: "Your premium card links to the same location and review profile." },
  { num: "03", title: "Premium Experience", desc: "Impress customers with a card that feels as premium as your service." },
];
const faqs = [
  { q: "Is this a replacement or add-on?", a: "It's an upgrade option. You'll receive a new premium-finish card that replaces your standard card while keeping the same review profile." },
  { q: "What colors are available?", a: "The Premium Card features a signature metallic black finish with subtle REDVANTA branding." },
  { q: "Does it have the same features?", a: "Yes — same NFC + QR functionality, but with enhanced NFC range and premium materials." },
];

const PremiumCardUpgrade = () => {
  const [quantity, setQuantity] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const totalPrice = quantity * PRICE;

  const handleAddToCart = () => {
    addItem({ productName: "Premium Card Upgrade", model: "premium", quantity, unitPrice: PRICE, design: null });
    router.push("/cart");
  };

  useEffect(() => { const h = () => setIsSticky(window.scrollY > 400); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);

  return (
    <div className="bg-gradient-dark pt-32">
      <motion.div initial={{ y: -100 }} animate={{ y: isSticky ? 0 : -100 }} transition={{ duration: 0.3 }} className="fixed top-[110px] left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><CreditCard size={20} className="text-primary" /></div>
            <div><p className="text-sm font-semibold">Premium Card Upgrade</p><p className="text-xs text-muted-foreground">{quantity} × {formatPrice(PRICE)}</p></div>
          </div>
          <Button className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddToCart}><ShoppingCart size={16} className="mr-2" />{t("shop.add_to_cart")}</Button>
        </div>
      </motion.div>

      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div initial="hidden" animate="visible">
              <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <CreditCard size={14} className="text-primary" /><span className="text-xs font-medium text-primary">Most Popular Upgrade</span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">Premium Card <span className="text-gradient-red">Upgrade</span></motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">Elevate your review collection with a metallic finish, enhanced NFC range, and scratch-resistant coating.</motion.p>
              <motion.div variants={fadeUp} custom={3} className="mt-8 flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{t("shop.qty")}</span>
                <div className="flex items-center rounded-lg border border-border/50 bg-secondary overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted"><Minus size={16} /></button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-muted"><Plus size={16} /></button>
                </div>
                <span className="text-2xl font-bold font-display">{formatPrice(totalPrice)}</span>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-col gap-3 sm:flex-row">
                 <Button size="lg" className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8" onClick={handleAddToCart}><ShoppingCart size={18} className="mr-2" />{t("shop.add_to_cart")} — {formatPrice(totalPrice)}</Button>
                 <div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Lock size={12} />{t("shop.secure")}</span><span className="flex items-center gap-1"><Truck size={12} />{t("shop.ships_5_7_short")}</span></div>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
              <div className="absolute -inset-4 flex items-center justify-center pointer-events-none"><div className="h-72 w-72 rounded-full bg-primary/15 blur-[100px]" /></div>
              <div className="relative z-10"><ProductGallery images={GALLERY_IMAGES} productName="Premium Card Upgrade" /></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-spacing border-t border-border/30"><div className="container mx-auto px-6">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl font-bold text-center md:text-4xl">Premium <span className="text-gradient-red">Advantages</span></motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {benefits.map((b, i) => (<motion.div key={i} variants={fadeUp} custom={i} className="rounded-xl border border-border/50 bg-gradient-card p-6 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><b.icon size={24} className="text-primary" /></div><h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3><p className="mt-2 text-sm text-muted-foreground">{b.desc}</p></motion.div>))}
        </motion.div>
      </div></section>

      <section className="section-spacing border-t border-border/30"><div className="container mx-auto px-6">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl font-bold text-center md:text-4xl">How It <span className="text-gradient-red">Works</span></motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((s, i) => (<motion.div key={i} variants={fadeUp} custom={i} className="relative text-center"><span className="font-display text-6xl font-bold text-primary/15">{s.num}</span><h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3><p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>{i < 2 && <ArrowRight size={20} className="absolute -right-4 top-8 hidden text-primary/30 md:block" />}</motion.div>))}
        </motion.div>
      </div></section>

      <section className="section-spacing border-t border-border/30"><div className="container mx-auto px-6">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl font-bold text-center md:text-4xl mb-12">FAQ</motion.h2>
        <div className="mx-auto max-w-3xl"><Accordion type="single" collapsible>{faqs.map((f, i) => (<AccordionItem key={i} value={`faq-${i}`} className="border-border/30"><AccordionTrigger className="text-left font-display hover:no-underline hover:text-primary">{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{f.a}</AccordionContent></AccordionItem>))}</Accordion></div>
      </div></section>

      <section className="section-spacing border-t border-border/30"><div className="container mx-auto px-6 text-center">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold md:text-5xl">Upgrade to <span className="text-gradient-red">Premium.</span></motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="mt-8">
          <Button size="lg" className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 py-6" onClick={handleAddToCart}><ShoppingCart size={18} className="mr-2" />{t("shop.add_to_cart")} — {formatPrice(totalPrice)}</Button>
        </motion.div>
      </div></section>
    </div>
  );
};

export default PremiumCardUpgrade;
