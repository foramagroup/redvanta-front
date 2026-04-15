"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  CreditCard, MessageSquare, Activity, Webhook, 
  TrendingUp, Plus, Download, X, CheckCircle, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBilling } from "@/hooks/useBilling";

const UsageBilling = () => {
  const { t } = useLanguage();
  const router = useRouter();
  
  const {
    overview,
    usageHistory,
    invoices,
    availableAddons,
    loading,
    loadingAddons,
    fetchAvailableAddons,
    activateAddon,
    deactivateAddon,
    exportUsage,
  } = useBilling();
  
  const [showManage, setShowManage] = useState(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const [processingAddon, setProcessingAddon] = useState(null);

  // Charger add-ons disponibles quand modal s'ouvre
  useEffect(() => {
    if (showAddNew && availableAddons.length === 0) {
      fetchAvailableAddons();
    }
  }, [showAddNew]);

  // Handler pour activer add-on
  const handleActivateAddon = async (addonId) => {
    setProcessingAddon(addonId);
    const success = await activateAddon(addonId);
    setProcessingAddon(null);
    if (success) {
      setShowAddNew(false);
    }
  };

  // Handler pour désactiver add-on
  const handleDeactivateAddon = async (addonId) => {
    setProcessingAddon(addonId);
    const success = await deactivateAddon(addonId);
    setProcessingAddon(null);
    if (success) {
      setShowManage(null);
    }
  };

  // Handler pour export
  const handleExport = async () => {
    await exportUsage();
  };

  if (loading) {
    return (
      <DashboardLayout title={t("bill.title")} subtitle={t("bill.subtitle")}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!overview) {
    return (
      <DashboardLayout title={t("bill.title")} subtitle={t("bill.subtitle")}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">No billing data available</p>
          <Button onClick={() => router.push('/dashboard/settings')}>
            Configure Billing
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculer le max pour le graphique
  const maxApi = Math.max(...usageHistory.map(d => d.api), 1);

  // Summary cards
  const summaryCards = [
    { 
      labelKey: "bill.current_plan", 
      value: overview.subscription.plan.name, 
      sub: `$${overview.subscription.plan.price}/mo`, 
      icon: CreditCard, 
      accent: true 
    },
    { 
      labelKey: "bill.sms_used", 
      value: overview.usage.sms.toLocaleString(), 
      sub: `/ ${overview.limits.sms.toLocaleString()}`, 
      icon: MessageSquare 
    },
    { 
      labelKey: "bill.api_calls", 
      value: overview.usage.api.toLocaleString(), 
      sub: `/ ${overview.limits.api.toLocaleString()}`, 
      icon: Activity 
    },
    { 
      labelKey: "bill.webhook_events", 
      value: overview.usage.webhook.toLocaleString(), 
      sub: `/ ${overview.limits.webhook.toLocaleString()}`, 
      icon: Webhook 
    },
  ];

  return (
    <DashboardLayout 
      title={t("bill.title")} 
      subtitle={t("bill.subtitle")}
      headerAction={
        <Button size="sm" className="glow-red-hover" onClick={() => router.push('/pricing')}>
          {t("bill.upgrade")}
        </Button>
      }
    >
      {/* Summary Cards */}
      <motion.div variants={fadeUp} custom={0} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {summaryCards.map((c, i) => (
          <div 
            key={i} 
            className={`rounded-xl border p-6 ${
              c.accent 
                ? "border-primary/30 bg-primary/5" 
                : "border-border/50 bg-gradient-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t(c.labelKey)}</span>
              <c.icon size={18} className="text-primary" />
            </div>
            <div className="mt-3 flex items-end gap-1">
              <span className="font-display text-3xl font-bold">{c.value}</span>
              <span className="text-sm text-muted-foreground mb-0.5">{c.sub}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Usage Graph */}
      <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="font-display font-semibold">{t("bill.usage_30d")}</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-border/50" 
            onClick={handleExport}
          >
            <Download size={14} /> {t("bill.export")}
          </Button>
        </div>
        
        <div className="h-48 flex items-end gap-2">
          {usageHistory.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-primary">
                {d.api.toLocaleString()}
              </span>
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: `${(d.api / maxApi) * 100}%` }} 
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }} 
                className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
                title={`${d.date}: ${d.api} API calls`}
              />
              <span className="text-[10px] text-muted-foreground">
                {d.day.split(" ")[1]}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { 
              labelKey: "bill.sms", 
              used: overview.usage.sms, 
              limit: overview.limits.sms 
            },
            { 
              labelKey: "bill.api_calls", 
              used: overview.usage.api, 
              limit: overview.limits.api 
            },
            { 
              labelKey: "bill.webhooks", 
              used: overview.usage.webhook, 
              limit: overview.limits.webhook 
            }
          ].map((m) => (
            <div key={m.labelKey}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{t(m.labelKey)}</span>
                <span className="font-medium">
                  {m.limit > 0 ? ((m.used / m.limit) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <Progress 
                value={m.limit > 0 ? (m.used / m.limit) * 100 : 0} 
                className="h-1.5" 
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add-ons Section */}
      <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold">{t("bill.addons")}</h3>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 border-border/50" 
            onClick={() => setShowAddNew(true)}
          >
            <Plus size={14} /> {t("bill.add_new")}
          </Button>
        </div>
        
        {overview.addons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No add-ons activated yet</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-4" 
              onClick={() => setShowAddNew(true)}
            >
              Browse Add-ons
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {overview.addons.map((addon) => (
              <div 
                key={addon.id} 
                className={`rounded-lg border p-4 ${
                  addon.active 
                    ? "border-primary/30 bg-primary/5" 
                    : "border-border/50 bg-secondary/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">{addon.name}</h4>
                  {addon.active && (
                    <Badge className="text-[10px]">{t("sett.active")}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {addon.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display font-bold">
                    ${addon.price.toFixed(0)}/mo
                  </span>
                  <Button 
                    size="sm" 
                    variant={addon.active ? "outline" : "default"} 
                    className={addon.active ? "border-border/50 text-xs" : "text-xs glow-red-hover"}
                    onClick={() => {
                      if (addon.active) {
                        setShowManage(addon);
                      } else {
                        handleActivateAddon(addon.id);
                      }
                    }}
                    disabled={processingAddon === addon.id}
                  >
                    {processingAddon === addon.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : addon.active ? (
                      t("bill.manage")
                    ) : (
                      t("bill.add")
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Invoice History */}
      <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
        <h3 className="font-display font-semibold mb-6">{t("bill.invoice_history")}</h3>
        
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No invoices yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {[
                    t("bill.date"), 
                    t("bill.description"), 
                    t("bill.amount"), 
                    t("bill.status"), 
                    ""
                  ].map((h) => (
                    <th 
                      key={h} 
                      className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-3 text-sm text-muted-foreground">{inv.date}</td>
                    <td className="py-3 text-sm">{inv.description}</td>
                    <td className="py-3 text-sm font-medium">{inv.amount}</td>
                    <td className="py-3">
                      <span className="text-xs text-emerald-400">{inv.status}</span>
                    </td>
                    <td className="py-3">
                      {inv.downloadUrl ? (
                        <a 
                          href={inv.downloadUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {t("bill.download")}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal Manage Add-on */}
      {showManage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" 
          onClick={() => setShowManage(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-sm mx-4 rounded-xl border border-border/50 bg-card p-6" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">
                {t("bill.manage_title")} {showManage.name}
              </h3>
              <button 
                onClick={() => setShowManage(null)} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {showManage.description}
            </p>
            <p className="text-sm font-display font-bold mb-4">
              ${showManage.price.toFixed(0)}/mo
            </p>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex-1" 
                onClick={() => handleDeactivateAddon(showManage.id)}
                disabled={processingAddon === showManage.id}
              >
                {processingAddon === showManage.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("bill.deactivate")
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-border/50" 
                onClick={() => setShowManage(null)}
              >
                {t("bill.cancel")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Add New Add-on */}
      {showAddNew && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" 
          onClick={() => setShowAddNew(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold">
                {t("bill.available_addons")}
              </h3>
              <button 
                onClick={() => setShowAddNew(false)} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            {loadingAddons ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : availableAddons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">All add-ons are already activated</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableAddons.map((addon) => (
                  <div 
                    key={addon.id} 
                    className="rounded-lg border border-border/50 p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold">{addon.name}</h4>
                      <span className="text-sm font-display font-bold">
                        {addon.price}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {addon.description}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full glow-red-hover" 
                      onClick={() => handleActivateAddon(addon.id)}
                      disabled={processingAddon === addon.id}
                    >
                      {processingAddon === addon.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t("bill.activate")
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsageBilling;