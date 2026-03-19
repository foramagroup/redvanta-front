"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye, CreditCard, Package, Sparkles, Copy, Palette, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fadeUp } from "@/lib/animations";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const fallbackImage = "/placeholder.svg";

const iconCycle = [CreditCard, Package, Sparkles, Copy, Palette];

const pickLocalizedValue = (value, lang) => {
  if (!value || typeof value !== "object") return "";
  return value[lang] || value.en || Object.values(value).find(Boolean) || "";
};

const toFeatureList = (text) => {
  if (!text) return [];
  return String(text)
    .split(/\r?\n|[.;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
};

const normalizeProduct = (product, lang) => {
  const title = pickLocalizedValue(product.title, lang) || `Product #${product.id}`;
  const slug = pickLocalizedValue(product.slug, lang);
  const description = pickLocalizedValue(product.metaDescription, lang) || pickLocalizedValue(product.seoTitle, lang);
  const features = toFeatureList(description);

  return {
    id: product.id,
    slug,
    title,
    desc: description || "No description available yet.",
    price: Number(product.price || 0),
    image: product.image || fallbackImage,
    icon: iconCycle[(product.id - 1) % iconCycle.length] || CreditCard,
    badge: product.active ? null : "Draft",
    features,
    active: Boolean(product.active),
  };
};

const Products = () => {
  const router = useRouter();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t, lang } = useLanguage();
  const [quickView, setQuickView] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/api/superadmin/products`, {
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load products");
      }

      const items = Array.isArray(payload?.data) ? payload.data : [];
      setProducts(items);
    } catch (err) {
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const catalog = useMemo(
    () => products.filter((product) => product.active).map((product) => normalizeProduct(product, lang)).filter((product) => product.slug),
    [lang, products]
  );

  const handleAdd = (product) => {
    addItem({ productName: product.title, model: "classic", quantity: 1, unitPrice: product.price, design: null });
    router.push("/cart");
  };

  return (
    <div className="bg-gradient-dark pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible" className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl font-bold md:text-5xl">
            {t("products.title")} <span className="text-gradient-red">{t("products.title_highlight")}</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg text-muted-foreground">
            {t("products.subtitle")}
          </motion.p>
        </motion.div>

        {error ? (
          <div className="mx-auto mb-8 max-w-3xl rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {error}
          </div>
        ) : null}

        <motion.div initial="hidden" animate="visible" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-full rounded-xl border border-border/50 bg-gradient-card p-8 text-center text-muted-foreground">
              Loading products...
            </div>
          ) : catalog.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border/50 bg-gradient-card p-8 text-center text-muted-foreground">
              No products available.
            </div>
          ) : catalog.map((product, index) => (
            <motion.div key={product.id} variants={fadeUp} custom={index} className="group rounded-xl border border-border/50 bg-gradient-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-secondary flex items-center justify-center overflow-hidden">
                {product.image && product.image !== fallbackImage ? (
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <product.icon size={40} className="text-primary" />
                  </div>
                )}
                {product.badge ? (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">{product.badge}</Badge>
                  </div>
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="font-display text-lg font-bold">{product.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{product.desc}</p>

                {product.features.length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {product.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star size={10} className="text-primary shrink-0" />{feature}
                      </li>
                    ))}
                  </ul>
                ) : null}



                <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/30">
                  <span className="font-display text-2xl font-bold">{formatPrice(product.price)}</span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => setQuickView(product)} className="h-8 w-8 p-0"><Eye size={14} /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleAdd(product)} className="hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                      <ShoppingCart size={14} className="mr-1" />{t("shop.add")}
                    </Button>
                    <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href={`/products/${product.slug}`}>{t("shop.view")}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Dialog open={!!quickView} onOpenChange={() => setQuickView(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/30 bg-card shadow-2xl">
          {quickView ? (
            <div>
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-card flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent z-10" />
                {quickView.image && quickView.image !== fallbackImage ? (
                  <img src={quickView.image} alt={quickView.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 z-20">
                    <quickView.icon size={48} className="text-primary" />
                  </div>
                )}
                {quickView.badge ? (
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm">{quickView.badge}</Badge>
                  </div>
                ) : null}
              </div>
              <div className="p-6 space-y-4">
                <h2 className="font-display text-2xl font-bold">{quickView.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{quickView.desc}</p>
                {quickView.features.length > 0 ? (
                  <ul className="space-y-2">
                    {quickView.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground"><Star size={12} className="text-primary" />{feature}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="font-display text-3xl font-bold">{formatPrice(quickView.price)}</span>
                  <Button onClick={() => { handleAdd(quickView); setQuickView(null); }} className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                    <ShoppingCart size={14} className="mr-1" />{t("shop.add_to_cart")}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
