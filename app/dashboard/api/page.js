"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Key, Copy, RefreshCw, Plus, Webhook, Send, BarChart3, Trash2, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const initialApiKeys = [
  { name: "Production Key", key: "rv_live_sk_a1b2c3d4e5f6", created: "Jan 12, 2026", lastUsed: "2 min ago", status: "Active" },
  { name: "Staging Key", key: "rv_test_sk_z9y8x7w6v5u4", created: "Feb 01, 2026", lastUsed: "3 days ago", status: "Active" },
  { name: "Legacy Key", key: "rv_live_sk_oldkeyvalue01", created: "Sep 05, 2025", lastUsed: "45 days ago", status: "Inactive" },
];

const initialWebhooks = [
  { url: "https://api.client.com/webhooks/redvanta", events: ["review.created", "review.updated"], retries: true, status: "Active" },
  { url: "https://hooks.zapier.com/hooks/catch/12345", events: ["request.completed"], retries: false, status: "Active" },
];

const eventTypes = ["review.created", "review.updated", "review.deleted", "request.sent", "request.completed", "request.failed", "location.created", "alert.triggered"];

const ApiWebhooks = () => {
  const { t } = useLanguage();
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [showKeys, setShowKeys] = useState({});
  const [selectedEvents, setSelectedEvents] = useState(["review.created", "review.updated"]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newEndpointUrl, setNewEndpointUrl] = useState("");

  const toggleEvent = (e) => setSelectedEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  const handleCopy = (text) => { navigator.clipboard.writeText(text); toast({ title: t("apiwh.copied"), description: t("apiwh.copied_desc") }); };
  const handleRegenerate = (i) => { const newKey = `rv_${apiKeys[i].key.includes("live") ? "live" : "test"}_sk_${Math.random().toString(36).substring(2, 14)}`; setApiKeys((prev) => prev.map((k, idx) => idx === i ? { ...k, key: newKey } : k)); toast({ title: t("apiwh.regenerated") }); };
  const createKey = () => { const key = `rv_live_sk_${Math.random().toString(36).substring(2, 14)}`; setApiKeys((prev) => [...prev, { name: newKeyName || "New Key", key, created: "Mar 04, 2026", lastUsed: "Never", status: "Active" }]); setShowCreateKey(false); setNewKeyName(""); toast({ title: t("apiwh.key_created"), description: t("apiwh.key_created_desc") }); };
  const addEndpoint = () => { setWebhooks((prev) => [...prev, { url: newEndpointUrl, events: selectedEvents, retries: true, status: "Active" }]); setShowAddEndpoint(false); setNewEndpointUrl(""); toast({ title: t("apiwh.endpoint_added"), description: t("apiwh.endpoint_added_desc") }); };

  return (
    <DashboardLayout title={t("apiwh.title")} subtitle={t("apiwh.subtitle")}>
      <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Key size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("apiwh.api_keys")}</h3><p className="text-xs text-muted-foreground">{t("apiwh.api_desc")}</p></div></div>
          <Button size="sm" className="gap-2 glow-red-hover" onClick={() => setShowCreateKey(true)}><Plus size={14} /> {t("apiwh.create_key")}</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border/50">{[t("apiwh.name"), t("apiwh.key"), t("apiwh.created"), t("apiwh.last_used"), t("apiwh.status"), t("apiwh.actions")].map((h) => (<th key={h} className="pb-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>))}</tr></thead>
            <tbody>
              {apiKeys.map((k, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-4 text-sm font-medium">{k.name}</td>
                  <td className="py-4"><div className="flex items-center gap-2"><code className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded">{showKeys[i] ? k.key : "••••••••••••••••"}</code><button onClick={() => setShowKeys((p) => ({ ...p, [i]: !p[i] }))} className="text-muted-foreground hover:text-foreground">{showKeys[i] ? <EyeOff size={14} /> : <Eye size={14} />}</button><button onClick={() => handleCopy(k.key)} className="text-muted-foreground hover:text-foreground"><Copy size={14} /></button></div></td>
                  <td className="py-4 text-xs text-muted-foreground">{k.created}</td>
                  <td className="py-4 text-xs text-muted-foreground">{k.lastUsed}</td>
                  <td className="py-4"><Badge variant={k.status === "Active" ? "default" : "secondary"} className="text-[10px]">{k.status}</Badge></td>
                  <td className="py-4"><div className="flex gap-1"><button onClick={() => handleRegenerate(i)} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground"><RefreshCw size={14} /></button><button onClick={() => setApiKeys((p) => p.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg hover:bg-secondary/50 text-red-400"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Webhook size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("apiwh.incoming")}</h3><p className="text-xs text-muted-foreground">{t("apiwh.incoming_desc")}</p></div></div>
        <div className="space-y-4">
          <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("apiwh.webhook_url")}</label><div className="flex gap-2"><Input className="bg-secondary/50 border-border/50 font-mono text-xs flex-1" value="https://api.redvanta.com/webhooks/inbound/wh_a1b2c3d4e5f6" readOnly /><Button variant="outline" size="icon" className="border-border/50" onClick={() => handleCopy("https://api.redvanta.com/webhooks/inbound/wh_a1b2c3d4e5f6")}><Copy size={14} /></Button></div></div>
          <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("apiwh.signing_secret")}</label><div className="flex gap-2"><Input className="bg-secondary/50 border-border/50 font-mono text-xs flex-1" value="whsec_••••••••••••••••••••" readOnly /><Button variant="outline" size="sm" className="border-border/50 gap-1" onClick={() => toast({ title: t("apiwh.regenerated") })}><RefreshCw size={14} /> {t("apiwh.regenerate")}</Button></div></div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Send size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("apiwh.outgoing")}</h3><p className="text-xs text-muted-foreground">{t("apiwh.outgoing_desc")}</p></div></div>
          <Button size="sm" variant="outline" className="gap-2 border-border/50" onClick={() => setShowAddEndpoint(true)}><Plus size={14} /> {t("apiwh.add_endpoint")}</Button>
        </div>
        <div className="space-y-4 mb-6">
          {webhooks.map((wh, i) => (
            <div key={i} className="rounded-lg bg-secondary/30 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <code className="text-xs font-mono text-muted-foreground truncate">{wh.url}</code>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] border-emerald-400/30 text-emerald-400">{wh.status}</Badge>
                  <span className="text-[10px] text-muted-foreground">{t("apiwh.retries")}: {wh.retries ? "On" : "Off"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">{wh.events.map((e) => (<span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{e}</span>))}</div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs border-border/50">{t("auto.test")}</Button>
                <Button size="sm" variant="ghost" className="text-xs text-red-400" onClick={() => setWebhooks((p) => p.filter((_, idx) => idx !== i))}>{t("apiwh.remove")}</Button>
              </div>
            </div>
          ))}
        </div>
        <div><label className="text-xs text-muted-foreground mb-2 block">{t("apiwh.subscribe_events")}</label>
          <div className="flex flex-wrap gap-2">{eventTypes.map((e) => (<button key={e} onClick={() => toggleEvent(e)} className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${selectedEvents.includes(e) ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary/30 border-border/50 text-muted-foreground hover:text-foreground"}`}>{e}</button>))}</div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
        <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><BarChart3 size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("apiwh.rate_limits")}</h3><p className="text-xs text-muted-foreground">{t("apiwh.rate_desc")}</p></div></div>
        <div className="space-y-4">
          <div><div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">{t("apiwh.api_calls_month")}</span><span className="font-medium">48,230 / 100,000</span></div><Progress value={48.2} className="h-2" /></div>
          <div><div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">{t("apiwh.webhook_deliveries")}</span><span className="font-medium">12,847 / 50,000</span></div><Progress value={25.7} className="h-2" /></div>
        </div>
      </motion.div>

      {showCreateKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateKey(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold">{t("apiwh.create_api_key")}</h3><button onClick={() => setShowCreateKey(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="space-y-4"><div><label className="text-xs text-muted-foreground mb-1.5 block">{t("apiwh.key_name")}</label><Input className="bg-secondary/50 border-border/50" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. Mobile App Key" /></div><Button className="w-full glow-red-hover" onClick={createKey}>{t("apiwh.generate_key")}</Button></div>
          </motion.div>
        </div>
      )}

      {showAddEndpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowAddEndpoint(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold">{t("apiwh.add_webhook")}</h3><button onClick={() => setShowAddEndpoint(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("apiwh.endpoint_url")}</label><Input className="bg-secondary/50 border-border/50 font-mono text-xs" value={newEndpointUrl} onChange={(e) => setNewEndpointUrl(e.target.value)} placeholder="https://your-app.com/webhook" /></div>
              <div><label className="text-xs text-muted-foreground mb-2 block">{t("apiwh.subscribe_events")}</label><div className="flex flex-wrap gap-2">{eventTypes.map((e) => (<button key={e} onClick={() => toggleEvent(e)} className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${selectedEvents.includes(e) ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary/30 border-border/50 text-muted-foreground"}`}>{e}</button>))}</div></div>
              <Button className="w-full glow-red-hover" onClick={addEndpoint}>{t("apiwh.add_endpoint")}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ApiWebhooks;
