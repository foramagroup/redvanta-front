"use client";

import { motion } from "framer-motion";
import { Building2, Palette, Globe, Users, LayoutDashboard, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Agency = () => {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const agencyFeatures = [
    { icon: Palette, titleKey: "agency.feature_1_title", descKey: "agency.feature_1_desc" },
    { icon: Globe, titleKey: "agency.feature_2_title", descKey: "agency.feature_2_desc" },
    { icon: Users, titleKey: "agency.feature_3_title", descKey: "agency.feature_3_desc" },
    { icon: LayoutDashboard, titleKey: "agency.feature_4_title", descKey: "agency.feature_4_desc" },
    { icon: DollarSign, titleKey: "agency.feature_5_title", descKey: "agency.feature_5_desc" },
    { icon: Building2, titleKey: "agency.feature_6_title", descKey: "agency.feature_6_desc" },
  ];

  const planFeatures = [
    "agency.plan_feature_1",
    "agency.plan_feature_2",
    "agency.plan_feature_3",
    "agency.plan_feature_4",
    "agency.plan_feature_5",
    "agency.plan_feature_6",
    "agency.plan_feature_7",
    "agency.plan_feature_8",
  ];

  return (
    <div className="bg-gradient-dark pt-32">
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-primary">
              {t("agency.badge")}
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="mt-4 font-display text-4xl font-bold md:text-6xl">
              {t("agency.hero_title_1")}{" "}
              <span className="text-gradient-red">{t("agency.hero_title_2")}</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t("agency.hero_desc")}
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8">
              <Link href="/contact">
                <Button size="lg" className="glow-red bg-primary text-primary-foreground hover:bg-primary/90 px-10 text-base font-semibold">
                  {t("agency.apply_cta")} <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {agencyFeatures.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="rounded-xl border border-border/50 bg-gradient-card p-8 hover:border-primary/30 transition-colors"
              >
                <item.icon className="text-primary" size={32} />
                <h3 className="mt-4 font-display text-xl font-semibold">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto max-w-2xl rounded-2xl border border-primary/30 bg-gradient-card p-12 text-center glow-red"
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold">{t("agency.plan_title")}</motion.h2>
            <motion.div variants={fadeUp} custom={1} className="mt-6">
              <span className="font-display text-6xl font-bold">{formatPrice(999)}</span>
              <span className="text-muted-foreground">{t("agency.plan_per_month")}</span>
            </motion.div>
            <motion.ul variants={fadeUp} custom={2} className="mt-8 space-y-3 text-left max-w-sm mx-auto">
              {planFeatures.map((key, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className="text-primary shrink-0" /> {t(key)}
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp} custom={3} className="mt-8">
              <Link href="/contact">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-red-hover px-10 text-base font-semibold">
                  {t("agency.apply_now")}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Business Case */}
      <section className="section-spacing bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="font-display text-3xl font-bold md:text-4xl">
              {t("agency.opportunity_title_1")} <span className="text-gradient-red">{t("agency.opportunity_title_2")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-6 text-muted-foreground leading-relaxed">
              {t("agency.opportunity_desc")}
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Agency;
