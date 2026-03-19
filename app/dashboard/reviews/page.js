"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Star, Search, Download, MoreHorizontal, Eye, MessageSquare, CheckCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const statusColors = {
  Public: "bg-primary/20 text-primary",
  Private: "bg-secondary text-muted-foreground",
  Resolved: "bg-emerald-500/20 text-emerald-400",
  Pending: "bg-amber-500/20 text-amber-400",
};

const reviews = [
  { id: 1, name: "Sarah Mitchell", rating: 5, text: "Incredible service! The staff was extremely helpful and the quality exceeded my expectations.", location: "Downtown", source: "NFC", statusKey: "rev.public", date: "Feb 23, 2026" },
  { id: 2, name: "James Kirkland", rating: 5, text: "Best experience I've had. Highly recommend to anyone looking for quality.", location: "Midtown", source: "QR", statusKey: "rev.public", date: "Feb 23, 2026" },
  { id: 3, name: "Maria Lopez", rating: 4, text: "Great quality, but slightly slow service on the weekend.", location: "Downtown", source: "NFC", statusKey: "rev.public", date: "Feb 22, 2026" },
  { id: 4, name: "David Park", rating: 2, text: "Not satisfied. Wait time was too long and staff seemed uninterested.", location: "Westside", source: "QR", statusKey: "rev.private", date: "Feb 22, 2026" },
  { id: 5, name: "Lisa Thompson", rating: 3, text: "Good but could improve wait times and overall atmosphere.", location: "Downtown", source: "NFC", statusKey: "rev.pending", date: "Feb 21, 2026" },
  { id: 6, name: "Robert Chen", rating: 5, text: "Absolutely fantastic! Will be coming back every week.", location: "Midtown", source: "NFC", statusKey: "rev.public", date: "Feb 21, 2026" },
  { id: 7, name: "Emily Watson", rating: 1, text: "Very disappointed with the experience. Multiple issues.", location: "Westside", source: "QR", statusKey: "rev.resolved", date: "Feb 20, 2026" },
  { id: 8, name: "Michael Brown", rating: 4, text: "Solid experience overall, would recommend.", location: "Downtown", source: "NFC", statusKey: "rev.public", date: "Feb 20, 2026" },
];

const statusFilterKeys = ["rev.public", "rev.private", "rev.resolved", "rev.pending"];

const Reviews = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const filtered = reviews.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedRating && r.rating !== selectedRating) return false;
    if (selectedStatus && r.statusKey !== selectedStatus) return false;
    return true;
  });

  const toggleRow = (id) => {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  };

  const exportCSV = () => {
    const rows = filtered.map((r) => `"${r.name}",${r.rating},"${r.text}","${r.location}","${r.source}","${t(r.statusKey)}","${r.date}"`);
    const csv = `${t("rev.customer")},${t("rev.rating")},${t("rev.review")},${t("rev.location")},${t("rev.source")},${t("rev.status")},${t("rev.date")}\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviews-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t("rev.exported"), description: `${filtered.length} ${t("rev.exported_desc")}` });
  };

  return (
    <DashboardLayout
      title={t("rev.title")}
      subtitle={t("rev.subtitle")}
      headerAction={
        <Button variant="outline" size="sm" className="gap-2 border-border/50" onClick={exportCSV}>
          <Download size={16} /> {t("rev.export_csv")}
        </Button>
      }
    >
      <motion.div variants={fadeUp} custom={0} className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("rev.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((r) => (
            <button key={r} onClick={() => setSelectedRating(selectedRating === r ? null : r)} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${selectedRating === r ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-card text-muted-foreground hover:text-foreground"}`}>
              {r} <Star size={12} className={selectedRating === r ? "fill-primary" : ""} />
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilterKeys.map((sk) => (
            <button key={sk} onClick={() => setSelectedStatus(selectedStatus === sk ? null : sk)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${selectedStatus === sk ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-card text-muted-foreground hover:text-foreground"}`}>
              {t(sk)}
            </button>
          ))}
        </div>
      </motion.div>

      {selectedRows.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium">{selectedRows.length} {t("rev.selected")}</span>
          <Button size="sm" variant="outline" className="text-xs border-border/50">{t("rev.mark_resolved")}</Button>
          <Button size="sm" variant="outline" className="text-xs border-border/50" onClick={exportCSV}>{t("rev.export_selected")}</Button>
          <button onClick={() => setSelectedRows([])} className="ml-auto text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </motion.div>
      )}

      <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-4 text-left w-10">
                  <input type="checkbox" className="rounded border-border accent-primary" checked={selectedRows.length === filtered.length && filtered.length > 0} onChange={() => setSelectedRows(selectedRows.length === filtered.length ? [] : filtered.map((r) => r.id))} />
                </th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("rev.customer")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("rev.rating")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t("rev.review")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("rev.location")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("rev.source")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("rev.status")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t("rev.date")}</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} className="border-b border-border/30 hover:bg-secondary/50 cursor-pointer transition-colors" onClick={() => setSelectedReview(review)}>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-border accent-primary" checked={selectedRows.includes(review.id)} onChange={() => toggleRow(review.id)} />
                  </td>
                  <td className="p-4 text-sm font-medium">{review.name}</td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={14} className={j < review.rating ? "text-primary fill-primary" : "text-muted"} />))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate hidden md:table-cell">{review.text}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{review.location}</td>
                  <td className="p-4 hidden lg:table-cell"><span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">{review.source}</span></td>
                  <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[t(review.statusKey)] || "bg-secondary text-muted-foreground"}`}>{t(review.statusKey)}</span></td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{review.date}</td>
                  <td className="p-4"><button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="p-12 text-center"><Star size={40} className="mx-auto mb-3 text-muted" /><p className="text-muted-foreground">{t("rev.no_match")}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearch(""); setSelectedRating(null); setSelectedStatus(null); }}>{t("rev.clear_filters")}</Button></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{t("rev.showing")} {filtered.length} {t("rev.of")} {reviews.length} {t("rev.reviews")}</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><ChevronLeft size={16} /></button>
            <button className="px-3 py-1.5 rounded text-xs bg-primary/10 text-primary font-medium">1</button>
            <button className="px-3 py-1.5 rounded text-xs text-muted-foreground hover:bg-secondary">2</button>
            <button className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><ChevronRight size={16} /></button>
          </div>
        </div>
      </motion.div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedReview(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg">{selectedReview.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} size={14} className={j < selectedReview.rating ? "text-primary fill-primary" : "text-muted"} />))}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[t(selectedReview.statusKey)] || "bg-secondary text-muted-foreground"}`}>{t(selectedReview.statusKey)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedReview(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{selectedReview.text}</p>
            <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
              <div className="rounded-lg bg-secondary/50 p-3"><span className="text-muted-foreground">{t("rev.location")}</span><p className="font-medium mt-1">{selectedReview.location}</p></div>
              <div className="rounded-lg bg-secondary/50 p-3"><span className="text-muted-foreground">{t("rev.source")}</span><p className="font-medium mt-1">{selectedReview.source}</p></div>
              <div className="rounded-lg bg-secondary/50 p-3"><span className="text-muted-foreground">{t("rev.date")}</span><p className="font-medium mt-1">{selectedReview.date}</p></div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-2 block">{t("rev.internal_notes")}</label>
              <textarea className="w-full rounded-lg border border-border/50 bg-secondary/50 p-3 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary" placeholder={t("rev.add_notes")} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="gap-2 glow-red-hover"><MessageSquare size={14} /> {t("rev.reply")}</Button>
              <Button size="sm" variant="outline" className="gap-2 border-border/50"><CheckCircle size={14} /> {t("rev.mark_resolved_btn")}</Button>
              <Button size="sm" variant="outline" className="gap-2 border-border/50"><Eye size={14} /> {t("rev.view_public")}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reviews;
