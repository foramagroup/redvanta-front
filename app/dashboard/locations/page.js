"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { MapPin, Plus, Star, CreditCard, BarChart3, Pencil, Trash2, X, TrendingUp, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const initialLocations = [
  { id: 1, name: "Downtown Flagship", address: "123 Main St, New York, NY 10001", rating: 4.9, reviews: 523, cards: 8, active: true },
  { id: 2, name: "Midtown Office", address: "456 5th Ave, New York, NY 10018", rating: 4.7, reviews: 412, cards: 5, active: true },
  { id: 3, name: "Westside Branch", address: "789 Broadway, New York, NY 10003", rating: 4.6, reviews: 312, cards: 3, active: true },
  { id: 4, name: "Brooklyn Hub", address: "321 Atlantic Ave, Brooklyn, NY 11217", rating: 0, reviews: 0, cards: 0, active: false },
];

const Locations = () => {
  const { t } = useLanguage();
  const [locations, setLocations] = useState(initialLocations);
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [editLocation, setEditLocation] = useState(null);
  const [analyticsLocation, setAnalyticsLocation] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", address: "", placeId: "", cards: 0 });

  const openEdit = (loc) => { setEditLocation(loc); setEditForm({ name: loc.name, address: loc.address, placeId: "", cards: loc.cards }); };
  const saveEdit = () => { if (editLocation) { setLocations((prev) => prev.map((l) => l.id === editLocation.id ? { ...l, name: editForm.name, address: editForm.address, cards: editForm.cards } : l)); setEditLocation(null); } };

  return (
    <DashboardLayout title={t("loc.title")} subtitle={t("loc.subtitle")}
      headerAction={<Button size="sm" className="gap-2 glow-red-hover" onClick={() => setShowAdd(true)}><Plus size={16} /> {t("loc.add")}</Button>}
    >
      <motion.div variants={fadeUp} custom={0} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <motion.div key={loc.id} variants={fadeUp} custom={loc.id * 0.5} className={`rounded-xl border bg-gradient-card p-6 transition-all ${loc.active ? "border-border/50 hover:border-primary/30" : "border-border/30 opacity-60"}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><MapPin size={20} className="text-primary" /></div>
                <div><h3 className="font-display font-semibold text-sm">{loc.name}</h3><p className="text-xs text-muted-foreground mt-0.5">{loc.address}</p></div>
              </div>
              <button className={`relative w-10 h-5 rounded-full transition-colors ${loc.active ? "bg-primary" : "bg-muted"}`} onClick={() => setLocations((prev) => prev.map((l) => l.id === loc.id ? { ...l, active: !l.active } : l))}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${loc.active ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="flex items-center justify-center gap-1"><Star size={14} className="text-primary fill-primary" /><span className="font-display font-bold">{loc.rating || "—"}</span></div>
                <span className="text-[10px] text-muted-foreground">{t("loc.rating")}</span>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <span className="font-display font-bold block">{loc.reviews}</span>
                <span className="text-[10px] text-muted-foreground">{t("loc.reviews")}</span>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 text-center">
                <div className="flex items-center justify-center gap-1"><CreditCard size={12} className="text-primary" /><span className="font-display font-bold">{loc.cards}</span></div>
                <span className="text-[10px] text-muted-foreground">{t("loc.cards")}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs border-border/50" onClick={() => openEdit(loc)}><Pencil size={12} /> {t("loc.edit")}</Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs border-border/50" onClick={() => setAnalyticsLocation(loc)}><BarChart3 size={12} /> {t("loc.analytics")}</Button>
              <button onClick={() => setShowDelete(loc.id)} className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"><Trash2 size={14} /></button>
            </div>
          </motion.div>
        ))}
        <motion.button variants={fadeUp} custom={5} onClick={() => setShowAdd(true)} className="rounded-xl border-2 border-dashed border-border/50 p-6 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors min-h-[250px]">
          <Plus size={32} /><span className="text-sm font-medium">{t("loc.add_new")}</span>
        </motion.button>
      </motion.div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold text-lg">{t("loc.add")}</h3><button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("loc.location_name")}</label><Input className="bg-secondary/50 border-border/50" placeholder="e.g. Brooklyn Hub" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("loc.address")}</label><Input className="bg-secondary/50 border-border/50" placeholder="123 Main St, City, State" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("loc.place_id")}</label><Input className="bg-secondary/50 border-border/50" placeholder="ChIJ..." /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("loc.assign_cards")}</label><Input className="bg-secondary/50 border-border/50" type="number" placeholder="0" /></div>
              <Button className="w-full glow-red-hover">{t("loc.add")}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {editLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setEditLocation(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold text-lg">{t("loc.edit_title")}</h3><button onClick={() => setEditLocation(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("loc.location_name")}</label><Input className="bg-secondary/50 border-border/50" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("loc.address")}</label><Input className="bg-secondary/50 border-border/50" value={editForm.address} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("loc.place_id")}</label><Input className="bg-secondary/50 border-border/50" value={editForm.placeId} onChange={(e) => setEditForm((p) => ({ ...p, placeId: e.target.value }))} placeholder="ChIJ..." /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("loc.assign_cards")}</label><Input className="bg-secondary/50 border-border/50" type="number" value={editForm.cards} onChange={(e) => setEditForm((p) => ({ ...p, cards: +e.target.value }))} /></div>
              <Button className="w-full glow-red-hover" onClick={saveEdit}>{t("loc.save_changes")}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {analyticsLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setAnalyticsLocation(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold text-lg">{analyticsLocation.name} — {t("loc.analytics")}</h3><button onClick={() => setAnalyticsLocation(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-secondary/50 p-4 text-center"><Star size={18} className="text-primary mx-auto mb-1 fill-primary" /><span className="font-display text-2xl font-bold block">{analyticsLocation.rating}</span><span className="text-[10px] text-muted-foreground">{t("loc.avg_rating")}</span></div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center"><MessageSquare size={18} className="text-primary mx-auto mb-1" /><span className="font-display text-2xl font-bold block">{analyticsLocation.reviews}</span><span className="text-[10px] text-muted-foreground">{t("loc.total_reviews")}</span></div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center"><TrendingUp size={18} className="text-primary mx-auto mb-1" /><span className="font-display text-2xl font-bold block">32%</span><span className="text-[10px] text-muted-foreground">{t("loc.conversion")}</span></div>
            </div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">{t("loc.monthly_trend")}</h4>
            <div className="h-32 flex items-end gap-2 mb-4">
              {[18, 24, 31, 28, 35, 42].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(v / 42) * 100}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }} className="w-full rounded-t-md bg-primary/80" />
                  <span className="text-[10px] text-muted-foreground">{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"][i]}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => setAnalyticsLocation(null)}>{t("loc.close")}</Button>
          </motion.div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowDelete(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mx-4 rounded-xl border border-border/50 bg-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-destructive" /></div>
            <h3 className="font-display font-semibold text-lg mb-2">{t("loc.delete_title")}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t("loc.delete_desc")}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-border/50" onClick={() => setShowDelete(null)}>{t("loc.cancel")}</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { setLocations((prev) => prev.filter((l) => l.id !== showDelete)); setShowDelete(null); }}>{t("loc.delete")}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Locations;
