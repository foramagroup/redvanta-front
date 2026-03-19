"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Mail, Phone, Send, Upload, X, RotateCcw, XCircle, TrendingUp, Users, CheckCircle, Eye, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

const countries = [
  { name: "US", code: "+1", flag: "🇺🇸" },
  { name: "UK", code: "+44", flag: "🇬🇧" },
  { name: "FR", code: "+33", flag: "🇫🇷" },
  { name: "DE", code: "+49", flag: "🇩🇪" },
];

const statusColors = {
  Sent: "bg-blue-500/20 text-blue-400",
  Delivered: "bg-amber-500/20 text-amber-400",
  Opened: "bg-purple-500/20 text-purple-400",
  Completed: "bg-emerald-500/20 text-emerald-400",
  Failed: "bg-destructive/20 text-destructive",
};

const requests = [
  { id: 1, name: "Anna Richardson", method: "SMS", statusKey: "req.completed", date: "Feb 23, 2026", conversion: true, location: "Downtown" },
  { id: 2, name: "Tom Harris", method: "Email", statusKey: "req.opened", date: "Feb 23, 2026", conversion: false, location: "Midtown" },
  { id: 3, name: "Jessica Lee", method: "SMS", statusKey: "req.delivered", date: "Feb 22, 2026", conversion: false, location: "Downtown" },
  { id: 4, name: "Mike Johnson", method: "Email", statusKey: "req.sent", date: "Feb 22, 2026", conversion: false, location: "Westside" },
  { id: 5, name: "Karen White", method: "SMS", statusKey: "req.completed", date: "Feb 21, 2026", conversion: true, location: "Midtown" },
  { id: 6, name: "Chris Davis", method: "Email", statusKey: "req.failed", date: "Feb 21, 2026", conversion: false, location: "Downtown" },
  { id: 7, name: "Rachel Green", method: "SMS", statusKey: "req.completed", date: "Feb 20, 2026", conversion: true, location: "Westside" },
];

const Requests = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [contactTab, setContactTab] = useState("email");
  const [phoneCountry, setPhoneCountry] = useState(countries[0]);

  const filtered = statusFilter ? requests.filter((r) => r.statusKey === statusFilter) : requests;

  const stats = [
    { labelKey: "req.total_sent", value: "342", icon: Send, change: "+28" },
    { labelKey: "req.delivered", value: "98%", icon: CheckCircle, change: "+2%" },
    { labelKey: "req.opened", value: "67%", icon: Eye, change: "+5%" },
    { labelKey: "req.converted", value: "34%", icon: TrendingUp, change: "+8%" },
  ];

  const statusFilterKeys = ["req.sent", "req.delivered", "req.opened", "req.completed", "req.failed"];

  return (
    <DashboardLayout
      title={t("req.title")}
      subtitle={t("req.subtitle")}
      headerAction={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-border/50" onClick={() => setShowImport(true)}><Upload size={16} /> {t("req.bulk_import")}</Button>
          <Button size="sm" className="gap-2 glow-red-hover" onClick={() => setShowModal(true)}><Plus size={16} /> {t("req.create_request")}</Button>
        </div>
      }
    >
      <motion.div variants={fadeUp} custom={0} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-gradient-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t(stat.labelKey)}</span>
              <stat.icon size={18} className="text-primary" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-2xl font-bold">{stat.value}</span>
              <span className="mb-0.5 text-xs text-primary font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} custom={1} className="flex gap-2 mb-6 flex-wrap">
        {statusFilterKeys.map((sk) => (
          <button key={sk} onClick={() => setStatusFilter(statusFilter === sk ? null : sk)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${statusFilter === sk ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-card text-muted-foreground hover:text-foreground"}`}>{t(sk)}</button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("req.customer")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("req.method")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("req.status")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t("req.date")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("req.conversion")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("req.location")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("req.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                  <td className="p-4 text-sm font-medium">{req.name}</td>
                  <td className="p-4"><span className="flex items-center gap-1.5 text-sm text-muted-foreground">{req.method === "SMS" ? <Phone size={14} /> : <Mail size={14} />} {req.method}</span></td>
                  <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[t(req.statusKey)] || "bg-secondary text-muted-foreground"}`}>{t(req.statusKey)}</span></td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{req.date}</td>
                  <td className="p-4 hidden lg:table-cell">{req.conversion ? <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">{t("req.converted_label")}</span> : <span className="text-xs text-muted-foreground">—</span>}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{req.location}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><RotateCcw size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"><XCircle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">{t("req.create_title")}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("req.customer_name")}</label>
                <Input className="bg-secondary/50 border-border/50" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("req.contact_method")}</label>
                <Tabs value={contactTab} onValueChange={setContactTab} className="w-full">
                  <TabsList className="w-full bg-secondary/50">
                    <TabsTrigger value="email" className="flex-1 gap-2"><Mail size={14} /> {t("req.email")}</TabsTrigger>
                    <TabsTrigger value="phone" className="flex-1 gap-2"><Phone size={14} /> {t("req.phone")}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="mt-3">
                    <Input className="bg-secondary/50 border-border/50" type="email" placeholder="john@email.com" />
                  </TabsContent>
                  <TabsContent value="phone" className="mt-3">
                    <div className="flex gap-2">
                      <select value={phoneCountry.name} onChange={(e) => { const c = countries.find((x) => x.name === e.target.value); if (c) setPhoneCountry(c); }} className="w-24 rounded-md border border-border/50 bg-secondary/50 px-2 text-sm">
                        {countries.map((c) => (<option key={c.name} value={c.name}>{c.flag} {c.code}</option>))}
                      </select>
                      <Input className="bg-secondary/50 border-border/50 flex-1" placeholder="555 123-4567" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("req.loc_label")}</label>
                <select className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Downtown</option><option>Midtown</option><option>Westside</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("req.custom_message")}</label>
                <textarea className="w-full rounded-lg border border-border/50 bg-secondary/50 p-3 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Hi {customer_name}, we'd love your feedback..." />
              </div>
              <Button className="w-full glow-red-hover gap-2"><Send size={16} /> {t("req.send_request")}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowImport(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">{t("req.bulk_title")}</h3>
              <button onClick={() => setShowImport(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center">
              <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">{t("req.upload_csv")}</p>
              <p className="text-xs text-muted-foreground">{t("req.csv_columns")}</p>
              <Button variant="outline" size="sm" className="mt-4 border-border/50">{t("req.choose_file")}</Button>
            </div>
            <Button className="w-full mt-4 glow-red-hover">{t("req.import_send")}</Button>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Requests;
