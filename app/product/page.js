"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap, Smartphone, Shield, Star, CreditCard, MapPin,
  Minus, Plus, ShoppingCart, Lock, Truck, Play,
  Wifi, QrCode, ArrowRight, CheckCircle2, MessageSquare,
  NfcIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { fadeUp } from "@/lib/animations";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

const PRICE_PER_CARD = 29;
const defaultSmartCardImg = "/assets/smart-card-mockup.png";
const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const defaultBundles = [
  { qty: 1, label: "1 Card", price: 29, savingsUsd: 0 },
  { qty: 10, label: "10 Cards", price: 249, savingsUsd: 41 },
  { qty: 25, label: "25 Cards", price: 549, savingsUsd: 176 },
  { qty: 50, label: "50 Cards", price: 999, savingsUsd: 451 },
];

const defaultProducts = [
  {
    id: null,
    title: "Smart Review Card",
    image: defaultSmartCardImg,
    bundles: defaultBundles,
  },
];



const benefits = [
  { icon: Zap, title: "Instant Customer Action", desc: "One tap triggers the review flow — zero friction, zero hesitation." },
  { icon: Smartphone, title: "Frictionless Experience", desc: "No apps to download. Works natively on all modern smartphones." },
  { icon: Shield, title: "Protect Your Reputation", desc: "Negative feedback is intercepted privately before it goes public." },
  { icon: Star, title: "Boost 5-Star Reviews", desc: "Satisfied customers are redirected straight to Google, Yelp, and more." },
  { icon: CreditCard, title: "Elegant Physical Design", desc: "Premium matte black magnetic card that elevates your brand image." },
  { icon: MapPin, title: "Multi-Location Compatible", desc: "Each card links to a specific location in your Opinoor dashboard." },
];

const steps = [
  { num: "01", title: "Tap or Scan", desc: "Customer taps their phone on the NFC chip or scans the QR code on the card." },
  { num: "02", title: "Smart Modal Opens", desc: "A branded review modal instantly opens in their browser — no app needed." },
  { num: "03", title: "Intelligent Routing", desc: "Happy? → Redirected to public review platform. Unhappy? → Private feedback form." },
];

const testimonials = [
  { name: "Marcus Chen", role: "Owner, 3 Locations", quote: "We went from 3.8 to 4.7 stars in 4 months. The NFC cards make it effortless for customers.", stars: 5 },
  { name: "Sarah Williams", role: "Marketing Director", quote: "The review volume tripled after deploying Opinoor cards at our front desk. Game changer.", stars: 5 },
  { name: "James Rodriguez", role: "Franchise Operator", quote: "Managing reviews across 12 locations used to be chaos. Now it's fully automated.", stars: 5 },
  { name: "Dr. Emily Park", role: "Dental Practice Owner", quote: "Patients love the simplicity. One tap and they leave a review before even reaching their car.", stars: 5 },
];

const faqs = [
  { q: "Do I need an app?", a: "No. The NFC tap or QR scan opens a mobile-optimized review page directly in your customer's browser. No downloads required." },
  { q: "Is NFC compatible with all phones?", a: "NFC works on all iPhones (iPhone 7 and later) and virtually all modern Android devices. For older phones, the QR code provides the same experience." },
  { q: "What if a customer doesn't have NFC enabled?", a: "Every Opinoor card includes a QR code as a fallback. Customers simply scan it with their phone camera for the exact same experience." },
  { q: "Can I order multiple cards?", a: "Absolutely. We offer bulk pricing with significant discounts at 10, 25, and 50+ cards. Each card can be assigned to a different location." },
  { q: "Can I customize the card branding?", a: "Yes. Custom branding is available for orders of 25+ cards. Contact our team for design options and pricing." },
  { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout for an additional fee." },
  { q: "Is there a subscription required?", a: "Access to the Opinoor dashboard is included with your card purchase. Your account remains active as long as you have active cards." },
  { q: "How do I connect the card to my location?", a: "After purchase, you'll receive a setup link. Simply log into your dashboard, scan the card's unique code, and assign it to your location in seconds." },
];

const Product = () => {
  const [products, setProducts] = useState(defaultProducts);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [selectedBundle, setSelectedBundle] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const activeProduct = products[selectedProduct] || products[0] || defaultProducts[0];
  const bundles = activeProduct?.bundles?.length ? activeProduct.bundles : defaultBundles;
  const productImage = activeProduct?.image || defaultSmartCardImg;
  const productId = activeProduct?.id || null;
  const productTitle = activeProduct?.title || "Smart Review Card";
  const currentBundle = bundles[selectedBundle] || bundles[0] || defaultBundles[0];
  const totalPrice = selectedBundle === 0 ? quantity * PRICE_PER_CARD : currentBundle.price;
  const totalQty = selectedBundle === 0 ? quantity : currentBundle.qty;
  const isProductReady = !!productId && !!currentBundle?.id;

  const handleAddToCart = async () => {
    if (!isProductReady) return;
    await addItem({
      productId,
      packageTierId: currentBundle?.id || null,
      productName: `${productTitle}${totalQty > 1 ? ` (${totalQty}-pack)` : ""}`,
      model: "classic",
      quantity: totalQty,
      unitPrice: totalPrice / totalQty,
      design: null,
    });
  };

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadShopDetails = async () => {
      try {
        const res = await fetch(`${apiBase}/api/client/shop-details`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load shop details");

        const payload = await res.json();
        if (cancelled) return;

        if (Array.isArray(payload?.products) && payload.products.length > 0) {
          setProducts(
            payload.products.map((product) => ({
              ...product,
              image: product.image?.startsWith("/uploads/")
                ? `${apiBase}${product.image}`
                : (product.image || defaultSmartCardImg),
            }))
          );
          setSelectedProduct(0);
          setSelectedBundle(0);
          setQuantity(1);
          return;
        }

        if ((payload?.productId || payload?.title || payload?.image) && Array.isArray(payload?.bundles) && payload.bundles.length > 0) {
          setProducts([
            {
              id: payload.productId ?? null,
              title: payload.title || "Smart Review Card",
              image: payload.image?.startsWith("/uploads/")
                ? `${apiBase}${payload.image}`
                : (payload.image || defaultSmartCardImg),
              bundles: payload.bundles,
            },
          ]);
          setSelectedProduct(0);
          setSelectedBundle(0);
          setQuantity(1);
        }
      } catch {
        if (!cancelled) {
          setProducts(defaultProducts);
          setSelectedProduct(0);
          setSelectedBundle(0);
          setQuantity(1);
        }
      }
    };

    loadShopDetails();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-gradient-dark pt-32">
      {/* Sticky Add to Cart */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: isSticky ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-[110px] left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl"
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <img src={productImage} alt="Opinoor Card" className="h-10 w-auto rounded" />
            <div>
              <p className="text-sm font-semibold">{productTitle}</p>
              <p className="text-xs text-muted-foreground">{totalQty} {totalQty === 1 ? "card" : "cards"} — {formatPrice(totalPrice)}</p>
            </div>
          </div>
          <Button
            className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddToCart}
            disabled={!isProductReady}
          >
            <ShoppingCart size={16} className="mr-2" /> {t("shop.add_to_cart")}
          </Button>
        </div>
      </motion.div>

      {/* HERO */}
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <motion.div initial="hidden" animate="visible">
              <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <CreditCard size={14} className="text-primary" />
                <span className="text-xs font-medium text-primary">Physical Product — No Demo Access</span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Turn Every Customer Interaction Into a{" "}
                <span className="text-gradient-red">5-Star Opportunity.</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
                Opinoor Smart Review Cards instantly open a feedback modal via NFC or QR scan — no apps, no friction.
              </motion.p>

              {products.length > 1 && (
                <motion.div variants={fadeUp} custom={3} className="mt-10">
                  <p className="text-sm font-medium text-muted-foreground mb-3">{t("shop.select_product") || "Select product"}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {products.map((product, i) => (
                      <button
                        key={product.id ?? i}
                        onClick={() => {
                          setSelectedProduct(i);
                          setSelectedBundle(0);
                          setQuantity(1);
                        }}
                        className={`relative rounded-lg border p-3 text-left transition-all ${
                          selectedProduct === i
                            ? "border-primary/50 bg-primary/10 glow-red-sm"
                            : "border-border/50 bg-secondary hover:border-border"
                        }`}
                      >
                        <span className="text-sm font-semibold">{product.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Bundle Selector */}
              <motion.div variants={fadeUp} custom={products.length > 1 ? 4 : 3} className="mt-10">
                <p className="text-sm font-medium text-muted-foreground mb-3">{t("shop.select_package")}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {bundles.map((b, i) => (
                    <button
                      key={b.id ?? i}
                      onClick={() => { setSelectedBundle(i); if (i === 0) setQuantity(1); }}
                      className={`relative rounded-lg border p-3 text-left transition-all ${
                        selectedBundle === i
                          ? "border-primary/50 bg-primary/10 glow-red-sm"
                          : "border-border/50 bg-secondary hover:border-border"
                      }`}
                    >
                      <span className="text-sm font-semibold">{b.label}</span>
                      <span className="block text-lg font-bold mt-1">{formatPrice(b.price)}</span>
                      {b.savingsUsd > 0 && (
                        <span className="block text-xs text-primary mt-0.5">{t("shop.save")} {formatPrice(b.savingsUsd)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>


              {/* Quantity (single card only) */}
              {selectedBundle === 0 && (
                <motion.div variants={fadeUp} custom={products.length > 1 ? 5 : 4} className="mt-6 flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{t("shop.qty")}</span>
                  <div className="flex items-center gap-0 rounded-lg border border-border/50 bg-secondary overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-muted transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-2xl font-bold font-display">{formatPrice(totalPrice)}</span>
                </motion.div>
              )}

              <motion.div variants={fadeUp} custom={products.length > 1 ? 6 : 5} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                 <Button
                   size="lg"
                   className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8"
                   onClick={handleAddToCart}
                   disabled={!isProductReady}
                 >
                   <ShoppingCart size={18} className="mr-2" /> {t("shop.add_to_cart")} — {formatPrice(totalPrice)}
                 </Button>
                 <div className="flex items-center gap-4 text-xs text-muted-foreground">
                   <span className="flex items-center gap-1"><Lock size={12} /> {t("shop.secure_checkout")}</span>
                   <span className="flex items-center gap-1"><Truck size={12} /> {t("shop.ships_5_7")}</span>
                 </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-72 w-72 rounded-full bg-primary/15 blur-[100px]" />
              </div>
              <img
                src={productImage}
                alt="Opinoor Smart Review Card — NFC-enabled magnetic card"
                className="relative z-10 w-full max-w-lg rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Description */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
              The Smartest Way to <span className="text-gradient-red">Capture Reviews.</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-6 text-muted-foreground leading-relaxed">
              The Opinoor Smart Review Card is a premium, NFC-enabled magnetic card that works on all modern smartphones. No app download required. When a customer taps or scans, an intelligent review modal opens instantly in their browser — fully connected to your Opinoor dashboard for real-time monitoring and control.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { icon: Wifi, title: "NFC-Enabled", desc: "Embedded chip for instant tap-to-review on any modern smartphone." },
              { icon: QrCode, title: "QR Fallback", desc: "Universal QR code ensures compatibility with every device." },
              { icon: CreditCard, title: "Premium Build", desc: "Matte black magnetic card with a weight and finish that feels elite." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="rounded-xl border border-border/50 bg-gradient-card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon size={24} className="text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-center md:text-4xl">
            Why Businesses <span className="text-gradient-red">Choose Opinoor</span>
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="group rounded-xl border border-border/50 bg-gradient-card p-6 transition-all hover:border-primary/30 hover:glow-red-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <b.icon size={20} className="text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
              From Scan to Review <span className="text-gradient-red">in Seconds.</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="relative text-center">
                <span className="font-display text-6xl font-bold text-primary/15">{s.num}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight size={20} className="absolute -right-4 top-8 hidden text-primary/30 md:block" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How NFC Works */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2 max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
                How <span className="text-gradient-red">NFC Technology</span> Works.
              </motion.h2>
              <motion.div variants={fadeUp} custom={1} className="mt-8 space-y-5">
                {[
                  "NFC = Near Field Communication — a secure wireless standard.",
                  "No app required — works natively on iPhone (7+) and Android.",
                  "Customer simply taps their phone on the card's NFC chip.",
                  "A secure, branded review link opens instantly in their browser.",
                  "The entire process takes less than 2 seconds.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
                Prefer Scanning? <span className="text-gradient-red">Use The QR Code.</span>
              </motion.h2>
              <motion.div variants={fadeUp} custom={1} className="mt-8 space-y-5">
                {[
                  "Open your phone's camera and point it at the QR code.",
                  "Automatic browser redirect — no extra steps.",
                  "Same smart review modal opens instantly.",
                  "Works universally on any smartphone with a camera.",
                  "Both NFC and QR deliver the exact same seamless experience.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-center md:text-4xl">
            See It <span className="text-gradient-red">In Action.</span>
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {[
              { title: "Product Demo", desc: "See the Smart Review Card in action" },
              { title: "NFC Scan Example", desc: "Watch how simple the tap experience is" },
              { title: "Dashboard Integration", desc: "How reviews flow into your dashboard" },
              { title: "Client Testimonial", desc: "Real business results with Opinoor" },
            ].map((v, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="group cursor-pointer rounded-xl border border-border/50 bg-gradient-card overflow-hidden transition-all hover:border-primary/30">
                <div className="relative flex h-48 items-center justify-center bg-secondary">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 transition-transform group-hover:scale-110">
                    <Play size={28} className="text-primary ml-1" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-center md:text-4xl">
            Trusted by <span className="text-gradient-red">Growth-Focused Businesses.</span>
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="rounded-xl border border-border/50 bg-gradient-card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={14} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-4 border-t border-border/30 pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Access Clarification */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl rounded-xl border border-primary/30 bg-primary/5 p-8 md:p-12 text-center glow-red">
            <motion.div variants={fadeUp} custom={0} className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-6">
              <Lock size={24} className="text-primary" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-2xl font-bold md:text-3xl">
              Access Is Activated By Purchase
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-muted-foreground leading-relaxed">
              There is no free demo or trial. Your Opinoor dashboard access is unlocked the moment you purchase your first Smart Review Card. The physical card is your entry point into the full reputation domination ecosystem.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="font-display text-3xl font-bold text-center md:text-4xl mb-12">
            Frequently Asked <span className="text-gradient-red">Questions</span>
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}>
                  <AccordionItem value={`faq-${i}`} className="border-border/30">
                    <AccordionTrigger className="text-left font-display hover:no-underline hover:text-primary">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-spacing border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-4xl font-bold md:text-5xl">
              Control Every <span className="text-gradient-red">Review Opportunity.</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg text-muted-foreground">
              One tap is all it takes.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8">
              <Button size="lg" className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 py-6">
                <ShoppingCart size={18} className="mr-2" /> {t("shop.add_to_cart")} — {formatPrice(totalPrice)}
               </Button>
               <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-4">
                 <span className="flex items-center gap-1"><Lock size={12} /> {t("shop.secure_checkout")}</span>
                 <span className="flex items-center gap-1"><Truck size={12} /> {t("shop.ships_5_7")}</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Product;
