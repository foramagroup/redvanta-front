"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Package, Minus, Plus, ShoppingCart, Lock, Truck, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductGallery } from "@/components/ProductGallery";
import { fadeUp } from "@/lib/animations";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useClientProduct } from "@/hooks/useClientProduct";

const PRODUCT_SLUG = "premium-table-stand";
const FALLBACK_PRODUCT = {
  slug: PRODUCT_SLUG,
  title: "Premium Table Stand",
  description: "Elegant acrylic stand designed to showcase your smart review card at reception desks and checkout counters.",
  price: 39,
  gallery: [
    "/placeholder.svg",
    { url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", type: "video", poster: "/placeholder.svg" },
    "/placeholder.svg",
    "/placeholder.svg",
  ],
};

const benefits = [
  { icon: Star, title: "Premium Visibility", desc: "Position your review card at the most visible point for maximum customer engagement." },
  { icon: Package, title: "Elegant Design", desc: "Clear acrylic with a minimal aesthetic that complements any business decor." },
  { icon: CheckCircle2, title: "Sturdy & Durable", desc: "Built to last with high-quality acrylic that resists scratches and yellowing." },
];
const steps = [
  { num: "01", title: "Place Card", desc: "Insert your smart review card into the premium stand." },
  { num: "02", title: "Position at Checkout", desc: "Place the stand at your reception, counter, or checkout area." },
  { num: "03", title: "Collect Reviews", desc: "Customers tap or scan directly from the displayed card." },
];
const faqs = [
  { q: "What size cards does it fit?", a: "The stand fits standard credit card sized NFC cards, including all smart review cards." },
  { q: "Is it stable on surfaces?", a: "Yes, the stand has a weighted base with anti-slip pads for stability on any flat surface." },
  { q: "Can I use it with multiple cards?", a: "The stand holds one card at a time. Order multiple stands for different locations or card designs." },
];

const PremiumTableStand = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t, lang } = useLanguage();
  const { product, loading, error } = useClientProduct(PRODUCT_SLUG, lang, FALLBACK_PRODUCT);
  const packageTiers = product.packageTiers || [];
  const selectedPackage = packageTiers[selectedPackageIndex] || null;
  const totalQty = selectedPackage?.qty || quantity;
  const unitPrice = selectedPackage?.price || product.price;
  const totalPrice = selectedPackage?.lineTotal || quantity * product.price;
  const resolvedPackageTierId = selectedPackage?.id || product.packageTierId || undefined;
  const canAddToCart = !loading && (!product.id || !!resolvedPackageTierId);

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    await addItem({
      productId: product.id || undefined,
      packageTierId: resolvedPackageTierId,
      productName: product.title,
      model: "classic",
      quantity: totalQty,
      unitPrice,
      lineTotal: totalPrice,
      design: null,
    });
    router.push("/cart");
  };

  useEffect(() => {
    setSelectedPackageIndex(0);
  }, [product.id]);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-dark pt-32">
      <motion.div initial={{ y: -100 }} animate={{ y: isSticky ? 0 : -100 }} transition={{ duration: 0.3 }} className="fixed left-0 right-0 top-[110px] z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Package size={20} className="text-primary" /></div>
            <div>
              <p className="text-sm font-semibold">{product.title}</p>
              <p className="text-xs text-muted-foreground">{selectedPackage ? `${totalQty} cards - ${formatPrice(totalPrice)}` : `${quantity} x ${formatPrice(product.price)}`}</p>
            </div>
          </div>
          <Button className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddToCart} disabled={!canAddToCart}>
            <ShoppingCart size={16} className="mr-2" />{t("shop.add_to_cart")}
          </Button>
        </div>
      </motion.div>

      <section className="section-spacing">
        <div className="container mx-auto px-6">
          {error ? <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div initial="hidden" animate="visible">
              <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">{product.title}</motion.h1>
              <motion.p variants={fadeUp} custom={1} className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{product.description}</motion.p>
              <motion.div variants={fadeUp} custom={2} className="mt-8 flex items-center gap-4">
                {packageTiers.length ? (
                  <div className="w-full space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">{t("shop.select_package")}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {packageTiers.map((tier, index) => (
                        <button
                          key={tier.id ?? index}
                          onClick={() => setSelectedPackageIndex(index)}
                          className={`rounded-lg border p-3 text-left transition-all ${
                            selectedPackageIndex === index
                              ? "border-primary/50 bg-primary/10 glow-red-sm"
                              : "border-border/50 bg-secondary hover:border-border"
                          }`}
                        >
                          <span className="text-sm font-semibold">{tier.label}</span>
                          <span className="mt-1 block text-lg font-bold">{formatPrice(tier.lineTotal)}</span>
                          <span className="block text-xs text-muted-foreground">{formatPrice(tier.price)} / card</span>
                        </button>
                      ))}
                    </div>
                    <span className="block font-display text-2xl font-bold">{formatPrice(totalPrice)}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">{t("shop.qty")}</span>
                    <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-border/50 bg-secondary">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 transition-colors hover:bg-muted"><Minus size={16} /></button>
                      <span className="min-w-[3rem] px-4 py-2 text-center text-sm font-semibold">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 transition-colors hover:bg-muted"><Plus size={16} /></button>
                    </div>
                    <span className="font-display text-2xl font-bold">{formatPrice(totalPrice)}</span>
                  </>
                )}
              </motion.div>
              <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="glow-red-hover bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90" onClick={handleAddToCart} disabled={!canAddToCart}>
                  <ShoppingCart size={18} className="mr-2" />{t("shop.add_to_cart")} - {formatPrice(totalPrice)}
                </Button>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Lock size={12} /> {t("shop.secure")}</span>
                  <span className="flex items-center gap-1"><Truck size={12} /> {t("shop.ships_5_7")}</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
              <div className="pointer-events-none absolute -inset-4 flex items-center justify-center"><div className="h-72 w-72 rounded-full bg-primary/15 blur-[100px]" /></div>
              <div className="relative z-10"><ProductGallery images={product.gallery} productName={product.title} /></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center font-display text-3xl font-bold md:text-4xl">Why Choose This <span className="text-gradient-red">Stand</span></motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={fadeUp} custom={index} className="rounded-xl border border-border/50 bg-gradient-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><benefit.icon size={24} className="text-primary" /></div>
                <h3 className="mt-4 font-display text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center font-display text-3xl font-bold md:text-4xl">How It <span className="text-gradient-red">Works</span></motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div key={index} variants={fadeUp} custom={index} className="relative text-center">
                <span className="font-display text-6xl font-bold text-primary/15">{step.num}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{step.desc}</p>
                {index < steps.length - 1 ? <ArrowRight size={20} className="absolute -right-4 top-8 hidden text-primary/30 md:block" /> : null}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 text-center font-display text-3xl font-bold md:text-4xl">Frequently Asked <span className="text-gradient-red">Questions</span></motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-border/30">
                  <AccordionTrigger className="text-left font-display hover:text-primary hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl font-bold md:text-5xl">Display Your Card <span className="text-gradient-red">Proudly.</span></motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="mt-8">
            <Button size="lg" className="glow-red-hover bg-primary px-10 py-6 text-base text-primary-foreground hover:bg-primary/90" onClick={handleAddToCart} disabled={!canAddToCart}>
              <ShoppingCart size={18} className="mr-2" />{t("shop.add_to_cart")} - {formatPrice(totalPrice)}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PremiumTableStand;
