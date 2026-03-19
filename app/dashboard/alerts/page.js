"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, AlertTriangle, Star, BarChart3, Mail, MessageSquare, Play, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const alertHistory = [
  { id: 1, type: "negative", title: "Negative Review Alert", message: "David P. left a 2-star review at Downtown location.", time: "2 hrs ago", read: false },
  { id: 2, type: "review", title: "New Public Review", message: "Sarah M. left a 5-star review on Google.", time: "3 hrs ago", read: false },
  { id: 3, type: "review", title: "New Public Review", message: "James K. left a 5-star review on Yelp.", time: "5 hrs ago", read: true },
  { id: 4, type: "summary", title: "Weekly Performance Summary", message: "Your average rating increased by 0.3 points this week.", time: "1 day ago", read: true },
  { id: 5, type: "negative", title: "Negative Review Alert", message: "Emily W. left a 1-star review at Westside location.", time: "2 days ago", read: true },
];

const typeIcons = { negative: AlertTriangle, review: Star, summary: BarChart3 };
const typeColors = { negative: "bg-destructive/10 text-destructive", review: "bg-primary/10 text-primary", summary: "bg-blue-500/10 text-blue-400" };

const Alerts = () => {
  const { t } = useLanguage();
  const [negativeAlert, setNegativeAlert] = useState(true);
  const [reviewAlert, setReviewAlert] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState("monday");
  const [slackUrl, setSlackUrl] = useState("");
  const [emailNotif, setEmailNotif] = useState("manager@company.com");

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );

  return (
    <DashboardLayout title={t("alert.title")} subtitle={t("alert.subtitle")}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle size={20} className="text-destructive" /></div>
              <div className="flex-1"><h3 className="font-display font-semibold">{t("alert.negative_title")}</h3><p className="text-xs text-muted-foreground">{t("alert.negative_desc")}</p></div>
              <Toggle value={negativeAlert} onChange={setNegativeAlert} />
            </div>
            {negativeAlert && <div className="rounded-lg bg-secondary/30 p-4 text-xs text-muted-foreground">{t("alert.negative_detail")}</div>}
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Star size={20} className="text-primary" /></div>
              <div className="flex-1"><h3 className="font-display font-semibold">{t("alert.review_title")}</h3><p className="text-xs text-muted-foreground">{t("alert.review_desc")}</p></div>
              <Toggle value={reviewAlert} onChange={setReviewAlert} />
            </div>
            {reviewAlert && <div className="rounded-lg bg-secondary/30 p-4 text-xs text-muted-foreground">{t("alert.review_detail")}</div>}
          </motion.div>

          <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><BarChart3 size={20} className="text-blue-400" /></div>
              <div className="flex-1"><h3 className="font-display font-semibold">{t("alert.weekly_title")}</h3><p className="text-xs text-muted-foreground">{t("alert.weekly_desc")}</p></div>
            </div>
            <select value={weeklySummary} onChange={(e) => setWeeklySummary(e.target.value)} className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="monday">{t("alert.every_monday")}</option>
              <option value="friday">{t("alert.every_friday")}</option>
              <option value="daily">{t("alert.daily")}</option>
              <option value="disabled">{t("alert.disabled")}</option>
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <h3 className="font-display font-semibold mb-4">{t("alert.integration")}</h3>
            <div className="space-y-4">
              <div><label className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5"><Mail size={14} /> {t("alert.email")}</label><Input className="bg-secondary/50 border-border/50" value={emailNotif} onChange={(e) => setEmailNotif(e.target.value)} /></div>
              <div><label className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5"><MessageSquare size={14} /> {t("alert.slack")}</label><Input className="bg-secondary/50 border-border/50" placeholder="https://hooks.slack.com/services/..." value={slackUrl} onChange={(e) => setSlackUrl(e.target.value)} /></div>
              <Button variant="outline" size="sm" className="gap-2 border-border/50"><Play size={14} /> {t("alert.send_test")}</Button>
            </div>
          </motion.div>
        </div>

        <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold">{t("alert.history")}</h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">{t("alert.mark_all_read")}</Button>
          </div>
          <div className="space-y-3">
            {alertHistory.map((alert) => {
              const Icon = typeIcons[alert.type];
              return (
                <div key={alert.id} className={`flex items-start gap-3 rounded-lg p-4 transition-colors ${alert.read ? "bg-secondary/20" : "bg-secondary/50 border border-border/50"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[alert.type]}`}><Icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="text-sm font-medium">{alert.title}</span>{!alert.read && <span className="w-2 h-2 rounded-full bg-primary" />}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">{alert.time}</span>
                  </div>
                  {!alert.read && <button className="text-muted-foreground hover:text-foreground flex-shrink-0"><Check size={16} /></button>}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
