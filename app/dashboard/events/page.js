"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Activity, Search, X, RefreshCw, Code2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const eventTypes = ["All", "review.created", "request.sent", "request.completed", "webhook.delivered", "alert.triggered", "api.call"];
const statuses = ["All", "Success", "Failed", "Pending"];

const events = [
  { id: 1, timestamp: "2026-02-25 14:32:08", name: "review.created", source: "NFC Card", location: "Downtown", status: "Success", payload: { id: "rev_a1b2c3", rating: 5, customer: "John D.", content: "Great service!", source: "nfc_scan", card_id: "card_x9y8" } },
  { id: 2, timestamp: "2026-02-25 14:31:45", name: "webhook.delivered", source: "System", location: "—", status: "Success", payload: { webhook_id: "wh_001", endpoint: "https://api.client.com/hooks", event: "review.created", response_code: 200, latency_ms: 142 } },
  { id: 3, timestamp: "2026-02-25 14:30:22", name: "request.sent", source: "Automation", location: "Midtown", status: "Success", payload: { request_id: "req_d4e5f6", channel: "sms", recipient: "+1555****321", template: "review_request_v2" } },
  { id: 4, timestamp: "2026-02-25 14:29:10", name: "webhook.delivered", source: "System", location: "—", status: "Failed", payload: { webhook_id: "wh_002", endpoint: "https://hooks.zapier.com/catch/err", event: "request.completed", response_code: 500, error: "Connection timeout", retries_remaining: 2 } },
  { id: 5, timestamp: "2026-02-25 14:28:55", name: "api.call", source: "API Key (prod)", location: "—", status: "Success", payload: { method: "GET", path: "/v1/reviews", api_key: "rv_live_sk_****c3d4", response_time_ms: 89, status_code: 200 } },
  { id: 6, timestamp: "2026-02-25 14:27:33", name: "alert.triggered", source: "System", location: "Westside", status: "Success", payload: { alert_type: "negative_review", review_id: "rev_g7h8i9", rating: 2, notified: ["admin@redvanta.com"], channel: "email" } },
  { id: 7, timestamp: "2026-02-25 14:25:01", name: "request.completed", source: "SMS", location: "Downtown", status: "Success", payload: { request_id: "req_j1k2l3", customer: "Sarah M.", action: "review_submitted", rating: 5 } },
  { id: 8, timestamp: "2026-02-25 14:22:18", name: "webhook.delivered", source: "System", location: "—", status: "Failed", payload: { webhook_id: "wh_003", endpoint: "https://dead-endpoint.com/hook", event: "review.created", response_code: 0, error: "DNS resolution failed", retries_remaining: 0 } },
];

const statusStyles = {
  Success: { bg: "bg-emerald-400/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Failed: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  Pending: { bg: "bg-amber-400/10", text: "text-amber-400", dot: "bg-amber-400" },
};

const EventLogs = () => {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filtered = events.filter((e) => {
    const matchType = filterType === "All" || e.name === filterType;
    const matchStatus = filterStatus === "All" || e.status === filterStatus;
    const matchSearch = search === "" || e.name.includes(search) || e.source.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase());
    let matchDate = true;
    if (startDate) { const eventDate = new Date(e.timestamp); const start = new Date(startDate); if (eventDate < start) matchDate = false; }
    if (endDate) { const eventDate = new Date(e.timestamp); const end = new Date(endDate); end.setHours(23, 59, 59); if (eventDate > end) matchDate = false; }
    return matchType && matchStatus && matchSearch && matchDate;
  });

  return (
    <DashboardLayout title={t("evlog.title")} subtitle={t("evlog.subtitle")}>
      <motion.div variants={fadeUp} custom={0} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10 bg-secondary/50 border-border/50" placeholder={t("evlog.search")} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm text-foreground">{eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm text-foreground">{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <div className="relative">
          <Button variant="outline" size="sm" className="gap-2 border-border/50 h-10" onClick={() => setShowDatePicker(!showDatePicker)}><Calendar size={14} /> {startDate && endDate ? `${startDate} – ${endDate}` : t("evlog.date_range")}</Button>
          {showDatePicker && (
            <><div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
            <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-border/50 bg-card shadow-xl z-50 p-4">
              <div className="space-y-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">{t("evlog.start_date")}</label><Input type="date" className="bg-secondary/50 border-border/50" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t("evlog.end_date")}</label><Input type="date" className="bg-secondary/50 border-border/50" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                <div className="flex gap-2"><Button size="sm" className="flex-1" onClick={() => setShowDatePicker(false)}>{t("evlog.apply")}</Button><Button size="sm" variant="outline" className="flex-1 border-border/50" onClick={() => { setStartDate(""); setEndDate(""); setShowDatePicker(false); }}>{t("evlog.clear")}</Button></div>
              </div>
            </div></>
          )}
        </div>
      </motion.div>

      <div className="flex gap-6">
        <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden flex-1 min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border/50">{[t("evlog.timestamp"), t("evlog.event"), t("evlog.source"), t("evlog.location"), t("evlog.status"), t("evlog.actions")].map((h) => (<th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>))}</tr></thead>
              <tbody>
                {filtered.map((ev) => {
                  const s = statusStyles[ev.status];
                  return (
                    <tr key={ev.id} className={`border-b border-border/30 hover:bg-secondary/20 transition-colors cursor-pointer ${selectedEvent?.id === ev.id ? "bg-secondary/30" : ""}`} onClick={() => setSelectedEvent(ev)}>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{ev.timestamp}</td>
                      <td className="px-4 py-3"><code className="text-xs font-mono text-primary">{ev.name}</code></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{ev.source}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{ev.location}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{ev.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"><Code2 size={14} /> {t("evlog.json")}</button>
                          {ev.status === "Failed" && <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-secondary/50 text-red-400 text-xs flex items-center gap-1"><RefreshCw size={14} /> {t("evlog.retry")}</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        <AnimatePresence>
          {selectedEvent && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 400, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden flex-shrink-0 hidden lg:block">
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2"><Activity size={18} className="text-primary" /><h3 className="font-display font-semibold text-sm">{t("evlog.event_details")}</h3></div>
                  <button onClick={() => setSelectedEvent(null)} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground"><X size={16} /></button>
                </div>
                <div className="space-y-4 mb-6">
                  <div><span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{t("evlog.event")}</span><code className="text-sm font-mono text-primary">{selectedEvent.name}</code></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{t("evlog.timestamp")}</span><span className="text-xs">{selectedEvent.timestamp}</span></div>
                    <div><span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{t("evlog.status")}</span><Badge variant={selectedEvent.status === "Success" ? "default" : "destructive"} className="text-[10px]">{selectedEvent.status}</Badge></div>
                    <div><span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{t("evlog.source")}</span><span className="text-xs">{selectedEvent.source}</span></div>
                    <div><span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{t("evlog.location")}</span><span className="text-xs">{selectedEvent.location}</span></div>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">{t("evlog.payload")}</span>
                  <pre className="rounded-lg bg-secondary/50 border border-border/30 p-4 overflow-x-auto"><code className="text-[11px] font-mono text-muted-foreground whitespace-pre">{JSON.stringify(selectedEvent.payload, null, 2)}</code></pre>
                </div>
                {selectedEvent.status === "Failed" && <Button size="sm" className="mt-4 w-full gap-2 glow-red-hover"><RefreshCw size={14} /> {t("evlog.retry_event")}</Button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default EventLogs;
