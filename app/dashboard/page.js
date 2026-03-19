"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp, MapPin, MessageSquare, BarChart3 } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const recentFeedback = [
  { name: "Sarah M.", rating: 5, text: "Incredible service! Will definitely come back.", time: "2 min ago", platform: "Google" },
  { name: "James K.", rating: 5, text: "Best experience I've had. Highly recommend.", time: "15 min ago", platform: "Yelp" },
  { name: "Maria L.", rating: 4, text: "Great quality, slightly slow service.", time: "1 hr ago", platform: "Google" },
  { name: "David P.", rating: 5, text: "Outstanding! Exceeded expectations.", time: "2 hrs ago", platform: "Facebook" },
  { name: "Lisa T.", rating: 3, text: "Good but could improve wait times.", time: "3 hrs ago", platform: "Private" },
];

const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout
      title={t("dashboard.title")}
      subtitle={t("dashboard.subtitle")}
      headerAction={
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2">
          <MapPin size={16} className="text-primary" />
          <span className="text-sm">{t("dashboard.all_locations")} (3)</span>
        </div>
      }
    >
      {/* Stats Cards */}
      <motion.div variants={fadeUp} custom={1} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { labelKey: "dashboard.avg_rating", value: "4.8", change: "+0.3", icon: Star },
          { labelKey: "dashboard.total_reviews", value: "1,247", change: "+127", icon: MessageSquare },
          { labelKey: "dashboard.response_rate", value: "94%", change: "+8%", icon: TrendingUp },
          { labelKey: "dashboard.revenue_impact", value: "+$52K", change: "+23%", icon: BarChart3 },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t(stat.labelKey)}</span>
              <stat.icon size={18} className="text-primary" />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-display text-3xl font-bold">{stat.value}</span>
              <span className="mb-1 text-xs text-primary font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts + Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={fadeUp} custom={2} className="lg:col-span-2 rounded-xl border border-border/50 bg-gradient-card p-6">
          <h3 className="font-display font-semibold mb-6">{t("dashboard.review_growth")}</h3>
          <div className="h-64 flex items-end gap-3">
            {[45, 62, 78, 95, 110, 127].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 127) * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                />
                <span className="text-xs text-muted-foreground">
                  {[t("dashboard.month_sep"), t("dashboard.month_oct"), t("dashboard.month_nov"), t("dashboard.month_dec"), t("dashboard.month_jan"), t("dashboard.month_feb")][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
          <h3 className="font-display font-semibold mb-4">{t("dashboard.recent_feedback")}</h3>
          <div className="space-y-4">
            {recentFeedback.map((item, i) => (
              <div key={i} className="border-b border-border/30 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={12} className={j < item.rating ? "text-primary fill-primary" : "text-muted"} />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">{item.platform}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Rating Distribution */}
      <motion.div variants={fadeUp} custom={4} className="mt-6 rounded-xl border border-border/50 bg-gradient-card p-6">
        <h3 className="font-display font-semibold mb-4">{t("dashboard.rating_distribution")}</h3>
        <div className="space-y-3">
          {[
            { stars: 5, count: 847, pct: 68 },
            { stars: 4, count: 231, pct: 19 },
            { stars: 3, count: 98, pct: 8 },
            { stars: 2, count: 42, pct: 3 },
            { stars: 1, count: 29, pct: 2 },
          ].map((row) => (
            <div key={row.stars} className="flex items-center gap-3">
              <span className="w-12 text-sm text-muted-foreground">{row.stars} {t("dashboard.star")}</span>
              <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <span className="w-16 text-right text-sm text-muted-foreground">{row.count}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
