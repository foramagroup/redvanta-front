"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Plug, ShoppingCart, Users, Zap, MessageSquare, Code2, Webhook, X, CheckCircle, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  { label: "All", icon: Plug },
  { label: "POS Systems", icon: ShoppingCart },
  { label: "CRM", icon: Users },
  { label: "E-commerce", icon: ShoppingCart },
  { label: "Automation", icon: Zap },
  { label: "Communication", icon: MessageSquare },
  { label: "Custom", icon: Code2 },
];

const allIntegrations = [
  { name: "Square", desc: "Sync customer data from Square POS transactions.", category: "POS Systems" },
  { name: "Clover", desc: "Integrate with Clover point-of-sale systems.", category: "POS Systems" },
  { name: "Toast POS", desc: "Connect restaurant POS data for automated requests.", category: "POS Systems" },
  { name: "HubSpot", desc: "Bi-directional sync with HubSpot CRM contacts.", category: "CRM" },
  { name: "Salesforce", desc: "Enterprise CRM integration with custom field mapping.", category: "CRM" },
  { name: "Zoho CRM", desc: "Import contacts and track review interactions.", category: "CRM" },
  { name: "Shopify", desc: "Post-purchase review request automation.", category: "E-commerce" },
  { name: "WooCommerce", desc: "WordPress e-commerce order sync.", category: "E-commerce" },
  { name: "Zapier", desc: "Connect 5,000+ apps with custom workflows.", category: "Automation" },
  { name: "Make", desc: "Advanced automation scenarios with visual builder.", category: "Automation" },
  { name: "Twilio", desc: "Send SMS review requests via Twilio.", category: "Communication" },
  { name: "SendGrid", desc: "Email-based review request delivery.", category: "Communication" },
  { name: "Slack", desc: "Real-time review notifications in Slack channels.", category: "Communication" },
];

const AvailableIntegrations = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [connectingItem, setConnectingItem] = useState(null);
  const [connectStep, setConnectStep] = useState(0);
  const [showWebhookUrl, setShowWebhookUrl] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");

  const filtered = allIntegrations.filter((i) => {
    const matchCat = activeCategory === "All" || i.category === activeCategory;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const generateWebhookUrl = () => { const id = Math.random().toString(36).substring(2, 10); setGeneratedUrl(`https://api.redvanta.com/webhooks/inbound/wh_${id}`); setShowWebhookUrl(true); };

  return (
    <DashboardLayout title={t("avint.title")} subtitle={t("avint.subtitle")}>
      <motion.div variants={fadeUp} custom={0} className="mb-8">
        <div className="relative mb-4 max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10 bg-secondary/50 border-border/50" placeholder={t("avint.search")} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (<button key={c.label} onClick={() => setActiveCategory(c.label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === c.label ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}><c.icon size={14} />{c.label}</button>))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={1} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {filtered.map((item, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-gradient-card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center"><Plug size={18} className="text-muted-foreground" /></div><div><h4 className="text-sm font-semibold">{item.name}</h4><span className="text-[10px] text-muted-foreground">{item.category}</span></div></div>
            <p className="text-xs text-muted-foreground flex-1 mb-4">{item.desc}</p>
            <Button size="sm" variant="outline" className="w-full border-border/50 glow-red-hover" onClick={() => { setConnectingItem(item); setConnectStep(0); }}>{t("avint.connect")}</Button>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><Webhook size={24} className="text-primary" /></div>
          <div className="flex-1"><h4 className="font-display font-semibold">{t("avint.custom_webhook")}</h4><p className="text-xs text-muted-foreground mt-1">{t("avint.custom_desc")}</p></div>
          <Button size="sm" className="glow-red-hover whitespace-nowrap" onClick={generateWebhookUrl}>{t("avint.generate_url")}</Button>
        </div>
      </motion.div>

      {connectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setConnectingItem(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold text-lg">{t("avint.connect")} {connectingItem.name}</h3><button onClick={() => setConnectingItem(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            {connectStep === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("avint.api_credentials") || "To connect, you'll need to provide your API credentials."}</p>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("avint.api_key")}</label><Input className="bg-secondary/50 border-border/50 font-mono text-xs" placeholder="Enter your API key..." /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("avint.api_secret")}</label><Input className="bg-secondary/50 border-border/50 font-mono text-xs" type="password" placeholder="Enter secret..." /></div>
                <Button className="w-full glow-red-hover" onClick={() => setConnectStep(1)}>{t("avint.verify_connect")}</Button>
              </div>
            )}
            {connectStep === 1 && (
              <div className="text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}><CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" /></motion.div>
                <h4 className="font-display font-semibold text-lg mb-2">{t("avint.connected_success")}</h4>
                <p className="text-sm text-muted-foreground mb-4">{connectingItem.name} {t("avint.connected_desc") || "is now connected."}</p>
                <Button className="w-full" onClick={() => setConnectingItem(null)}>{t("avint.done")}</Button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {showWebhookUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowWebhookUrl(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold text-lg">{t("avint.url_generated")}</h3><button onClick={() => setShowWebhookUrl(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("avint.your_url")}</label><div className="flex gap-2"><Input className="bg-secondary/50 border-border/50 font-mono text-xs flex-1" value={generatedUrl} readOnly /><Button variant="outline" size="icon" className="border-border/50" onClick={() => { navigator.clipboard.writeText(generatedUrl); toast({ title: t("apiwh.copied") }); }}><Copy size={14} /></Button></div></div>
              <Button className="w-full" onClick={() => setShowWebhookUrl(false)}>{t("avint.done")}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AvailableIntegrations;
