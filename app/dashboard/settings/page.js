"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Building2, CreditCard, Upload, Plus, Globe, CheckCircle, Smartphone, ZoomIn, ZoomOut, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

const countries = [
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
];

const Settings = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoScale, setLogoScale] = useState(100);
  const fileInputRef = useRef(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState("select");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [annualBilling, setAnnualBilling] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [locationStep, setLocationStep] = useState("input");
  const [locationsToAdd, setLocationsToAdd] = useState(1);
  const [showBillingHistory, setShowBillingHistory] = useState(false);

  const handleLogoUpload = (e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setLogoPreview(reader.result); reader.readAsDataURL(file); } };
  const handleCountryChange = (countryName) => { const country = countries.find((c) => c.name === countryName); if (country) setSelectedCountry(country); };

  return (
    <DashboardLayout title={t("sett.title")} subtitle={t("sett.subtitle")}>
      <div className="max-w-4xl">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start mb-6 bg-secondary/50 p-1">
              <TabsTrigger value="general" className="gap-2"><Building2 size={14} /> {t("sett.general")}</TabsTrigger>
              <TabsTrigger value="subscription" className="gap-2"><CreditCard size={14} /> {t("sett.subscription")}</TabsTrigger>
            </TabsList>

          <TabsContent value="general" className="space-y-6">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("sett.business_info")}</h3><p className="text-xs text-muted-foreground">{t("sett.company_details")}</p></div></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.logo")}</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden">
                      {logoPreview ? <img src={logoPreview} alt="Logo" className="object-contain" style={{ transform: `scale(${logoScale / 100})` }} /> : <span className="font-display font-bold text-primary text-lg">R</span>}
                    </div>
                    <div className="space-y-2">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <Button variant="outline" size="sm" className="gap-2 border-border/50" onClick={() => fileInputRef.current?.click()}><Upload size={14} /> {t("sett.upload_logo")}</Button>
                      {logoPreview && (<div className="flex items-center gap-2"><button onClick={() => setLogoScale(Math.max(50, logoScale - 10))} className="p-1 rounded hover:bg-secondary"><ZoomOut size={14} /></button><span className="text-xs text-muted-foreground w-10 text-center">{logoScale}%</span><button onClick={() => setLogoScale(Math.min(200, logoScale + 10))} className="p-1 rounded hover:bg-secondary"><ZoomIn size={14} /></button></div>)}
                    </div>
                  </div>
                </div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.full_name")}</label><Input className="bg-secondary/50 border-border/50" defaultValue="John Doe" /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.business_name")}</label><Input className="bg-secondary/50 border-border/50" defaultValue="Opinoor Inc." /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.vat")}</label><Input className="bg-secondary/50 border-border/50" placeholder="e.g. FR12345678901" /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.trade")}</label><Input className="bg-secondary/50 border-border/50" placeholder="e.g. 123456789" /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.contact_email")}</label><Input className="bg-secondary/50 border-border/50" defaultValue="contact@opinoor.com" type="email" /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.country")}</label><select value={selectedCountry.name} onChange={(e) => handleCountryChange(e.target.value)} className="w-full h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm">{countries.map((c) => (<option key={c.name} value={c.name}>{c.flag} {c.name}</option>))}</select></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.phone")}</label><div className="flex gap-2"><div className="flex items-center gap-1 px-3 rounded-md border border-border/50 bg-secondary/50 text-sm min-w-[80px]"><span>{selectedCountry.flag}</span><span className="text-xs">{selectedCountry.code}</span></div><Input className="bg-secondary/50 border-border/50 flex-1" defaultValue="555 000-0000" /></div></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.address")}</label><Input className="bg-secondary/50 border-border/50" defaultValue="123 Main St, New York, NY" /></div>
              </div>
              <Button size="sm" className="mt-6 glow-red-hover">{t("sett.save_changes")}</Button>
            </motion.div>

          </TabsContent>

            <TabsContent value="subscription">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><CreditCard size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("sett.subscription_title")}</h3><p className="text-xs text-muted-foreground">{t("sett.subscription_desc")}</p></div></div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 mb-4">
                <div className="flex items-center justify-between"><div><span className="text-sm font-medium">Growth Plan</span><span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{t("sett.active")}</span></div><span className="font-display text-xl font-bold">$129<span className="text-sm text-muted-foreground font-normal">/mo</span></span></div>
                <p className="text-xs text-muted-foreground mt-1">15 Smart Review Cards • 3 Locations • Next billing: Mar 15, 2026</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" className="glow-red-hover" onClick={() => setShowUpgrade(true)}>{t("sett.upgrade_plan")}</Button>
                <Button variant="outline" size="sm" className="border-border/50 gap-2" onClick={() => setShowLocations(true)}><Plus size={14} /> {t("sett.add_locations")}</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowBillingHistory(true)}>{t("sett.billing_history")}</Button>
              </div>
              <div className="mt-4 rounded-lg bg-secondary/30 p-4">
                <span className="text-xs text-muted-foreground block mb-2">{t("sett.recent_invoices")}</span>
                {[{ date: "Feb 15, 2026", amount: "$129.00", status: "Paid" }, { date: "Jan 15, 2026", amount: "$129.00", status: "Paid" }, { date: "Dec 15, 2025", amount: "$129.00", status: "Paid" }].map((inv, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0"><span className="text-xs">{inv.date}</span><span className="text-xs font-medium">{inv.amount}</span><span className="text-xs text-emerald-400">{inv.status}</span></div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showUpgrade} onOpenChange={(open) => { setShowUpgrade(open); if (!open) { setUpgradeStep("select"); setSelectedPlan(null); setAnnualBilling(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{upgradeStep === "select" ? t("sett.upgrade_plan") : "Confirm Plan Change"}</DialogTitle></DialogHeader>
          {upgradeStep === "select" ? (
            <>
              <div className="flex items-center justify-center gap-3 rounded-lg bg-secondary/30 p-3 mb-1">
                <span className={`text-sm font-medium ${!annualBilling ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                <button onClick={() => setAnnualBilling(!annualBilling)} className={`relative w-11 h-6 rounded-full transition-colors ${annualBilling ? "bg-primary" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${annualBilling ? "left-[22px]" : "left-0.5"}`} />
                </button>
                <span className={`text-sm font-medium ${annualBilling ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
                {annualBilling && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">Save up to 20%</span>}
                <div className="relative group">
                  <Info size={14} className="text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg border border-border/50 bg-popover p-3 text-xs shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                    <p className="font-semibold mb-1.5">Annual billing includes:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary shrink-0" />Up to 20% off monthly price</li>
                      <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary shrink-0" />Locked-in rate for 12 months</li>
                      <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary shrink-0" />Priority support included</li>
                      <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary shrink-0" />Cancel anytime, prorated refund</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[{ name: "Starter", rawPrice: 129, yearlyPrice: 99, features: "5 Cards, 1 Location, Basic Analytics" }, { name: "Growth", rawPrice: 249, yearlyPrice: 199, features: "15 Cards, 3 Locations, Advanced Analytics", current: true }, { name: "Pro", rawPrice: 499, yearlyPrice: 399, features: "50 Cards, 10 Locations, API Access, Priority Support" }, { name: "Agency", rawPrice: 999, yearlyPrice: 799, features: "Unlimited Cards, White-Label, Dedicated Manager" }].map((plan) => {
                  const displayPrice = annualBilling ? plan.yearlyPrice : plan.rawPrice;
                  const priceLabel = `$${displayPrice}/mo`;
                  const yearlyTotal = annualBilling ? displayPrice * 12 : null;
                  return (
                    <div key={plan.name} onClick={() => !plan.current && setSelectedPlan({ ...plan, price: priceLabel, rawPrice: displayPrice })} className={`rounded-lg border p-4 cursor-pointer transition-all ${plan.current ? "border-primary bg-primary/5 opacity-60 cursor-default" : selectedPlan?.name === plan.name ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"}`}>
                      <div className="flex items-center justify-between">
                        <div><span className="text-sm font-semibold">{plan.name}</span>{plan.current && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">{t("sett.current")}</span>}{selectedPlan?.name === plan.name && !plan.current && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">Selected</span>}</div>
                        <div className="text-right">
                          <span className="font-display font-bold">{priceLabel}</span>
                          {annualBilling && <span className="block text-[10px] text-muted-foreground line-through">${plan.rawPrice}/mo</span>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{plan.features}</p>
                      {annualBilling && yearlyTotal && <p className="text-[11px] text-primary mt-1 font-medium">Billed ${yearlyTotal.toLocaleString()}/year — Save ${(plan.rawPrice - displayPrice) * 12}/yr</p>}
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUpgrade(false)}>{t("sett.cancel")}</Button>
                <Button className="glow-red-hover" disabled={!selectedPlan} onClick={() => setUpgradeStep("confirm")}>Continue</Button>
              </DialogFooter>
            </>
          ) : selectedPlan && (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Current plan</span><span>Growth — $249/mo</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">New plan</span><span className="font-semibold">{selectedPlan.name} — {selectedPlan.price}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Billing cycle</span><span className="font-medium">{annualBilling ? "Annual" : "Monthly"}</span></div>
                  {annualBilling && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Annual total</span><span className="font-semibold text-primary">${(selectedPlan.rawPrice * 12).toLocaleString()}/yr</span></div>}
                  <div className="border-t border-border/30 pt-2">
                    <p className="text-xs font-medium mb-1">Includes:</p>
                    <p className="text-xs text-muted-foreground">{selectedPlan.features}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Your plan will be updated immediately. Billing will be prorated for the current period.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUpgradeStep("select")}>Back</Button>
                <Button className="glow-red-hover" onClick={() => { setShowUpgrade(false); setUpgradeStep("select"); setSelectedPlan(null); setAnnualBilling(false); router.push("/dashboard/billing"); }}>{t("sett.confirm_upgrade")}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showLocations} onOpenChange={(open) => { setShowLocations(open); if (!open) setLocationStep("input"); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locationStep === "input" ? t("sett.add_locations") : "Confirm Your Selection"}</DialogTitle></DialogHeader>
          {locationStep === "input" ? (
            <>
              <div className="space-y-4">
                <div className="rounded-lg bg-secondary/30 p-4">
                  <p className="text-sm">Current: <strong>3 locations</strong></p>
                  <p className="text-xs text-muted-foreground">Each additional location costs $29/mo</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Number of Locations to Add</label>
                  <Input type="number" value={locationsToAdd} min={1} onChange={(e) => setLocationsToAdd(Math.max(1, parseInt(e.target.value) || 1))} className="bg-secondary/50 border-border/50" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLocations(false)}>{t("sett.cancel")}</Button>
                <Button className="glow-red-hover" onClick={() => setLocationStep("confirm")}>Continue</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Locations to add</span><span className="font-semibold">{locationsToAdd}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cost per location</span><span>$29/mo</span></div>
                  <div className="border-t border-border/30 pt-2 flex justify-between text-sm font-semibold"><span>Additional monthly cost</span><span className="text-primary">${locationsToAdd * 29}/mo</span></div>
                </div>
                <p className="text-xs text-muted-foreground">You'll be redirected to the Add-Ons page to finalize your subscription changes.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLocationStep("input")}>Back</Button>
                <Button className="glow-red-hover" onClick={() => { setShowLocations(false); setLocationStep("input"); router.push(`/dashboard/addons?activate=location&qty_location=${locationsToAdd}`); }}>Confirm & Continue</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBillingHistory} onOpenChange={setShowBillingHistory}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{t("sett.billing_history")}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {[{ date: "Feb 15, 2026", desc: "Growth Plan", amount: "$129.00", status: "Paid" }, { date: "Jan 15, 2026", desc: "Growth Plan", amount: "$129.00", status: "Paid" }, { date: "Dec 15, 2025", desc: "Growth Plan", amount: "$129.00", status: "Paid" }, { date: "Nov 15, 2025", desc: "Starter Plan", amount: "$49.00", status: "Paid" }, { date: "Oct 15, 2025", desc: "Starter Plan", amount: "$49.00", status: "Paid" }].map((inv, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0"><div><span className="text-sm">{inv.date}</span><p className="text-xs text-muted-foreground">{inv.desc}</p></div><div className="text-right"><span className="text-sm font-medium">{inv.amount}</span><p className="text-xs text-emerald-400">{inv.status}</p></div></div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
