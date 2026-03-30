"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, AlertTriangle, CheckCircle2, Pencil, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeUp } from "@/lib/animations";
import { MODEL_LABELS } from "@/types/shop";

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal, itemCount, isCartReady, isAuthenticated } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const router = useRouter();
  const isDraftDesignBlockingCheckout = (design) =>
    !!design && design.status === "draft" && !!design.googlePlaceId;

  if (!isCartReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark pt-20">
        <div className="text-sm text-muted-foreground">Loading cart...</div>
      </div>
    );
  }

  const allValidated = items.length > 0 && items.every((i) => !isDraftDesignBlockingCheckout(i.design));
  const hasUnvalidated = items.some((i) => isDraftDesignBlockingCheckout(i.design));

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark pt-20">
        <motion.div initial="hidden" animate="visible" className="text-center">
          <motion.div variants={fadeUp} custom={0}>
            <ShoppingBag size={64} className="mx-auto text-muted-foreground/30" />
             <h1 className="mt-6 font-display text-3xl font-bold">{t("shop.cart_empty_title")}</h1>
             <p className="mt-3 text-muted-foreground">{t("shop.cart_empty_desc")}</p>
             <Link href="/product">
               <Button className="mt-8 glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90">
                 {t("shop.browse_products")}
               </Button>
             </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible">
           <motion.h1 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
             {t("shop.your_cart").split(" ")[0]} <span className="text-gradient-red">{t("shop.your_cart").split(" ").slice(1).join(" ") || t("cart.title")}</span>
           </motion.h1>
           <motion.p variants={fadeUp} custom={1} className="mt-2 text-muted-foreground">
             {itemCount} {itemCount === 1 ? t("shop.item_in_cart") : t("shop.items_in_cart")}
           </motion.p>
        </motion.div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {/* Items */}
          <motion.div initial="hidden" animate="visible" className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                custom={i}
                className="rounded-xl border border-border/50 bg-gradient-card p-4 sm:p-6"
              >
                {/* Mobile-first layout */}
                <div className="flex flex-col gap-3">
                  {/* Row 1: Product name + category + delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-display text-sm sm:text-lg font-semibold truncate">{item.productName}</h3>
                      <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                        {MODEL_LABELS[item.model]}
                      </Badge>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Row 2: Quantity + Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0 rounded-lg border border-border/50 bg-secondary overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="px-2.5 py-1.5 hover:bg-muted transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-muted transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-display text-lg sm:text-xl font-bold">{formatPrice(item.lineTotal ?? (item.unitPrice * item.quantity))}</span>
                  </div>

                  {/* Design status row (if applicable) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.design && (
                      <>
                        {item.design.status === "validated" || item.design.status === "locked" ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 size={12} className="mr-1" /> {t("cart.validated")}
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <AlertTriangle size={12} className="mr-1" /> {t("cart.draft")}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{item.design.businessName}</span>
                      </>
                    )}
                    <Link href={`/customize/${item.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Pencil size={12} className="mr-1" />
                        {item.design ? (t("cart.edit_design") || "Edit design") : t("shop.customize_design")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Summary */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <div className="sticky top-28 rounded-xl border border-border/50 bg-gradient-card p-6 space-y-6">
               <div className="flex items-center justify-between gap-3">
                 <h3 className="font-display text-lg font-semibold">{t("shop.order_summary")}</h3>
                 <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive" onClick={clearCart}>
                   <Trash2 size={14} className="mr-1" />
                   {t("cart.clear") || "Clear cart"}
                 </Button>
               </div>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                   <span className="font-semibold">{formatPrice(subtotal)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">{t("shop.shipping")}</span>
                   <span className="text-muted-foreground">{t("shop.calc_at_checkout")}</span>
                 </div>
                 <div className="border-t border-border/50 pt-3 flex justify-between">
                   <span className="font-semibold">{t("shop.estimated_total")}</span>
                   <span className="font-display text-xl font-bold">{formatPrice(subtotal)}</span>
                 </div>
               </div>

              {hasUnvalidated && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-400">{t("cart.validate_warning")}</p>
                </div>
              )}

              <Button
                className="w-full glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!allValidated}
                onClick={() => router.push(isAuthenticated ? "/checkout" : "/account-required")}
              >
                 {t("shop.proceed_checkout")}
               </Button>
               <Link href="/product" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                 {t("shop.continue_shopping")}
               </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
