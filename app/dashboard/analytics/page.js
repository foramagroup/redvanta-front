"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Star, MessageSquare, TrendingUp, TrendingDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const allData = {
  "7d": [
    { month: "Mon", reviews: 18, rating: 4.8 },
    { month: "Tue", reviews: 22, rating: 4.7 },
    { month: "Wed", reviews: 15, rating: 4.9 },
    { month: "Thu", reviews: 28, rating: 4.6 },
    { month: "Fri", reviews: 31, rating: 4.8 },
    { month: "Sat", reviews: 12, rating: 4.7 },
    { month: "Sun", reviews: 8, rating: 4.9 },
  ],
  "30d": [
    { month: "Week 1", reviews: 85, rating: 4.5 },
    { month: "Week 2", reviews: 92, rating: 4.6 },
    { month: "Week 3", reviews: 110, rating: 4.7 },
    { month: "Week 4", reviews: 127, rating: 4.8 },
  ],
  "6m": [
    { month: "Sep", reviews: 45, rating: 4.2 },
    { month: "Oct", reviews: 62, rating: 4.4 },
    { month: "Nov", reviews: 78, rating: 4.5 },
    { month: "Dec", reviews: 95, rating: 4.6 },
    { month: "Jan", reviews: 110, rating: 4.7 },
    { month: "Feb", reviews: 127, rating: 4.8 },
  ],
  "1y": [
    { month: "Mar", reviews: 25, rating: 4.0 },
    { month: "Apr", reviews: 30, rating: 4.1 },
    { month: "May", reviews: 35, rating: 4.2 },
    { month: "Jun", reviews: 38, rating: 4.2 },
    { month: "Jul", reviews: 42, rating: 4.3 },
    { month: "Aug", reviews: 40, rating: 4.3 },
    { month: "Sep", reviews: 45, rating: 4.4 },
    { month: "Oct", reviews: 62, rating: 4.5 },
    { month: "Nov", reviews: 78, rating: 4.6 },
    { month: "Dec", reviews: 95, rating: 4.7 },
    { month: "Jan", reviews: 110, rating: 4.7 },
    { month: "Feb", reviews: 127, rating: 4.8 },
  ],
};

const locationData = [
  { name: "Downtown", reviews: 523, rating: 4.9, conversion: 38 },
  { name: "Midtown", reviews: 412, rating: 4.7, conversion: 32 },
  { name: "Westside", reviews: 312, rating: 4.6, conversion: 29 },
];

const Analytics = () => {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState("6m");

  const monthlyData = allData[dateRange];
  const maxReviews = useMemo(() => Math.max(...monthlyData.map((d) => d.reviews)), [monthlyData]);

  const kpis = [
    { labelKey: "anal.total_reviews", value: "1,247", change: "+127", trend: "up", icon: MessageSquare },
    { labelKey: "anal.avg_rating", value: "4.8", change: "+0.3", trend: "up", icon: Star },
    { labelKey: "anal.conversion_rate", value: "34%", change: "+8%", trend: "up", icon: TrendingUp },
    { labelKey: "anal.negative_rate", value: "5%", change: "-2%", trend: "down", icon: TrendingDown },
  ];

  const funnelSteps = [
    { labelKey: "anal.card_scans", value: 3680, pct: 100 },
    { labelKey: "anal.page_views", value: 2576, pct: 70 },
    { labelKey: "anal.feedback_given", value: 1247, pct: 34 },
    { labelKey: "anal.public_reviews", value: 847, pct: 23 },
  ];

  const exportData = () => {
    const rows = monthlyData.map((d) => `"${d.month}",${d.reviews},${d.rating}`);
    const csv = `Period,Reviews,Rating\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t("anal.exported"), description: t("anal.exported_desc") });
  };

  return (
    <DashboardLayout
      title={t("anal.title")}
      subtitle={t("anal.subtitle")}
      headerAction={
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-border/50 overflow-hidden">
            {["7d", "30d", "6m", "1y"].map((r) => (
              <button key={r} onClick={() => setDateRange(r)} className={`px-3 py-2 text-xs font-medium transition-colors ${dateRange === r ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>{r}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2 border-border/50" onClick={exportData}><Download size={16} /> {t("anal.export")}</Button>
        </div>
      }
    >
      <motion.div variants={fadeUp} custom={0} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t(kpi.labelKey)}</span>
              <kpi.icon size={18} className="text-primary" />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-3xl font-bold">{kpi.value}</span>
              <span className={`mb-1 text-xs font-medium ${kpi.trend === "up" ? "text-primary" : "text-emerald-400"}`}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6">
          <h3 className="font-display font-semibold mb-6">{t("anal.review_growth")} ({dateRange})</h3>
          <div className="h-56 flex items-end gap-2">
            {monthlyData.map((d, i) => (
              <div key={`${dateRange}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-primary">{d.reviews}</span>
                <motion.div key={`bar-${dateRange}-${i}`} initial={{ height: 0 }} animate={{ height: `${(d.reviews / maxReviews) * 100}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer" />
                <span className="text-xs text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6">
          <h3 className="font-display font-semibold mb-6">{t("anal.rating_distribution")}</h3>
          <div className="space-y-4">
            {[
              { stars: 5, pct: 68, count: 847 },
              { stars: 4, pct: 19, count: 231 },
              { stars: 3, pct: 8, count: 98 },
              { stars: 2, pct: 3, count: 42 },
              { stars: 1, pct: 2, count: 29 },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm text-muted-foreground">{row.stars}</span>
                  <Star size={14} className="text-primary fill-primary" />
                </div>
                <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${row.pct}%` }} transition={{ delay: 0.6, duration: 0.6 }} className="h-full rounded-full bg-primary" />
                </div>
                <span className="w-12 text-right text-xs text-muted-foreground">{row.pct}%</span>
                <span className="w-12 text-right text-xs text-muted-foreground">{row.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <h3 className="font-display font-semibold mb-6">{t("anal.conversion_funnel")}</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {funnelSteps.map((step, i) => (
            <div key={i} className="flex-1 w-full text-center">
              <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }} className="origin-bottom">
                <div className="mx-auto rounded-lg bg-primary/80 mb-3 transition-colors hover:bg-primary" style={{ height: `${step.pct * 1.5}px`, maxWidth: "80px", width: "100%" }} />
              </motion.div>
              <span className="font-display text-lg font-bold block">{step.value.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{t(step.labelKey)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={4} className="rounded-xl border border-border/50 bg-gradient-card p-6">
        <h3 className="font-display font-semibold mb-6">{t("anal.location_comparison")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("anal.location")}</th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("anal.reviews")}</th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("anal.rating")}</th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("anal.conversion")}</th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("anal.performance")}</th>
              </tr>
            </thead>
            <tbody>
              {locationData.map((loc) => (
                <tr key={loc.name} className="border-b border-border/30">
                  <td className="py-4 text-sm font-medium">{loc.name}</td>
                  <td className="py-4 text-sm text-muted-foreground">{loc.reviews}</td>
                  <td className="py-4"><div className="flex items-center gap-1"><Star size={14} className="text-primary fill-primary" /><span className="text-sm">{loc.rating}</span></div></td>
                  <td className="py-4 text-sm text-muted-foreground">{loc.conversion}%</td>
                  <td className="py-4"><div className="w-full max-w-[120px] h-2 rounded-full bg-secondary overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${loc.conversion * 2.5}%` }} transition={{ delay: 1, duration: 0.5 }} className="h-full rounded-full bg-primary" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Analytics;
