"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { CreditCard, MessageSquare, Activity, Webhook, TrendingUp, Plus, Download, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const usageData = [
  { day: "Feb 1", api: 1200, sms: 45, webhooks: 380 },
  { day: "Feb 5", api: 1800, sms: 62, webhooks: 420 },
  { day: "Feb 10", api: 2100, sms: 78, webhooks: 510 },
  { day: "Feb 15", api: 1950, sms: 91, webhooks: 460 },
  { day: "Feb 20", api: 2400, sms: 110, webhooks: 580 },
  { day: "Feb 25", api: 2800, sms: 127, webhooks: 640 },
];

const initialAddons = [
  { name: "API Access Pro", desc: "500K API calls/mo, priority rate limits", price: "$49/mo", active: true },
  { name: "Automation Suite", desc: "Advanced workflow builder, 10K SMS", price: "$79/mo", active: false },
  { name: "White-Label", desc: "Remove REDVANTA branding, custom domain", price: "$199/mo", active: false },
  { name: "Extra Locations", desc: "Add 5 additional locations", price: "$29/mo", active: true },
];

const availableAddons = [
  { name: "Priority Support", desc: "Dedicated account manager, 1h SLA", price: "$99/mo" },
  { name: "Advanced Analytics", desc: "Custom reports, competitor benchmarking", price: "$59/mo" },
];

const invoices = [
  { date: "Feb 15, 2026", desc: "Growth Plan + Add-ons", amount: "$207.00", status: "Paid" },
  { date: "Jan 15, 2026", desc: "Growth Plan + Add-ons", amount: "$207.00", status: "Paid" },
  { date: "Dec 15, 2025", desc: "Growth Plan", amount: "$129.00", status: "Paid" },
  { date: "Nov 15, 2025", desc: "Growth Plan", amount: "$129.00", status: "Paid" },
  { date: "Oct 15, 2025", desc: "Starter Plan", amount: "$49.00", status: "Paid" },
];

const UsageBilling = () => {
  const { t } = useLanguage();
  const [addons, setAddons] = useState(initialAddons);
  const [showManage, setShowManage] = useState(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const router = useRouter();
  const maxApi = 2800;

  const summaryCards = [
    { labelKey: "bill.current_plan", value: "Growth", sub: "$129/mo", icon: CreditCard, accent: true },
    { labelKey: "bill.sms_used", value: "1,842", sub: "/ 5,000", icon: MessageSquare },
    { labelKey: "bill.api_calls", value: "48,230", sub: "/ 100,000", icon: Activity },
    { labelKey: "bill.webhook_events", value: "12,847", sub: "/ 50,000", icon: Webhook },
  ];

  const toggleAddon = (name) => {
    setAddons((prev) => prev.map((a) => a.name === name ? { ...a, active: !a.active } : a));
    toast({ title: t("bill.updated"), description: `${name}` });
    setShowManage(null);
  };

  const addNewAddon = (addon) => {
    setAddons((prev) => [...prev, { ...addon, active: true }]);
    setShowAddNew(false);
    toast({ title: t("bill.updated"), description: addon.name });
  };

  return (
    <DashboardLayout title={t("bill.title")} subtitle={t("bill.subtitle")}
      headerAction={<Button size="sm" className="glow-red-hover">{t("bill.upgrade")}</Button>}
    >
      <motion.div variants={fadeUp} custom={0} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {summaryCards.map((c, i) => (
          <div key={i} className={`rounded-xl border p-6 ${c.accent ? "border-primary/30 bg-primary/5" : "border-border/50 bg-gradient-card"}`}>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t(c.labelKey)}</span><c.icon size={18} className="text-primary" /></div>
            <div className="mt-3 flex items-end gap-1"><span className="font-display text-3xl font-bold">{c.value}</span><span className="text-sm text-muted-foreground mb-0.5">{c.sub}</span></div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><TrendingUp size={18} className="text-primary" /><h3 className="font-display font-semibold">{t("bill.usage_30d")}</h3></div>
          <Button variant="outline" size="sm" className="gap-2 border-border/50" onClick={() => toast({ title: t("bill.exported"), description: t("bill.exported_desc") })}><Download size={14} /> {t("bill.export")}</Button>
        </div>
        <div className="h-48 flex items-end gap-2">
          {usageData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-primary">{d.api.toLocaleString()}</span>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(d.api / maxApi) * 100}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }} className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer" />
              <span className="text-[10px] text-muted-foreground">{d.day.split(" ")[1]}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[{ labelKey: "bill.sms", used: 1842, limit: 5000 }, { labelKey: "bill.api_calls", used: 48230, limit: 100000 }, { labelKey: "bill.webhooks", used: 12847, limit: 50000 }].map((m) => (
            <div key={m.labelKey}><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{t(m.labelKey)}</span><span className="font-medium">{((m.used / m.limit) * 100).toFixed(0)}%</span></div><Progress value={(m.used / m.limit) * 100} className="h-1.5" /></div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold">{t("bill.addons")}</h3>
          <Button size="sm" variant="outline" className="gap-2 border-border/50" onClick={() => router.push("/dashboard/addons")}><Plus size={14} /> {t("bill.add_new")}</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {addons.map((a, i) => (
            <div key={i} className={`rounded-lg border p-4 ${a.active ? "border-primary/30 bg-primary/5" : "border-border/50 bg-secondary/20"}`}>
              <div className="flex items-center justify-between mb-1"><h4 className="text-sm font-semibold">{a.name}</h4>{a.active && <Badge className="text-[10px]">{t("sett.active")}</Badge>}</div>
              <p className="text-xs text-muted-foreground mb-3">{a.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-bold">{a.price}</span>
                <Button size="sm" variant={a.active ? "outline" : "default"} className={a.active ? "border-border/50 text-xs" : "text-xs glow-red-hover"} onClick={() => { if (a.active) { setShowManage(a); } else { const addonMap = { "API Access Pro": "api", "Automation Suite": "automation", "White-Label": "whitelabel", "Extra Locations": "location" }; const addonId = addonMap[a.name]; router.push(addonId ? `/dashboard/addons?activate=${addonId}` : "/dashboard/addons"); } }}>
                  {a.active ? t("bill.manage") : t("bill.add")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
        <h3 className="font-display font-semibold mb-6">{t("bill.invoice_history")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {[t("bill.date"), t("bill.description"), t("bill.amount"), t("bill.status"), ""].map((h) => (<th key={h} className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-3 text-sm text-muted-foreground">{inv.date}</td>
                  <td className="py-3 text-sm">{inv.desc}</td>
                  <td className="py-3 text-sm font-medium">{inv.amount}</td>
                  <td className="py-3"><span className="text-xs text-emerald-400">{inv.status}</span></td>
                  <td className="py-3"><button className="text-xs text-muted-foreground hover:text-foreground">{t("bill.download")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowManage(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-display font-semibold">{t("bill.manage_title")} {showManage.name}</h3><button onClick={() => setShowManage(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <p className="text-sm text-muted-foreground mb-2">{showManage.desc}</p>
            <p className="text-sm font-display font-bold mb-4">{showManage.price}</p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" className="flex-1" onClick={() => toggleAddon(showManage.name)}>{t("bill.deactivate")}</Button>
              <Button variant="outline" size="sm" className="flex-1 border-border/50" onClick={() => setShowManage(null)}>{t("bill.cancel")}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowAddNew(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold">{t("bill.available_addons")}</h3><button onClick={() => setShowAddNew(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="space-y-3">
              {availableAddons.map((addon) => (
                <div key={addon.name} className="rounded-lg border border-border/50 p-4">
                  <div className="flex items-center justify-between mb-1"><h4 className="text-sm font-semibold">{addon.name}</h4><span className="text-sm font-display font-bold">{addon.price}</span></div>
                  <p className="text-xs text-muted-foreground mb-3">{addon.desc}</p>
                  <Button size="sm" className="w-full glow-red-hover" onClick={() => addNewAddon(addon)}>{t("bill.activate")}</Button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsageBilling;
