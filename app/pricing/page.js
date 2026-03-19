"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 49,
    yearlyPrice: 39,
    cards: "5 Smart Review Cards included",
    desc: "Perfect for single-location businesses. Purchase your cards to activate the dashboard and start collecting reviews.",
    features: [
      "5 NFC Smart Review Cards", "1 Location", "100 Review Requests/mo",
      "Email Campaigns", "Basic Analytics", "Review Widget", "Email Support",
    ],
    popular: false,
  },
  {
    name: "Growth",
    monthlyPrice: 129,
    yearlyPrice: 99,
    cards: "15 Smart Review Cards included",
    desc: "For growing businesses. Your card purchase unlocks multi-location dashboard access with advanced automation.",
    features: [
      "15 NFC Smart Review Cards", "Up to 5 Locations", "Unlimited Review Requests",
      "SMS + Email Campaigns", "Advanced Analytics", "Smart Filtering",
      "QR Code Generator", "Review Widgets", "Priority Support", "Automation Workflows",
    ],
    popular: true,
  },
  {
    name: "Dominator",
    monthlyPrice: 299,
    yearlyPrice: 249,
    cards: "50 Smart Review Cards included",
    desc: "For enterprises and agencies. Bulk card order activates full platform access with white-label capabilities.",
    features: [
      "50 NFC Smart Review Cards", "Unlimited Locations", "Unlimited Everything",
      "SMS + Email + AI", "Enterprise Analytics", "Smart Filtering", "QR Codes",
      "Custom Widgets", "Dedicated Account Manager", "API Access",
      "White-Label Option", "Custom Integrations",
    ],
    popular: false,
  },
];

const comparisonRows = [
  { feature: "Smart Review Cards", starter: "5 included", growth: "15 included", dominator: "50 included" },
  { feature: "Locations", starter: "1", growth: "Up to 5", dominator: "Unlimited" },
  { feature: "Review Requests", starter: "100/mo", growth: "Unlimited", dominator: "Unlimited" },
  { feature: "SMS Campaigns", starter: "—", growth: "✓", dominator: "✓" },
  { feature: "Email Campaigns", starter: "✓", growth: "✓", dominator: "✓" },
  { feature: "Smart Filtering", starter: "—", growth: "✓", dominator: "✓" },
  { feature: "Analytics", starter: "Basic", growth: "Advanced", dominator: "Enterprise" },
  { feature: "QR Codes", starter: "—", growth: "✓", dominator: "✓" },
  { feature: "Review Widgets", starter: "1", growth: "Unlimited", dominator: "Custom" },
  { feature: "Automation Workflows", starter: "—", growth: "✓", dominator: "✓" },
  { feature: "API Access", starter: "—", growth: "—", dominator: "✓" },
  { feature: "White-Label", starter: "—", growth: "—", dominator: "Add-on" },
  { feature: "Support", starter: "Email", growth: "Priority", dominator: "Dedicated AM" },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-dark pt-32">
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
              <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl font-bold md:text-6xl">
              {t("pricing.hero_title_1")}{" "}
              <span className="text-gradient-red">{t("pricing.hero_title_2")}</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="mt-6 text-lg text-muted-foreground">
              {t("pricing.hero_desc")}
            </motion.p>

            {/* Toggle */}
            <motion.div variants={fadeUp} custom={2} className="mt-8 inline-flex items-center gap-3 rounded-full border border-border/50 bg-secondary p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${!isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t("pricing.monthly")}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t("pricing.yearly")} <span className="ml-1 text-xs opacity-80">{t("shop.months_free")}</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Plans */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className={`relative rounded-xl border p-8 ${
                  plan.popular
                    ? "border-primary/50 bg-gradient-card glow-red"
                    : "border-border/50 bg-gradient-card"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                     {t("shop.most_popular")}
                   </span>
                )}
                <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-xs font-medium text-primary">{plan.cards}</p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mt-6">
                  <span className="font-display text-5xl font-bold">
                    {formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                  </span>
                  <span className="text-muted-foreground">{t("shop.per_month")}</span>
                </div>
                {isYearly && (
                   <p className="mt-1 text-xs text-primary">
                     {t("shop.billed")} {formatPrice(plan.yearlyPrice * 12)}{t("shop.per_year")} — {t("shop.save")} {formatPrice((plan.monthlyPrice - plan.yearlyPrice) * 12)}
                   </p>
                )}
                <Link href="/signup" className="mt-6 block">
                  <Button className={`w-full ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-red-hover" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                    {t("shop.start_free_trial")} <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check size={16} className="text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-24 max-w-5xl mx-auto"
          >
            <h2 className="font-display text-2xl font-bold text-center mb-8">{t("pricing.full_comparison")}</h2>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/50">
                    <th className="p-4 text-left text-sm font-semibold">{t("pricing.feature")}</th>
                    <th className="p-4 text-center text-sm font-semibold">Starter</th>
                    <th className="p-4 text-center text-sm font-semibold text-primary">Growth</th>
                    <th className="p-4 text-center text-sm font-semibold">Dominator</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/30 last:border-0">
                      <td className="p-4 text-sm text-muted-foreground">{row.feature}</td>
                      <td className="p-4 text-center text-sm">{row.starter}</td>
                      <td className="p-4 text-center text-sm text-primary">{row.growth}</td>
                      <td className="p-4 text-center text-sm">{row.dominator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ROI */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-24 mx-auto max-w-3xl text-center"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold">
              {t("pricing.roi_title_1")} <span className="text-gradient-red">{t("pricing.roi_title_2")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground">
              {t("pricing.roi_desc")}
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm text-primary">
              <Check size={14} /> {t("pricing.roi_badge")}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
