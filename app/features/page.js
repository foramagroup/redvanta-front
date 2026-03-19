"use client";

import { motion } from "framer-motion";
import { Shield, Filter, TrendingUp, Zap, BarChart3, Star, QrCode, MapPin, Mail, MessageSquare, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

const featureData = [
  { icon: Zap, titleKey: "features.f1_title", descKey: "features.f1_desc", catKey: "features.cat_acquisition" },
  { icon: Filter, titleKey: "features.f2_title", descKey: "features.f2_desc", catKey: "features.cat_protection" },
  { icon: BarChart3, titleKey: "features.f3_title", descKey: "features.f3_desc", catKey: "features.cat_intelligence" },
  { icon: Star, titleKey: "features.f4_title", descKey: "features.f4_desc", catKey: "features.cat_conversion" },
  { icon: QrCode, titleKey: "features.f5_title", descKey: "features.f5_desc", catKey: "features.cat_acquisition" },
  { icon: MapPin, titleKey: "features.f6_title", descKey: "features.f6_desc", catKey: "features.cat_scale" },
  { icon: Mail, titleKey: "features.f7_title", descKey: "features.f7_desc", catKey: "features.cat_acquisition" },
  { icon: MessageSquare, titleKey: "features.f8_title", descKey: "features.f8_desc", catKey: "features.cat_acquisition" },
  { icon: Globe, titleKey: "features.f9_title", descKey: "features.f9_desc", catKey: "features.cat_distribution" },
  { icon: Shield, titleKey: "features.f10_title", descKey: "features.f10_desc", catKey: "features.cat_protection" },
  { icon: TrendingUp, titleKey: "features.f11_title", descKey: "features.f11_desc", catKey: "features.cat_intelligence" },
  { icon: Lock, titleKey: "features.f12_title", descKey: "features.f12_desc", catKey: "features.cat_scale" },
];

const Features = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-gradient-dark pt-32">
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-primary">{t("features.badge")}</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="mt-4 font-display text-4xl font-bold md:text-6xl">
              {t("features.hero_title_1")} <span className="text-gradient-red">{t("features.hero_title_2")}</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t("features.hero_desc")}
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureData.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="group rounded-xl border border-border/50 bg-gradient-card p-8 transition-all hover:border-primary/30 hover:glow-red-sm">
                <div className="flex items-center justify-between">
                  <feature.icon className="text-primary" size={28} />
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">{t(feature.catKey)}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{t(feature.titleKey)}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-20 text-center">
            <Link href="/signup">
              <Button size="lg" className="glow-red bg-primary text-primary-foreground hover:bg-primary/90 px-10 text-base font-semibold">
                {t("auth.start_free_trial")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;
