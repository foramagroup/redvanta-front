"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  Lock,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeUp } from "@/lib/animations";
import api from "@/lib/api";
import { MODEL_LABELS } from "@/types/shop";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PK
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)
  : null;

const CHECKOUT_AUTOSTART_KEY = "krootal_checkout_autostart";
const CHECKOUT_DRAFT_KEY = "krootal_checkout_draft";
const CHECKOUT_SUCCESS_KEY = "krootal_checkout_success";

function resolvePaymentFlow(method) {
  const normalizedName = String(method?.name || "").trim().toLowerCase();

  if (normalizedName === "card payment") {
    return "stripe";
  }

  if (normalizedName === "cash payment") {
    return "manual";
  }

  return null;
}

function storeCheckoutSuccessSnapshot(snapshot) {
  try {
    sessionStorage.setItem(CHECKOUT_SUCCESS_KEY, JSON.stringify(snapshot));
  } catch {}
}

const INITIAL_ADDRESS = {
  fullName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

function StripePaymentForm({ amounts, formatPrice, t, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessingPayment(true);
    onError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      onError(error.message || "Le paiement Stripe a echoue.");
      setProcessingPayment(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="rounded-lg border border-border/50 bg-background/60 p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("checkout.subtotal")}</span>
          <span>{formatPrice(amounts?.subtotalEUR ?? 0)}</span>
        </div>
        <div className="mt-2 flex justify-between text-muted-foreground">
          <span>{t("checkout.shipping")}</span>
          <span>{formatPrice(amounts?.shippingCostEUR ?? 0)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border/50 pt-3 font-semibold text-foreground">
          <span>{t("checkout.total")}</span>
          <span>{formatPrice(amounts?.displayTotal ?? amounts?.totalEUR ?? 0)}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-background/60 p-4">
        <PaymentElement />
      </div>

      <Button
        type="submit"
        className="w-full glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!stripe || processingPayment}
      >
        {processingPayment ? (
          <span className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            {t("checkout.processing")}
          </span>
        ) : (
          <>
            <Lock size={16} className="mr-2" />
            {t("checkout.pay")} {formatPrice(amounts?.displayTotal ?? amounts?.totalEUR ?? 0)}
          </>
        )}
      </Button>
    </form>
  );
}

const Checkout = () => {
  const router = useRouter();
  const { items, subtotal, authUser, user } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const profile = authUser || user;

  const [shipping, setShipping] = useState("standard");
  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [amounts, setAmounts] = useState(null);
  const [error, setError] = useState(null);
  const [autostartRequested, setAutostartRequested] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const shippingOptions = [
    { method: "standard", labelKey: "checkout.standard", price: 9.99, timeKey: "checkout.standard_time" },
    { method: "express", labelKey: "checkout.express", price: 19.99, timeKey: "checkout.express_time" },
    { method: "international", labelKey: "checkout.international", price: 34.99, timeKey: "checkout.international_time" },
  ];

  const shippingCost = shippingOptions.find((option) => option.method === shipping)?.price || 9.99;
  const estimatedTotal = subtotal + shippingCost;
  const requiredAddressComplete = useMemo(
    () => ["fullName", "address", "city", "zip", "country"].every((field) => String(address[field] || "").trim()),
    [address]
  );
  const selectedMethodData = useMemo(
    () => paymentMethods.find((method) => String(method.id) === String(selectedMethod)) ?? null,
    [paymentMethods, selectedMethod]
  );
  const selectedPaymentFlow = resolvePaymentFlow(selectedMethodData);

  const paymentReady = Boolean(clientSecret && amounts);
  const checkoutLocked = paymentReady || processingOrder;

  useEffect(() => {
    setLoadingMethods(true);
    api.get("/client/shop/payment-methods")
      .then((res) => {
        const methods = res?.data ?? [];
        setPaymentMethods(methods);
        setSelectedMethod(methods[0] ? String(methods[0].id) : null);
      })
      .catch(() => {
        setPaymentMethods([]);
        setSelectedMethod(null);
      })
      .finally(() => setLoadingMethods(false));
  }, []);

  useEffect(() => {
    if (!items.length) {
      router.push("/cart");
    }
  }, [items.length, router]);

  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      const autostart = sessionStorage.getItem(CHECKOUT_AUTOSTART_KEY) === "1";

      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed?.shippingMethod) {
          setShipping(parsed.shippingMethod);
        }
        if (parsed?.address) {
          setAddress((prev) => ({ ...prev, ...parsed.address }));
        }
      }

      if (autostart) {
        setAutostartRequested(true);
        sessionStorage.removeItem(CHECKOUT_AUTOSTART_KEY);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setAddress((prev) => ({
      fullName:
        prev.fullName ||
        profile?.companyName ||
        profile?.activeCompany?.name ||
        profile?.name ||
        "",
      address: prev.address || profile?.address || "",
      city: prev.city || profile?.city || "",
      state: prev.state || profile?.state || "",
      zip: prev.zip || profile?.zip || "",
      country: prev.country || profile?.country || "United States",
    }));
  }, [profile]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        CHECKOUT_DRAFT_KEY,
        JSON.stringify({
          shippingMethod: shipping,
          address,
        })
      );
    } catch {}
  }, [address, shipping]);

  const handleAddressChange = (field, value) => {
    if (checkoutLocked) {
      return;
    }

    setError(null);
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleShippingChange = (method) => {
    if (checkoutLocked) {
      return;
    }

    setError(null);
    setShipping(method);
  };

  const prepareCheckout = async () => {
    if (!requiredAddressComplete) {
      setError("Completez les informations de livraison avant de continuer.");
      return;
    }

    if (!selectedMethodData || !selectedPaymentFlow) {
      setError("Selectionnez un mode de paiement valide.");
      return;
    }

    setProcessingOrder(true);
    setError(null);

    try {
      const payload = await api.post("/client/orders", {
        shippingFullName: address.fullName,
        shippingAddress: address.address,
        shippingCity: address.city,
        shippingState: address.state,
        shippingZip: address.zip,
        shippingCountry: address.country,
        shippingMethod: shipping,
        paymentMethod: selectedPaymentFlow,
        paymentMethodId: selectedPaymentFlow === "manual" ? selectedMethodData.id : null,
      });

      storeCheckoutSuccessSnapshot({
        status: selectedPaymentFlow,
        orderNumber: payload?.data?.orderNumber || null,
        invoiceNumber: payload?.invoiceNumber || null,
        total: typeof payload?.amounts?.displayTotal === "number" ? payload.amounts.displayTotal : null,
        currency: payload?.amounts?.currency || null,
        createdAt: new Date().toISOString(),
        shippingMethod: shipping,
        email: profile?.email || user?.email || "",
        message:
          selectedPaymentFlow === "manual"
            ? "Votre commande a ete enregistree. Vous paierez sur place."
            : null,
        items: Array.isArray(items)
          ? items.map((item) => ({
              id: item?.id || null,
              productId: item?.productId || null,
              productName: item?.productName || "Product",
              model: item?.model || null,
              quantity: Number(item?.quantity) || 1,
              unitPrice: Number(item?.unitPrice) || 0,
              cardType: item?.cardType || null,
            }))
          : [],
      });

      if (selectedPaymentFlow === "stripe") {
        if (!payload?.stripeClientSecret) {
          throw new Error("Stripe n'a pas renvoye de client secret.");
        }

        setClientSecret(payload.stripeClientSecret);
        setAmounts(payload.amounts || null);
      } else {
        const params = new URLSearchParams({
          status: "manual",
        });

        if (payload?.data?.orderNumber) {
          params.set("order", payload.data.orderNumber);
        }

        if (payload?.invoiceNumber) {
          params.set("invoice", payload.invoiceNumber);
        }

        router.push(`/checkout/success?${params.toString()}`);
        return;
      }
    } catch (requestError) {
      setClientSecret(null);
      setAmounts(null);
      setError(
        requestError?.error ||
          requestError?.message ||
          "Erreur lors de la preparation du paiement."
      );
    } finally {
      setProcessingOrder(false);
      setAutostartRequested(false);
    }
  };

  useEffect(() => {
    if (!autostartRequested || paymentReady || processingOrder || !items.length) {
      return;
    }

    if (!requiredAddressComplete) {
      setAutostartRequested(false);
      return;
    }

    void prepareCheckout();
  }, [
    autostartRequested,
    items.length,
    paymentReady,
    processingOrder,
    requiredAddressComplete,
  ]);

  if (!items.length) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark pb-20 pt-32">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible">
          <motion.h1 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
            <span className="text-gradient-red">{t("checkout.title")}</span>
          </motion.h1>
        </motion.div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <motion.div initial="hidden" animate="visible" className="space-y-8 lg:col-span-2">
            <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h3 className="font-display text-lg font-semibold">{t("checkout.order_summary")}</h3>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="border-b border-border/30 py-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.productName}</span>
                      <span className="font-semibold">{formatPrice(item.lineTotal ?? item.unitPrice * item.quantity)}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">{MODEL_LABELS[item.model]}</Badge>
                      {item.design && (
                        <Badge
                          className={
                            item.design.status === "validated" || item.design.status === "locked"
                              ? "border-green-500/30 bg-green-500/20 text-xs text-green-400"
                              : "border-yellow-500/30 bg-yellow-500/20 text-xs text-yellow-400"
                          }
                        >
                          {item.design.status === "validated" || item.design.status === "locked" ? "Validated" : "Draft"}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{t("checkout.qty")}: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Truck size={18} className="text-primary" /> {t("checkout.shipping_address")}
                </h3>
                {paymentReady && (
                  <Badge className="border-green-500/30 bg-green-500/20 text-green-400">
                    <CheckCircle2 size={12} className="mr-1" />
                    Adresse verrouillee
                  </Badge>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground">{t("checkout.full_name")}</label>
                  <Input
                    value={address.fullName}
                    onChange={(event) => handleAddressChange("fullName", event.target.value)}
                    className="mt-1 border-border/50 bg-background"
                    disabled={checkoutLocked}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-muted-foreground">{t("checkout.address")}</label>
                  <Input
                    value={address.address}
                    onChange={(event) => handleAddressChange("address", event.target.value)}
                    className="mt-1 border-border/50 bg-background"
                    disabled={checkoutLocked}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.city")}</label>
                  <Input
                    value={address.city}
                    onChange={(event) => handleAddressChange("city", event.target.value)}
                    className="mt-1 border-border/50 bg-background"
                    disabled={checkoutLocked}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.state")}</label>
                  <Input
                    value={address.state}
                    onChange={(event) => handleAddressChange("state", event.target.value)}
                    className="mt-1 border-border/50 bg-background"
                    disabled={checkoutLocked}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.zip")}</label>
                  <Input
                    value={address.zip}
                    onChange={(event) => handleAddressChange("zip", event.target.value)}
                    className="mt-1 border-border/50 bg-background"
                    disabled={checkoutLocked}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("checkout.country")}</label>
                  <Input
                    value={address.country}
                    onChange={(event) => handleAddressChange("country", event.target.value)}
                    className="mt-1 border-border/50 bg-background"
                    disabled={checkoutLocked}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold">{t("checkout.shipping_method")}</h3>
                {paymentReady && (
                  <Badge className="border-green-500/30 bg-green-500/20 text-green-400">
                    Mode verrouille
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <button
                    key={option.method}
                    type="button"
                    onClick={() => handleShippingChange(option.method)}
                    disabled={checkoutLocked}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      shipping === option.method
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/50 hover:border-border"
                    } ${checkoutLocked ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{t(option.labelKey)}</p>
                        <p className="text-xs text-muted-foreground">{t(option.timeKey)}</p>
                      </div>
                      <span className="font-semibold">{formatPrice(option.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <CreditCard size={18} className="text-primary" /> Payment Methods
              </h3>
              <div className="mt-4 space-y-3">
                {loadingMethods ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Loading payment methods...
                  </div>
                ) : paymentMethods.length ? (
                  paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      disabled={checkoutLocked}
                      onClick={() => setSelectedMethod(String(method.id))}
                      className={`w-full rounded-lg border p-4 text-left transition-all ${
                        selectedMethod === String(method.id)
                          ? "border-primary/50 bg-primary/10"
                          : "border-border/50 hover:border-border"
                      } ${checkoutLocked ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          selectedMethod === String(method.id) ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {selectedMethod === String(method.id) && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <CreditCard size={16} className="text-primary" />
                        <div>
                          <p className="text-sm font-semibold">{method.name}</p>
                          {method.instructions && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{method.instructions}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-400">
                    Aucun mode de paiement disponible.
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={5} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <CreditCard size={18} className="text-primary" /> {t("checkout.payment")}
              </h3>
              {!paymentReady && !processingOrder && (
                <div className="mt-4 rounded-lg border border-dashed border-border/50 bg-background/40 p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {selectedPaymentFlow === "manual"
                        ? "Confirmez la commande pour payer sur place"
                        : "Chargez le paiement pour continuer"}
                    </span>
                  </p>
                </div>
              )}

              {processingOrder && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
                  <Loader2 size={16} className="animate-spin" />
                  ...
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {paymentReady && (
                <>
                  {!stripePromise ? (
                    <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      `NEXT_PUBLIC_STRIPE_PK` est manquant cote frontend.
                    </div>
                  ) : (
                    <Elements stripe={stripePromise} options={{ clientSecret, locale: "fr" }}>
                      <StripePaymentForm
                        amounts={amounts}
                        formatPrice={formatPrice}
                        t={t}
                        onError={setError}
                      />
                    </Elements>
                  )}
                </>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck size={14} className="text-green-400" />
                {t("checkout.secured_stripe")}
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <div className="sticky top-28 space-y-4 rounded-xl border border-border/50 bg-gradient-card p-6">
              <h3 className="font-display text-lg font-semibold">{t("checkout.total")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                  <span>{formatPrice(amounts?.subtotalEUR ?? subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                  <span>{formatPrice(amounts?.shippingCostEUR ?? shippingCost)}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-2">
                  <span className="font-semibold">{t("checkout.total")}</span>
                  <span className="font-display text-2xl font-bold">
                    {formatPrice(amounts?.displayTotal ?? amounts?.totalEUR ?? estimatedTotal)}
                  </span>
                </div>
              </div>

              {!paymentReady ? (
                <Button
                  className="w-full glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={processingOrder || !requiredAddressComplete || !selectedPaymentFlow}
                  onClick={prepareCheckout}
                >
                  {processingOrder ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      {t("checkout.processing")}
                    </span>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2" />
                      Charger le paiement
                    </>
                  )}
                </Button>
              ) : (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
                  Le formulaire Stripe est pret. Finalise le paiement dans le bloc ci-contre.
                </div>
              )}

              {!requiredAddressComplete && !paymentReady && (
                <p className="text-xs text-muted-foreground">
                  Renseigne l&apos;adresse de livraison pour generer le <code>stripeClientSecret</code>.
                </p>
              )}

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Lock size={12} /> SSL</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12} /> PCI</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
