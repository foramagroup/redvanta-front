"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Package, Palette, Headphones, MapPin, Plus, Minus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";

const plans = [
  { id: "starter", name: "Starter", price: 129, description: "For small businesses getting started.", features: ["5 NFC cards", "Basic dashboard", "Email support", "1 location"] },
  { id: "growth", name: "Growth", price: 249, description: "For growing teams scaling operations.", features: ["15 NFC cards", "Advanced analytics", "Priority support", "3 locations", "Automation"], popular: true },
  { id: "pro", name: "Pro", price: 499, description: "For established businesses needing full power.", features: ["50 NFC cards", "Full analytics suite", "Dedicated support", "10 locations", "Advanced automation", "API access"] },
  { id: "agency", name: "Agency", price: 999, description: "For agencies managing multiple brands.", features: ["Unlimited NFC cards", "White-label", "API access", "Unlimited locations", "Custom branding", "Dedicated manager"] },
];

const optionalAddOns = [
  { id: "api", name: "API Access", price: 79, icon: Package },
  { id: "automation", name: "Advanced Automation", price: 49, icon: Zap },
  { id: "whitelabel", name: "White-Label", price: 199, icon: Palette },
  { id: "support", name: "Priority Support", price: 99, icon: Headphones },
];

const PlanBuilder = () => {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [annual, setAnnual] = useState(false);
  const [enabledAddOns, setEnabledAddOns] = useState({});
  const [extraLocations, setExtraLocations] = useState(0);

  const plan = plans.find((p) => p.id === selectedPlan);
  const discount = annual ? 0.9 : 1;
  const basePrice = plan.price * discount;
  const activeAddOns = optionalAddOns.filter((a) => enabledAddOns[a.id]);
  const addOnTotal = activeAddOns.reduce((s, a) => s + a.price, 0) * discount;
  const locationCost = extraLocations * 29 * discount;
  const subtotal = basePrice + addOnTotal + locationCost;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const toggleAddon = (id) => setEnabledAddOns((p) => ({ ...p, [id]: !p[id] }));

  return (
    <DashboardLayout title={t("planb.title")} subtitle={t("planb.subtitle")}>
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold">{t("planb.select_plan")}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className={!annual ? "text-foreground" : "text-muted-foreground"}>{t("planb.monthly")}</span>
                <Switch checked={annual} onCheckedChange={setAnnual} />
                <span className={annual ? "text-foreground" : "text-muted-foreground"}>{t("planb.annual")}</span>
                {annual && <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px]">{t("planb.save_pct")}</Badge>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((p, i) => {
                const selected = selectedPlan === p.id;
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={`border-border/50 bg-card cursor-pointer transition-all relative ${selected ? "border-glow glow-red-sm" : "hover:border-border"}`} onClick={() => setSelectedPlan(p.id)}>
                      {p.popular && <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-0 text-[10px]">{t("planb.most_popular")}</Badge>}
                      {selected && <Badge className="absolute top-3 right-3 bg-primary/20 text-primary border-0 text-[10px]">{t("planb.selected")}</Badge>}
                      <CardContent className="p-5 space-y-3">
                        <h3 className="font-display font-semibold">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                        <div className="text-2xl font-bold font-display">${Math.round(p.price * discount)}<span className="text-xs text-muted-foreground font-normal">/mo</span></div>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">{p.features.map((f) => (<li key={f} className="flex items-center gap-1.5"><Check size={12} className="text-primary shrink-0" />{f}</li>))}</ul>
                        <Button variant={selected ? "default" : "outline"} size="sm" className={`w-full text-xs ${selected ? "glow-red-hover" : ""}`}>{selected ? t("planb.selected") : t("planb.select")}</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold mb-5">{t("planb.add_features")}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {optionalAddOns.map((addon) => {
                const isOn = !!enabledAddOns[addon.id];
                return (
                  <Card key={addon.id} className={`border-border/50 bg-card transition-all ${isOn ? "border-glow" : ""}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Checkbox checked={isOn} onCheckedChange={() => toggleAddon(addon.id)} />
                      <addon.icon size={16} className={isOn ? "text-primary" : "text-muted-foreground"} />
                      <div className="flex-1"><p className="text-sm font-medium">{addon.name}</p></div>
                      <span className="text-sm font-semibold">${Math.round(addon.price * discount)}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
                    </CardContent>
                  </Card>
                );
              })}
              <Card className={`border-border/50 bg-card transition-all ${extraLocations > 0 ? "border-glow" : ""}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin size={16} className={extraLocations > 0 ? "text-primary" : "text-muted-foreground"} />
                  <div className="flex-1"><p className="text-sm font-medium">{t("planb.extra_locations")}</p><p className="text-xs text-muted-foreground">${Math.round(29 * discount)}/location/mo</p></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setExtraLocations(Math.max(0, extraLocations - 1))} className="p-1 rounded bg-secondary hover:bg-secondary/80 text-foreground"><Minus size={14} /></button>
                    <span className="text-sm font-medium w-6 text-center">{extraLocations}</span>
                    <button onClick={() => setExtraLocations(extraLocations + 1)} className="p-1 rounded bg-secondary hover:bg-secondary/80 text-foreground"><Plus size={14} /></button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        <div className="xl:w-80 shrink-0">
          <div className="xl:sticky xl:top-28 space-y-4">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display font-semibold flex items-center gap-2"><Crown size={16} className="text-primary" /> {t("planb.price_summary")}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{plan.name}</span><span>${Math.round(basePrice)}</span></div>
                  {activeAddOns.map((a) => (<div key={a.id} className="flex justify-between"><span className="text-muted-foreground">{a.name}</span><span>${Math.round(a.price * discount)}</span></div>))}
                  {extraLocations > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t("planb.extra_locations")} ×{extraLocations}</span><span>${Math.round(locationCost)}</span></div>}
                </div>
                <div className="border-t border-border/30 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("planb.subtotal")}</span><span>${Math.round(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("planb.tax")}</span><span>${Math.round(tax)}</span></div>
                </div>
                <div className="border-t border-border/30 pt-3 flex justify-between font-bold text-lg">
                  <span>{t("planb.total")}</span>
                  <span className="text-primary">${Math.round(total)}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                </div>
                {annual && <p className="text-xs text-green-400 text-center">${Math.round((subtotal / 0.9 - subtotal) * 12)}/year saved</p>}
                <Button className="w-full glow-red-hover mt-2">{t("planb.confirm_upgrade")}</Button>
                <p className="text-[10px] text-muted-foreground text-center">{t("planb.billing_note")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlanBuilder;
