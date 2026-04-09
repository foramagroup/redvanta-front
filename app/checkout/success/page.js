"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, Package, Mail, ArrowRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeUp } from "@/lib/animations";
import { MODEL_LABELS } from "@/types/shop";

const CHECKOUT_SUCCESS_KEY = "krootal_checkout_success";
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PK
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)
  : null;

const MANUAL_STEPS = [
  "Votre commande est bien enregistrée.",
  "Le paiement sera effectué sur place.",
  "Notre équipe validera ensuite la suite du traitement.",
  "Vous recevrez un suivi dès que la commande avancera.",
];

const STRIPE_STEPS = [
  "confirmation.step_1",
  "confirmation.step_2",
  "confirmation.step_3",
  "confirmation.step_4",
];

const getItemKey = (item, index) => item?.id || item?.productId || `${item?.productName || "item"}-${index}`;
const formatManualTotal = (amount, currency) => {
  if (typeof amount !== "number" || !Number.isFinite(amount) || !currency) return null;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const { currentOrder, user, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const paymentIntentId = params.get("payment_intent");
  const clientSecret = params.get("payment_intent_client_secret");
  const manualStatus = params.get("status");
  const manualMessage = params.get("message");
  const orderNumber = params.get("order");
  const invoiceNumber = params.get("invoice");

  const [status, setStatus] = useState("loading");
  const [successSnapshot, setSuccessSnapshot] = useState(null);
  const cartClearedRef = useRef(false);

  useEffect(() => {
    try {
      const rawSnapshot = sessionStorage.getItem(CHECKOUT_SUCCESS_KEY);
      setSuccessSnapshot(rawSnapshot ? JSON.parse(rawSnapshot) : null);
    } catch {
      setSuccessSnapshot(null);
    }
  }, []);

  useEffect(() => {
    if (manualStatus === "manual") {
      setStatus("manual");
      return;
    }

    if (!paymentIntentId || !clientSecret || !stripePromise) {
      setStatus("success");
      return;
    }

    stripePromise
      .then((stripe) => stripe?.retrievePaymentIntent(clientSecret))
      .then(({ paymentIntent }) => {
        setStatus(paymentIntent?.status === "succeeded" ? "success" : "failed");
      })
      .catch(() => {
        setStatus("success");
      });
  }, [clientSecret, manualStatus, paymentIntentId]);

  useEffect(() => {
    if (cartClearedRef.current || (status !== "manual" && status !== "success")) {
      return;
    }

    cartClearedRef.current = true;
    Promise.resolve(clearCart()).catch(() => {});
  }, [clearCart, status]);

  const isManual = status === "manual";
  const displayOrderNumber = orderNumber || successSnapshot?.orderNumber || currentOrder?.id || "—";
  const displayInvoiceNumber = invoiceNumber || successSnapshot?.invoiceNumber || null;
  const displayDate = currentOrder?.createdAt
    ? new Date(currentOrder.createdAt).toLocaleDateString()
    : successSnapshot?.createdAt
      ? new Date(successSnapshot.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString();
  const displayTotal = typeof currentOrder?.total === "number"
    ? formatPrice(currentOrder.total)
    : formatManualTotal(successSnapshot?.total, successSnapshot?.currency);
  const displayItems = Array.isArray(currentOrder?.items) && currentOrder.items.length
    ? currentOrder.items
    : Array.isArray(successSnapshot?.items)
      ? successSnapshot.items
      : [];
  const displayEmail = user?.email || successSnapshot?.email || "your email";

  const nextSteps = useMemo(
    () => (isManual ? MANUAL_STEPS : STRIPE_STEPS.map((key) => t(key))),
    [isManual, t]
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-dark pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-2xl text-center">
            <motion.div variants={fadeUp} custom={0}>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15">
                <XCircle size={40} className="text-destructive" />
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mt-8 font-display text-3xl font-bold md:text-4xl">
              Paiement <span className="text-gradient-red">échoué</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-3 text-muted-foreground">
              Le paiement n&apos;a pas pu être confirmé. Tu peux relancer le checkout.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8">
              <Link href="/checkout">
                <Button className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90">
                  Revenir au checkout
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible" className="mx-auto max-w-2xl text-center">
          <motion.div variants={fadeUp} custom={0}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 glow-red-sm">
              <CheckCircle2 size={40} className="text-green-400" />
            </div>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="mt-8 font-display text-3xl font-bold md:text-4xl">
            {isManual ? "Commande" : t("confirmation.title_1")}{" "}
            <span className="text-gradient-red">{isManual ? "enregistrée" : t("confirmation.title_2")}</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mt-3 text-muted-foreground">
            {isManual
              ? manualMessage || successSnapshot?.message || "Votre commande a été enregistrée. Vous paierez sur place."
              : t("confirmation.subtitle")}
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" className="mx-auto mt-12 max-w-2xl space-y-6">
          <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("confirmation.order_number")}</p>
                <p className="mt-1 font-display text-xl font-bold">{displayOrderNumber}</p>
              </div>
              <Badge
                className={
                  isManual
                    ? "border-amber-500/30 bg-amber-500/20 text-amber-300"
                    : "border-green-500/30 bg-green-500/20 text-green-400"
                }
              >
                {isManual ? "PAY ON SITE" : "PAID"}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">{t("confirmation.date")}</p>
                <p className="font-medium">{displayDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("confirmation.total")}</p>
                <p className="font-medium">{displayTotal || "—"}</p>
              </div>
              {displayInvoiceNumber && (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Facture</p>
                  <p className="font-medium">{displayInvoiceNumber}</p>
                </div>
              )}
            </div>
          </motion.div>

          {displayItems.length > 0 && (
            <motion.div variants={fadeUp} custom={4} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h3 className="font-display text-lg font-semibold">{t("confirmation.items")}</h3>
              <div className="mt-4 space-y-3">
                {displayItems.map((item, index) => {
                  const modelLabel = MODEL_LABELS[item?.model] || item?.cardType?.name || null;
                  const quantity = Number(item?.quantity) || 1;
                  const itemTotal = (Number(item?.unitPrice) || 0) * quantity;

                  return (
                    <div
                      key={getItemKey(item, index)}
                      className="flex items-center justify-between gap-4 border-b border-border/30 py-2 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{item?.productName || "Product"}</span>
                        {modelLabel && (
                          <Badge variant="outline" className="text-xs">
                            {modelLabel}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">×{quantity}</span>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(itemTotal)}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <motion.div
            variants={fadeUp}
            custom={5}
            className={`rounded-xl border p-6 ${
              isManual ? "border-amber-500/30 bg-amber-500/5" : "border-primary/30 bg-primary/5"
            }`}
          >
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Package size={18} className="text-primary" /> {t("confirmation.whats_next")}
            </h3>
            <div className="mt-4 space-y-3">
              {nextSteps.map((step, index) => (
                <p key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={14} className="shrink-0 text-primary" />
                  {step}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary p-4">
            <Mail size={18} className="shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              {isManual ? (
                <>
                  Un récapitulatif sera envoyé à <span className="font-medium text-foreground">{displayEmail}</span>.
                </>
              ) : (
                <>
                  {t("confirmation.email_sent_prefix")}{" "}
                  <span className="font-medium text-foreground">{displayEmail}</span>
                  {t("confirmation.email_sent_suffix")}
                </>
              )}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={7} className="flex flex-col items-center gap-3 pt-4">
            <Link href="/order-tracking">
              <Button className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90">
                {t("confirmation.track_order")} <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {t("confirmation.back_home")}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
