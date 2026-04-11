"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Filter, TrendingUp, Star, BarChart3, QrCode, MapPin, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomePage() {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const problems = [
    { titleKey: "landing.problem_1_title", descKey: "landing.problem_1_desc" },
    { titleKey: "landing.problem_2_title", descKey: "landing.problem_2_desc" },
    { titleKey: "landing.problem_3_title", descKey: "landing.problem_3_desc" },
  ];

  const steps = [
    { step: "01", icon: Zap, titleKey: "landing.step_1_title", descKey: "landing.step_1_desc" },
    { step: "02", icon: Filter, titleKey: "landing.step_2_title", descKey: "landing.step_2_desc" },
    { step: "03", icon: TrendingUp, titleKey: "landing.step_3_title", descKey: "landing.step_3_desc" },
  ];

  const features = [
    { icon: Zap, titleKey: "landing.feature_1_title", descKey: "landing.feature_1_desc" },
    { icon: Filter, titleKey: "landing.feature_2_title", descKey: "landing.feature_2_desc" },
    { icon: BarChart3, titleKey: "landing.feature_3_title", descKey: "landing.feature_3_desc" },
    { icon: Star, titleKey: "landing.feature_4_title", descKey: "landing.feature_4_desc" },
    { icon: QrCode, titleKey: "landing.feature_5_title", descKey: "landing.feature_5_desc" },
    { icon: MapPin, titleKey: "landing.feature_6_title", descKey: "landing.feature_6_desc" },
  ];

  const roiStats = [
    { value: "+127", labelKey: "landing.roi_stat_1" },
    { value: "→", labelKey: "" },
    { value: "4.8★", labelKey: "landing.roi_stat_2" },
    { value: "→", labelKey: "" },
    { value: "+40%", labelKey: "landing.roi_stat_3" },
    { value: "→", labelKey: "" },
    { value: "$52K", labelKey: "landing.roi_stat_4" },
  ];
  return (
 <div className="bg-gradient-dark">
      {/* HERO */}
      <section className="relative overflow-hidden section-spacing pt-32 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(1_100%_44%/0.08),transparent_60%)]" />
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial="hidden" animate="visible" className="relative z-10">
              <motion.p variants={fadeUp} custom={0} className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                {t("landing.badge")}
              </motion.p>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
                {t("landing.hero_title_1")}{" "}
                <span className="text-gradient-red">{t("landing.hero_title_2")}</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                {t("landing.hero_desc")}
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button size="lg" className="glow-red bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base font-semibold">
                    {t("auth.start_free_trial")}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary px-8 text-base">
                    {t("home.book_demo")}
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> {t("landing.no_credit_card")}</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> {t("landing.free_trial_days")}</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-2xl bg-primary/5 blur-3xl" />
              <img
                src="/assets/dashboard-mockup.png"
                alt={t("landing.dashboard_alt")}
                className="relative rounded-xl border border-border/50 glow-red-sm"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* THE REPUTATION PROBLEM */}
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-5xl">
              {t("landing.problem_title_1")}{" "}
              <span className="text-gradient-red">{t("landing.problem_title_2")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t("landing.problem_desc")}
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 md:grid-cols-3">
            {problems.map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="rounded-xl border border-border/50 bg-card p-8 bg-gradient-card">
                <h3 className="font-display text-xl font-bold text-primary">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* THE Opinoor SYSTEM */}
      <section className="section-spacing bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-5xl">
              {t("landing.system_title")}
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg text-muted-foreground">{t("landing.system_desc")}</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="relative rounded-xl border border-border/50 bg-card p-8 bg-gradient-card group hover:border-primary/30 transition-colors">
                <span className="font-display text-5xl font-bold text-primary/20">{item.step}</span>
                <item.icon className="mt-4 text-primary" size={32} />
                <h3 className="mt-4 font-display text-xl font-bold">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-5xl">
              {t("landing.features_title_1")}{" "}
              <span className="text-gradient-red">{t("landing.features_title_2")}</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="rounded-xl border border-border/50 bg-card p-6 bg-gradient-card group hover:border-primary/30 transition-all hover:glow-red-sm">
                <feature.icon className="text-primary" size={28} />
                <h3 className="mt-4 font-display text-lg font-semibold">{t(feature.titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="section-spacing bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-5xl">
              {t("landing.command_center_1")} <span className="text-gradient-red">{t("landing.command_center_2")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg text-muted-foreground">
              {t("landing.command_center_desc")}
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-primary/5 blur-3xl" />
              <img src="/assets/dashboard-mockup.png" alt={t("landing.command_center_alt")} className="relative w-full rounded-xl border border-border/50 glow-red-sm" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ROI SECTION */}
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-5xl">
              {t("landing.roi_title_1")} <span className="text-gradient-red">{t("landing.roi_title_2")}</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {roiStats.map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="text-center">
                <div className={`font-display text-3xl md:text-4xl font-bold ${item.labelKey ? "text-primary" : "text-muted-foreground"}`}>
                  {item.value}
                </div>
                {item.labelKey && <p className="mt-1 text-xs text-muted-foreground">{t(item.labelKey)}</p>}
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center text-muted-foreground"
          >
            {t("landing.roi_disclaimer")}
          </motion.p>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="section-spacing bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-5xl">
              {t("landing.pricing_title_1")} <span className="text-gradient-red">{t("landing.pricing_title_2")}</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { name: "Starter", price: 49, popular: false },
              { name: "Growth", price: 129, popular: true },
              { name: "Dominator", price: 299, popular: false },
            ].map((plan, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className={`rounded-xl border p-8 text-center ${
                  plan.popular
                    ? "border-primary/50 bg-gradient-card glow-red relative"
                    : "border-border/50 bg-gradient-card"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    {t("shop.most_popular")}
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="font-display text-4xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground">{t("shop.per_month")}</span>
                </div>
                <Link href="/pricing" className="mt-6 block">
                  <Button className={`w-full ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                    {t("shop.view_details")}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-5xl">
              {t("landing.cta_title_1")}{" "}
              <span className="text-gradient-red">{t("landing.cta_title_2")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-6 text-lg text-muted-foreground">
              {t("landing.cta_desc")}
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8">
              <Link href="/signup">
                <Button size="lg" className="glow-red animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 px-10 text-base font-semibold">
                  {t("auth.start_free_trial")} <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
