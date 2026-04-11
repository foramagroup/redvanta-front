"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Zap, MapPin, Palette, Headphones, ExternalLink, Plus, Minus, Crown, X, CheckCircle, ShieldCheck, Clock, ArrowLeft, CreditCard, Building2, Smartphone, Tag, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

const addOns = [
  { id: "api", name: "API Access", description: "Unlock full API and developer access.", price: 79, unit: "/month", icon: Package, quantityBased: false, longDescription: "Get full programmatic access to the Opinoor platform. Build custom integrations, automate workflows, and sync data with your existing tools using our RESTful API and webhooks.", features: ["100,000 API calls/month", "RESTful API + SDKs (Node, Python, PHP)", "Webhook subscriptions for all events", "Sandbox environment for testing", "Dedicated API support channel", "Rate limiting: 1,000 req/min"] },
  { id: "automation", name: "Advanced Automation", description: "Multi-trigger workflows, escalation rules, conditional logic.", price: 49, unit: "/month", icon: Zap, quantityBased: false, longDescription: "Supercharge your review collection with intelligent automation.", features: ["Unlimited automation workflows", "Multi-trigger conditions", "A/B testing for message templates", "Escalation rules for negative reviews", "Conditional branching logic", "Scheduled campaigns"] },
  { id: "location", name: "Extra Location", description: "Add additional business locations to your account.", price: 29, unit: "/location/month", icon: MapPin, quantityBased: true, longDescription: "Expand your reputation management to cover all your business locations.", features: ["Dedicated location dashboard", "Independent review tracking", "Location-specific NFC cards", "Per-location analytics", "Google Business Profile sync", "Location comparison benchmarks"] },
  { id: "whitelabel", name: "White-Label Dashboard", description: "Custom domain and branding.", price: 199, unit: "/month", icon: Palette, quantityBased: false, longDescription: "Make the Opinoor dashboard your own.", features: ["Custom domain", "Your logo & brand colors", "White-labeled emails", "Custom login page", "Remove all branding", "Branded PDF reports"] },
  { id: "support", name: "Priority Infrastructure Support", description: "Dedicated support with guaranteed response times.", price: 99, unit: "/month", icon: Headphones, quantityBased: false, longDescription: "Get premium support with guaranteed SLAs.", features: ["Dedicated account manager", "1-hour response time SLA", "Priority ticket queue", "Phone & video call support", "Quarterly business reviews", "Custom onboarding"] },
];

const AddOns = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState({});
  const [preSelected, setPreSelected] = useState(new Set());
  const [quantities, setQuantities] = useState({ location: 1 });

  useEffect(() => {
    const activateParam = searchParams.get("activate");
    const qtyLocation = searchParams.get("qty_location");
    if (activateParam) {
      const ids = activateParam.split(",");
      setEnabled((prev) => {
        const next = { ...prev };
        ids.forEach((id) => { next[id] = true; });
        return next;
      });
      setPreSelected(new Set(ids));
      if (qtyLocation) {
        setQuantities((prev) => ({ ...prev, location: Math.max(1, parseInt(qtyLocation) || 1) }));
      }
      router.replace(pathname);
      toast({ title: "Add-on pre-selected", description: `${ids.join(", ")} has been added to your selection.` });
    }
  }, [pathname, router, searchParams]);
  const [learnMore, setLearnMore] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTotal, setSuccessTotal] = useState("");
  const basePlan = { name: "Growth", price: 249 };

  const toggleAddon = (id) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  const updateQty = (id, delta) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));

  const activeAddOns = addOns.filter((a) => enabled[a.id]);
  const addOnTotal = activeAddOns.reduce((sum, a) => sum + a.price * (a.quantityBased ? quantities[a.id] || 1 : 1), 0);
  const estimatedTotal = basePlan.price + addOnTotal;

  const summaryCards = [
    { labelKey: "addon.current_plan", value: basePlan.name, badge: true },
    { labelKey: "addon.base_price", value: `$${basePlan.price}/mo` },
    { labelKey: "addon.active_addons", value: String(activeAddOns.length) },
    { labelKey: "addon.est_total", value: `$${estimatedTotal}`, highlight: true },
  ];

  return (
    <DashboardLayout title={t("addon.title")} subtitle={t("addon.subtitle")}
      headerAction={<Button variant="outline" size="sm" className="gap-2 border-border/50" onClick={() => router.push("/dashboard/billing")}><ArrowLeft size={14} /> {t("bill.title") || "Back to Billing"}</Button>}
    >
      {/* Quick link to Current Plan */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-lg border border-border/50 bg-secondary/20">
        <Crown size={16} className="text-primary shrink-0" />
        <span className="text-sm text-muted-foreground">{t("addon.current_plan")}:</span>
        <span className="text-sm font-semibold">{basePlan.name}</span>
        <Badge className="bg-primary/20 text-primary border-0 text-[10px]">{t("sett.active")}</Badge>
        <Button variant="link" size="sm" className="ml-auto gap-1 text-xs h-auto p-0" onClick={() => router.push("/dashboard/upgrade")}>
          {t("addon.manage_plan") || "Manage Plan"} <ArrowRight size={12} />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((s) => (
          <Card key={s.labelKey} className="border-border/50 bg-card">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{t(s.labelKey)}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold font-display ${s.highlight ? "text-primary" : ""}`}>{s.value}</span>
                {s.badge && <Badge className="bg-primary/20 text-primary border-0 text-[10px]">{t("sett.active")}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <h2 className="font-display text-lg font-semibold mb-4">{t("addon.available")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {addOns.map((addon, i) => {
              const isOn = !!enabled[addon.id];
              return (
                <motion.div key={addon.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`border-border/50 bg-card transition-all ${isOn ? "border-glow glow-red-sm" : "hover:border-border"}`}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isOn ? "bg-primary/20" : "bg-secondary"}`}><addon.icon size={18} className={isOn ? "text-primary" : "text-muted-foreground"} /></div>
                          <div><p className="font-medium text-sm">{addon.name}</p><p className="text-xs text-muted-foreground">{addon.description}</p></div>
                        </div>
                        <Switch checked={isOn} onCheckedChange={() => toggleAddon(addon.id)} />
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/30">
                        <span className="text-sm font-semibold">${addon.price}<span className="text-xs text-muted-foreground font-normal">{addon.unit}</span></span>
                        {addon.quantityBased && isOn && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(addon.id, -1)} className="p-1 rounded bg-secondary hover:bg-secondary/80 text-foreground"><Minus size={14} /></button>
                            <span className="text-sm font-medium w-6 text-center">{quantities[addon.id] || 1}</span>
                            <button onClick={() => updateQty(addon.id, 1)} className="p-1 rounded bg-secondary hover:bg-secondary/80 text-foreground"><Plus size={14} /></button>
                          </div>
                        )}
                        <button onClick={() => setLearnMore(addon)} className="text-xs text-primary hover:underline flex items-center gap-1">{t("addon.learn_more")} <ExternalLink size={10} /></button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="xl:w-80 shrink-0">
          <div className="xl:sticky xl:top-28">
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Crown size={16} className="text-primary" /> {t("addon.price_breakdown")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("addon.base_plan")} ({basePlan.name})</span><span>${basePlan.price}</span></div>
                {activeAddOns.length > 0 && (
                  <div className="space-y-2 border-t border-border/30 pt-3">
                    {activeAddOns.map((a) => { const qty = a.quantityBased ? quantities[a.id] || 1 : 1; return (<div key={a.id} className="flex justify-between text-sm"><span className="text-muted-foreground">{a.name}{qty > 1 ? ` ×${qty}` : ""}</span><span>${a.price * qty}</span></div>); })}
                  </div>
                )}
                <div className="border-t border-border/30 pt-3 flex justify-between font-semibold"><span>{t("addon.est_total")}</span><span className="text-primary">${estimatedTotal}</span></div>
                <Button className="w-full mt-2 glow-red-hover" disabled={activeAddOns.length === 0} onClick={() => setShowReview(true)}>{t("addon.proceed_upgrade")}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center lg:hidden">
        <Button variant="outline" size="lg" className="gap-2 border-border/50 min-w-[200px]" onClick={() => router.push("/dashboard/billing")}>
          <ArrowLeft size={16} /> {t("bill.title") || "Back to Billing"}
        </Button>
      </div>

      {learnMore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setLearnMore(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><learnMore.icon size={24} className="text-primary" /></div>
                <div><h3 className="font-display font-semibold text-lg">{learnMore.name}</h3><span className="font-display text-primary font-bold">${learnMore.price}<span className="text-sm text-muted-foreground font-normal">{learnMore.unit}</span></span></div>
              </div>
              <button onClick={() => setLearnMore(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{learnMore.longDescription}</p>
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("addon.whats_included")}</h4>
              {learnMore.features.map((f, i) => (<div key={i} className="flex items-center gap-2 text-sm"><CheckCircle size={14} className="text-primary shrink-0" /><span>{f}</span></div>))}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 glow-red-hover" onClick={() => { toggleAddon(learnMore.id); setLearnMore(null); }}>{enabled[learnMore.id] ? t("addon.deactivate") : t("addon.activate")}</Button>
              <Button variant="outline" className="border-border/50" onClick={() => setLearnMore(null)}>{t("addon.close")}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowReview(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-xl border border-border/50 bg-card flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border/30 shrink-0">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2"><Sparkles size={18} className="text-primary" /> Review Changes</h3>
              <button onClick={() => setShowReview(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Pre-selected from other pages */}
              {activeAddOns.filter((a) => preSelected.has(a.id)).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <RotateCcw size={12} /> Pre-selected from your request
                  </h4>
                  <div className="space-y-2">
                    {activeAddOns.filter((a) => preSelected.has(a.id)).map((a) => {
                      const qty = a.quantityBased ? quantities[a.id] || 1 : 1;
                      return (
                        <div key={a.id} className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                          <div className="p-1.5 rounded-md bg-primary/20"><a.icon size={16} className="text-primary" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.name}{qty > 1 ? ` ×${qty}` : ""}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{a.description}</p>
                          </div>
                          <span className="text-sm font-semibold shrink-0">${a.price * qty}/mo</span>
                          <button onClick={() => { toggleAddon(a.id); preSelected.delete(a.id); }} className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0" title="Remove"><X size={14} /></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Manually added */}
              {activeAddOns.filter((a) => !preSelected.has(a.id)).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Plus size={12} /> Manually added
                  </h4>
                  <div className="space-y-2">
                    {activeAddOns.filter((a) => !preSelected.has(a.id)).map((a) => {
                      const qty = a.quantityBased ? quantities[a.id] || 1 : 1;
                      return (
                        <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/20 p-3">
                          <div className="p-1.5 rounded-md bg-secondary"><a.icon size={16} className="text-muted-foreground" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.name}{qty > 1 ? ` ×${qty}` : ""}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{a.description}</p>
                          </div>
                          <span className="text-sm font-semibold shrink-0">${a.price * qty}/mo</span>
                          <button onClick={() => toggleAddon(a.id)} className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0" title="Remove"><X size={14} /></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cost summary */}
              <div className="rounded-lg border border-border/30 bg-secondary/20 p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base Plan ({basePlan.name})</span><span>${basePlan.price}/mo</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Add-ons total</span><span>${addOnTotal}/mo</span></div>
                <div className="border-t border-border/30 pt-2 flex justify-between font-semibold"><span>New monthly total</span><span className="text-primary">${estimatedTotal}/mo</span></div>
              </div>
            </div>

            <div className="p-5 pt-4 border-t border-border/30 shrink-0 flex gap-3">
              <Button className="flex-1 glow-red-hover gap-2" disabled={activeAddOns.length === 0} onClick={() => { setShowReview(false); setShowPayment(true); }}>
                Continue to Payment <ArrowRight size={14} />
              </Button>
              <Button variant="outline" className="border-border/50" onClick={() => setShowReview(false)}>Back</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowPayment(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-xl border border-border/50 bg-card flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-5 pb-4 border-b border-border/30 shrink-0">
              <h3 className="font-display font-semibold text-lg">Complete Your Upgrade</h3>
              <button onClick={() => setShowPayment(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Order Summary */}
              <div className="rounded-lg border border-border/30 bg-secondary/20 p-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Order Summary</h4>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base Plan ({basePlan.name})</span><span>${basePlan.price}/mo</span></div>
                {activeAddOns.map((a) => {
                  const qty = a.quantityBased ? quantities[a.id] || 1 : 1;
                  return <div key={a.id} className="flex justify-between text-sm"><span className="text-muted-foreground">{a.name}{qty > 1 ? ` ×${qty}` : ""}</span><span>${a.price * qty}/mo</span></div>;
                })}
                {promoApplied && (
                  <div className="flex justify-between text-sm text-primary"><span>Promo discount</span><span>-${promoDiscount}/mo</span></div>
                )}
                <div className="border-t border-border/30 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${promoApplied ? estimatedTotal - promoDiscount : estimatedTotal}/mo</span>
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Promo Code</h4>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="bg-secondary/50 border-border/50 pl-9 uppercase"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={promoApplied}
                    />
                  </div>
                  {promoApplied ? (
                    <Button variant="outline" size="default" className="border-border/50 text-xs shrink-0" onClick={() => { setPromoApplied(false); setPromoDiscount(0); setPromoCode(""); }}>Remove</Button>
                  ) : (
                    <Button variant="outline" size="default" className="border-border/50 text-xs shrink-0" disabled={!promoCode.trim()} onClick={() => {
                      if (promoCode === "SAVE20") {
                        setPromoApplied(true);
                        setPromoDiscount(Math.round(addOnTotal * 0.2));
                        toast({ title: "Promo applied!", description: "20% off add-ons for the first 3 months." });
                      } else {
                        toast({ title: "Invalid code", description: "This promo code is not valid or has expired.", variant: "destructive" });
                      }
                    }}>Apply</Button>
                  )}
                </div>
                {promoApplied && (
                  <p className="text-[11px] text-primary mt-1.5 flex items-center gap-1"><CheckCircle size={12} /> SAVE20 — 20% off add-ons for 3 months</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</h4>
                {[
                  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex", icon: CreditCard },
                  { id: "bank", label: "Bank Transfer", desc: "Direct debit from your bank", icon: Building2 },
                  { id: "applepay", label: "Apple Pay / Google Pay", desc: "Quick mobile payment", icon: Smartphone },
                ].map((method) => (
                  <button key={method.id} onClick={() => setSelectedPayment(method.id)} className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${selectedPayment === method.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}>
                    <div className={`p-2 rounded-lg shrink-0 ${selectedPayment === method.id ? "bg-primary/20" : "bg-secondary"}`}><method.icon size={16} className={selectedPayment === method.id ? "text-primary" : "text-muted-foreground"} /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{method.label}</p><p className="text-[11px] text-muted-foreground truncate">{method.desc}</p></div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors flex items-center justify-center ${selectedPayment === method.id ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                      {selectedPayment === method.id && <CheckCircle size={10} className="text-primary-foreground" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment Details */}
              {selectedPayment === "card" && (
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground mb-1.5 block">Card Number</label><Input className="bg-secondary/50 border-border/50 font-mono" placeholder="4242 4242 4242 4242" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1.5 block">Expiry</label><Input className="bg-secondary/50 border-border/50" placeholder="MM/YY" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1.5 block">CVC</label><Input className="bg-secondary/50 border-border/50" placeholder="123" /></div>
                  </div>
                  <div><label className="text-xs text-muted-foreground mb-1.5 block">Cardholder Name</label><Input className="bg-secondary/50 border-border/50" placeholder="John Doe" /></div>
                </div>
              )}

              {selectedPayment === "bank" && (
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground mb-1.5 block">IBAN / Account Number</label><Input className="bg-secondary/50 border-border/50 font-mono" placeholder="DE89 3704 0044 0532 0130 00" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1.5 block">Account Holder</label><Input className="bg-secondary/50 border-border/50" placeholder="John Doe" /></div>
                </div>
              )}

              {selectedPayment === "applepay" && (
                <div className="rounded-lg bg-secondary/30 border border-border/30 p-4 text-center">
                  <Smartphone size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">You'll be redirected to complete payment via Apple Pay / Google Pay</p>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="p-5 pt-4 border-t border-border/30 shrink-0 space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck size={14} className="text-primary shrink-0" />
                <span>Secured with 256-bit SSL encryption. Cancel anytime.</span>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 glow-red-hover" onClick={() => {
                  const total = `$${promoApplied ? estimatedTotal - promoDiscount : estimatedTotal}/mo`;
                  setShowPayment(false);
                  setPromoApplied(false);
                  setPromoCode("");
                  setPromoDiscount(0);
                  setSuccessTotal(total);
                  setShowSuccess(true);
                  setTimeout(() => {
                    router.push("/dashboard/billing");
                  }, 2500);
                }}>
                  Pay ${promoApplied ? estimatedTotal - promoDiscount : estimatedTotal}/mo
                </Button>
                <Button variant="outline" className="border-border/50" onClick={() => setShowPayment(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-5 text-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 250, damping: 15 }}
              className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
              >
                <CheckCircle size={40} className="text-primary" />
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <h2 className="font-display text-2xl font-bold mb-1">Payment Successful!</h2>
              <p className="text-muted-foreground text-sm">Your add-ons are now active at <span className="font-semibold text-foreground">{successTotal}</span></p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center gap-2 text-xs text-muted-foreground">
              <RotateCcw size={12} className="animate-spin" />
              <span>Redirecting to billing...</span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AddOns;


