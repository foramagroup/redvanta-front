"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Plug, Activity, AlertTriangle, MoreVertical, RefreshCw, ExternalLink, Unplug, X, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const integrations = [
  { name: "Square POS", type: "POS", status: "Active", lastSync: "2 min ago", events: 1842, description: "Syncs customer data and transactions from Square POS.", config: { apiKey: "sq_****d4e5", syncInterval: "5 min", lastError: null } },
  { name: "HubSpot CRM", type: "CRM", status: "Active", lastSync: "5 min ago", events: 3201, description: "Bi-directional contact sync with HubSpot.", config: { apiKey: "hs_****x7w6", syncInterval: "10 min", lastError: null } },
  { name: "Shopify", type: "E-commerce", status: "Active", lastSync: "12 min ago", events: 2456, description: "Post-purchase review automation.", config: { apiKey: "sh_****v5u4", syncInterval: "15 min", lastError: null } },
  { name: "Zapier", type: "Automation", status: "Active", lastSync: "1 min ago", events: 4102, description: "Connect to 5,000+ apps via Zapier.", config: { apiKey: "zp_****t3s2", syncInterval: "Real-time", lastError: null } },
  { name: "Twilio SMS", type: "Communication", status: "Error", lastSync: "3h ago", events: 89, description: "SMS delivery service. Authentication issues.", config: { apiKey: "tw_****r1q0", syncInterval: "Real-time", lastError: "Authentication failed" } },
  { name: "Custom Webhook", type: "Webhook", status: "Active", lastSync: "30 sec ago", events: 1024, description: "Custom webhook endpoint.", config: { apiKey: "N/A", syncInterval: "Real-time", lastError: null } },
  { name: "Stripe", type: "API", status: "Disconnected", lastSync: "14d ago", events: 0, description: "Payment processing integration.", config: { apiKey: "N/A", syncInterval: "N/A", lastError: "Disconnected by user" } },
];

const statusStyles = {
  Active: { bg: "bg-emerald-400/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Error: { bg: "bg-amber-400/10", text: "text-amber-400", dot: "bg-amber-400" },
  Disconnected: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

const ConnectedIntegrations = () => {
  const { t } = useLanguage();
  const [openMenu, setOpenMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);

  const summaryCards = [
    { labelKey: "conint.active_int", value: "7", icon: Plug, color: "text-emerald-400" },
    { labelKey: "conint.events_24h", value: "12,847", icon: Activity, color: "text-primary" },
    { labelKey: "conint.errors_24h", value: "3", icon: AlertTriangle, color: "text-amber-400" },
  ];

  const handleForceSync = (name) => { setOpenMenu(null); toast({ title: t("conint.sync_initiated"), description: name }); };

  return (
    <DashboardLayout title={t("conint.title")} subtitle={t("conint.subtitle")}>
      <motion.div variants={fadeUp} custom={0} className="grid gap-4 sm:grid-cols-3 mb-8">
        {summaryCards.map((c, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{t(c.labelKey)}</span><c.icon size={18} className={c.color} /></div>
            <span className="mt-3 block font-display text-3xl font-bold">{c.value}</span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border/50">{[t("conint.integration"), t("conint.type"), t("conint.status"), t("conint.last_sync"), t("conint.events"), t("conint.actions")].map((h) => (<th key={h} className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>))}</tr></thead>
            <tbody>
              {integrations.map((item, i) => {
                const s = statusStyles[item.status];
                return (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center"><Plug size={14} className="text-muted-foreground" /></div><span className="text-sm font-medium">{item.name}</span></div></td>
                    <td className="px-6 py-4"><Badge variant="outline" className="border-border/50 text-muted-foreground text-xs">{item.type}</Badge></td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{item.status}</span></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.lastSync}</td>
                    <td className="px-6 py-4 text-sm font-medium">{item.events.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button onClick={() => setOpenMenu(openMenu === i ? null : i)} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"><MoreVertical size={16} /></button>
                        {openMenu === i && (
                          <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border/50 bg-card shadow-xl z-10">
                            <button onClick={() => { setDetailsItem(item); setOpenMenu(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs hover:bg-secondary/50 transition-colors"><ExternalLink size={14} /> {t("conint.view_details")}</button>
                            <button onClick={() => handleForceSync(item.name)} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs hover:bg-secondary/50 transition-colors"><RefreshCw size={14} /> {t("conint.force_sync")}</button>
                            <button className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-secondary/50 transition-colors" onClick={() => setOpenMenu(null)}><Unplug size={14} /> {t("conint.disconnect")}</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {detailsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setDetailsItem(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Plug size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{detailsItem.name}</h3><Badge variant="outline" className="text-[10px]">{detailsItem.type}</Badge></div></div>
              <button onClick={() => setDetailsItem(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{detailsItem.description}</p>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"><span className="text-xs text-muted-foreground">{t("conint.status")}</span><span className={`text-xs font-medium ${statusStyles[detailsItem.status].text}`}>{detailsItem.status}</span></div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"><span className="text-xs text-muted-foreground">{t("conint.last_sync")}</span><span className="text-xs">{detailsItem.lastSync}</span></div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"><span className="text-xs text-muted-foreground">{t("conint.sync_interval")}</span><span className="text-xs">{detailsItem.config.syncInterval}</span></div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"><span className="text-xs text-muted-foreground">{t("conint.events")}</span><span className="text-xs font-medium">{detailsItem.events.toLocaleString()}</span></div>
              {detailsItem.config.lastError && (<div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3"><span className="text-xs text-destructive font-medium block">{t("conint.error")}</span><span className="text-xs text-muted-foreground">{detailsItem.config.lastError}</span></div>)}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 glow-red-hover gap-2" onClick={() => { handleForceSync(detailsItem.name); setDetailsItem(null); }}><RefreshCw size={14} /> {t("conint.force_sync")}</Button>
              <Button size="sm" variant="outline" className="flex-1 border-border/50" onClick={() => setDetailsItem(null)}>{t("conint.close")}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ConnectedIntegrations;
