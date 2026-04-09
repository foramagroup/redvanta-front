"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MapPin,
  Plus,
  Star,
  CreditCard,
  BarChart3,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { get, patch, post, put, remove } from "@/lib/api";

const EMPTY_LOCATION_FORM = {
  name: "",
  address: "",
  placeId: "",
  selectedCardId: "",
};


const EMPTY_STATS = {
  total: 0,
  active: 0,
  inactive: 0,
  totalCards: 0,
  totalReviews: 0,
  avgRating: 0,
};

const EMPTY_ANALYTICS = {
  rating: 0,
  reviews: 0,
  conversion: "0%",
  monthlyTrend: [],
  totalScans: 0,
  googleRedirects: 0,
  cardCount: 0,
};

const formatCardLabel = (card) => {
  if (!card) return "";
  const tagSerial = card.tagSerial || card.tag?.tagSerial;
  return `${card.uid}${tagSerial ? ` • ${tagSerial}` : ""}`;
};

const buildCardOptions = (assignedCard, availableCards) => {
  const mergedCards = assignedCard ? [assignedCard, ...availableCards] : availableCards;
  const seen = new Set();

  return mergedCards.filter((card) => {
    if (!card?.id || seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
};

const Locations = () => {
  const { t } = useLanguage();
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [editLocation, setEditLocation] = useState(null);
  const [analyticsLocation, setAnalyticsLocation] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(EMPTY_ANALYTICS);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_LOCATION_FORM);
  const [editForm, setEditForm] = useState(EMPTY_LOCATION_FORM);
  const [availableCards, setAvailableCards] = useState([]);

  const loadLocations = async () => {
    const response = await get("/api/admin/locations");
    return Array.isArray(response?.data) ? response.data : [];
  };

  const loadStats = async () => {
    const response = await get("/api/admin/locations/stats");
    return response?.data || EMPTY_STATS;
  };

  const loadAvailableCards = async () => {
    const response = await get("/api/admin/locations/list-company-card");
    return Array.isArray(response?.data) ? response.data : [];
  };

  const refreshDashboard = async () => {
    const [nextLocations, nextStats, nextCards] = await Promise.all([
      loadLocations(),
      loadStats(),
      loadAvailableCards(),
    ]);
    setLocations(nextLocations);
    setStats(nextStats);
    setAvailableCards(nextCards);
  };

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        setLoading(true);
        const [nextLocations, nextStats, nextCards] = await Promise.all([
          loadLocations(),
          loadStats(),
          loadAvailableCards(),
        ]);
        if (cancelled) return;
        setLocations(nextLocations);
        setStats(nextStats);
        setAvailableCards(nextCards);
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Locations",
            description: error?.message || error?.error || "Unable to load locations.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  const openEdit = async (loc) => {
    try {
      const response = await get(`/api/admin/locations/${loc.id}`);
      const nextLoc = response?.data || loc;
      const assignedCard = nextLoc.assignedCard || nextLoc.assignedCards?.[0] || null;
      setEditLocation(nextLoc);
      setEditForm({
        name: nextLoc.name || "",
        address: nextLoc.address || "",
        placeId: nextLoc.googlePlaceId || "",
        selectedCardId: assignedCard?.id ? String(assignedCard.id) : "",
      });
    } catch (error) {
      toast({
        title: "Locations",
        description: error?.message || error?.error || "Unable to load location details.",
        variant: "destructive",
      });
    }
  };

  const saveEdit = async () => {
    if (!editLocation) return;
    try {
      setSubmitting(true);
      const response = await put(`/api/admin/locations/${editLocation.id}`, {
        name: editForm.name,
        address: editForm.address,
        placeId: editForm.placeId || undefined,
      });

      if (editForm.selectedCardId) {
        await post(`/api/admin/locations/${editLocation.id}/assign-card`, {
          cardId: Number(editForm.selectedCardId),
        });
      }

      await refreshDashboard();
      setEditLocation(null);
      toast({ title: "Locations", description: "Location updated." });
    } catch (error) {
      toast({
        title: "Locations",
        description: error?.message || error?.error || "Unable to update location.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const createLocation = async () => {
    try {
      setSubmitting(true);
      const response = await post("/api/admin/locations", {
        name: addForm.name,
        address: addForm.address,
        placeId: addForm.placeId || undefined,
      });

      if (response?.data?.id && addForm.selectedCardId) {
        await post(`/api/admin/locations/${response.data.id}/assign-card`, {
          cardId: Number(addForm.selectedCardId),
        });
      }

      await refreshDashboard();
      setAddForm(EMPTY_LOCATION_FORM);
      setShowAdd(false);
      toast({ title: "Locations", description: "Location created." });
    } catch (error) {
      toast({
        title: "Locations",
        description: error?.message || error?.error || "Unable to create location.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLocation = async (loc) => {
    try {
      const response = await patch(`/api/admin/locations/${loc.id}/toggle`);
      const updated = response?.data;
      if (updated) {
        setLocations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
      const nextStats = await loadStats();
      setStats(nextStats);
    } catch (error) {
      toast({
        title: "Locations",
        description: error?.message || error?.error || "Unable to toggle location.",
        variant: "destructive",
      });
    }
  };

  const deleteLocation = async () => {
    if (!showDelete) return;
    try {
      await remove(`/api/admin/locations/${showDelete}`);
      setLocations((prev) => prev.filter((loc) => loc.id !== showDelete));
      const nextStats = await loadStats();
      setStats(nextStats);
      setShowDelete(null);
      toast({ title: "Locations", description: "Location deleted." });
    } catch (error) {
      toast({
        title: "Locations",
        description: error?.message || error?.error || "Unable to delete location.",
        variant: "destructive",
      });
    }
  };

  const openAnalytics = async (loc) => {
    try {
      setAnalyticsLocation(loc);
      setAnalyticsLoading(true);
      const response = await get(`/api/admin/locations/${loc.id}/analytics`);
      setAnalyticsData(response?.data || EMPTY_ANALYTICS);
    } catch (error) {
      toast({
        title: "Locations",
        description: error?.message || error?.error || "Unable to load analytics.",
        variant: "destructive",
      });
      setAnalyticsLocation(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const refreshGoogleData = async () => {
    if (!analyticsLocation) return;
    try {
      setAnalyticsLoading(true);
      await post(`/api/admin/locations/${analyticsLocation.id}/refresh-google`);
      await refreshDashboard();
      const analyticsResponse = await get(`/api/admin/locations/${analyticsLocation.id}/analytics`);
      setAnalyticsData(analyticsResponse?.data || EMPTY_ANALYTICS);
      const locationResponse = await get(`/api/admin/locations/${analyticsLocation.id}`);
      setAnalyticsLocation(locationResponse?.data || analyticsLocation);
      toast({ title: "Locations", description: "Google data refreshed." });
    } catch (error) {
      toast({
        title: "Locations",
        description: error?.message || error?.error || "Unable to refresh Google data.",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: MapPin },
    { label: "Active", value: stats.active, icon: TrendingUp },
    { label: "Cards", value: stats.totalCards, icon: CreditCard },
    { label: "Avg Rating", value: stats.avgRating || "—", icon: Star },
  ];
  const editCardOptions = buildCardOptions(editLocation?.assignedCard, availableCards);

  return (
    <DashboardLayout
      title={t("loc.title")}
      subtitle={t("loc.subtitle")}
      headerAction={
        <Button
          size="sm"
          className="gap-2 glow-red-hover"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={16} /> {t("loc.add")}
        </Button>
      }
    >
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => (
            <div key={item.label} className="rounded-xl border border-border/50 bg-gradient-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <item.icon size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className="font-display text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="rounded-xl border border-border/50 bg-gradient-card p-6 text-sm text-muted-foreground">
              Loading locations...
            </div>
          ) : (
            locations.map((loc) => (
              <motion.div
                key={loc.id}
                variants={fadeUp}
                custom={loc.id * 0.5}
                className={`rounded-xl border bg-gradient-card p-6 transition-all ${
                  loc.active ? "border-border/50 hover:border-primary/30" : "border-border/30 opacity-60"
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold">{loc.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{loc.address || "—"}</p>
                    </div>
                  </div>
                  <button
                    className={`relative h-5 w-10 rounded-full transition-colors ${
                      loc.active ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => toggleLocation(loc)}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform ${
                        loc.active ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star size={14} className="fill-primary text-primary" />
                      <span className="font-display font-bold">{loc.rating || "—"}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t("loc.rating")}</span>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <span className="block font-display font-bold">{loc.reviews}</span>
                    <span className="text-[10px] text-muted-foreground">{t("loc.reviews")}</span>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CreditCard size={12} className="text-primary" />
                      <span className="font-display font-bold">{loc.cards}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t("loc.cards")}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 border-border/50 text-xs"
                    onClick={() => openEdit(loc)}
                  >
                    <Pencil size={12} /> {t("loc.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 border-border/50 text-xs"
                    onClick={() => openAnalytics(loc)}
                  >
                    <BarChart3 size={12} /> {t("loc.analytics")}
                  </Button>
                  <button
                    onClick={() => setShowDelete(loc.id)}
                    className="rounded-lg border border-border/50 p-2 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}

          <motion.button
            variants={fadeUp}
            custom={5}
            onClick={() => setShowAdd(true)}
            className="flex min-h-[250px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 p-6 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <Plus size={32} />
            <span className="text-sm font-medium">{t("loc.add_new")}</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowAdd(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-md rounded-xl border border-border/50 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{t("loc.add")}</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">{t("loc.location_name")}</label>
                <Input
                  className="border-border/50 bg-secondary/50"
                  placeholder="e.g. Brooklyn Hub"
                  value={addForm.name}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">{t("loc.address")}</label>
                <Input
                  className="border-border/50 bg-secondary/50"
                  placeholder="123 Main St, City, State"
                  value={addForm.address}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">{t("loc.place_id")}</label>
                <Input
                  className="border-border/50 bg-secondary/50"
                  placeholder="ChIJ..."
                  value={addForm.placeId}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, placeId: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">{t("loc.assign_cards")}</label>
                <Select
                  value={addForm.selectedCardId}
                  onValueChange={(value) => setAddForm((prev) => ({ ...prev, selectedCardId: value }))}
                >
                  <SelectTrigger className="border-border/50 bg-secondary/50">
                    <SelectValue placeholder="Select an available NFC card" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCards.length > 0 ? (
                      availableCards.map((card) => (
                        <SelectItem key={card.id} value={String(card.id)}>
                          {card.uid}{card.tag?.tagSerial ? ` • ${card.tag.tagSerial}` : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-card" disabled>No available NFC cards</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full glow-red-hover" onClick={createLocation} disabled={submitting}>
                {t("loc.add")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {editLocation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setEditLocation(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-md rounded-xl border border-border/50 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{t("loc.edit_title")}</h3>
              <button onClick={() => setEditLocation(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">{t("loc.location_name")}</label>
                <Input
                  className="border-border/50 bg-secondary/50"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">{t("loc.address")}</label>
                <Input
                  className="border-border/50 bg-secondary/50"
                  value={editForm.address}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">{t("loc.place_id")}</label>
                <Input
                  className="border-border/50 bg-secondary/50"
                  value={editForm.placeId}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, placeId: e.target.value }))}
                  placeholder="ChIJ..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">{t("loc.assign_cards")}</label>
                <Select
                  value={editForm.selectedCardId}
                  onValueChange={(value) => setEditForm((prev) => ({ ...prev, selectedCardId: value }))}
                >
                  <SelectTrigger className="border-border/50 bg-secondary/50">
                    <SelectValue placeholder="Assign an available NFC card" />
                  </SelectTrigger>
                  <SelectContent>
                    {editLocation?.assignedCard && !availableCards.some((card) => card.id === editLocation.assignedCard.id) && (
                      <SelectItem value={String(editLocation.assignedCard.id)}>
                        {formatCardLabel(editLocation.assignedCard)}
                      </SelectItem>
                    )}
                    {availableCards.length > 0 ? (
                      availableCards.map((card) => (
                        <SelectItem key={card.id} value={String(card.id)}>
                          {card.uid}{card.tag?.tagSerial ? ` • ${card.tag.tagSerial}` : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-card" disabled>No available NFC cards</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full glow-red-hover" onClick={saveEdit} disabled={submitting}>
                {t("loc.save_changes")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {analyticsLocation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setAnalyticsLocation(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-lg rounded-xl border border-border/50 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">
                {analyticsLocation.name} - {t("loc.analytics")}
              </h3>
              <button onClick={() => setAnalyticsLocation(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 flex justify-end">
              <Button variant="outline" size="sm" className="gap-2" onClick={refreshGoogleData} disabled={analyticsLoading}>
                <RefreshCw size={14} className={analyticsLoading ? "animate-spin" : ""} />
                Refresh Google
              </Button>
            </div>
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <Star size={18} className="mx-auto mb-1 fill-primary text-primary" />
                <span className="block font-display text-2xl font-bold">
                  {analyticsLoading ? "..." : analyticsData.rating}
                </span>
                <span className="text-[10px] text-muted-foreground">{t("loc.avg_rating")}</span>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <MessageSquare size={18} className="mx-auto mb-1 text-primary" />
                <span className="block font-display text-2xl font-bold">
                  {analyticsLoading ? "..." : analyticsData.reviews}
                </span>
                <span className="text-[10px] text-muted-foreground">{t("loc.total_reviews")}</span>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-center">
                <TrendingUp size={18} className="mx-auto mb-1 text-primary" />
                <span className="block font-display text-2xl font-bold">
                  {analyticsLoading ? "..." : analyticsData.conversion}
                </span>
                <span className="text-[10px] text-muted-foreground">{t("loc.conversion")}</span>
              </div>
            </div>
            <h4 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">{t("loc.monthly_trend")}</h4>
            <div className="mb-4 flex h-32 items-end gap-2">
              {(analyticsData.monthlyTrend || []).map((entry, index, array) => {
                const maxValue = Math.max(...array.map((item) => item.scans), 1);
                return (
                  <div key={`${entry.month}-${index}`} className="flex flex-1 flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(entry.scans / maxValue) * 100}%` }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      className="w-full rounded-t-md bg-primary/80"
                    />
                    <span className="text-[10px] text-muted-foreground">{entry.month}</span>
                  </div>
                );
              })}
            </div>
            <Button className="w-full" onClick={() => setAnalyticsLocation(null)}>
              {t("loc.close")}
            </Button>
          </motion.div>
        </div>
      )}

      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowDelete(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-sm rounded-xl border border-border/50 bg-card p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 size={24} className="text-destructive" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold">{t("loc.delete_title")}</h3>
            <p className="mb-6 text-sm text-muted-foreground">{t("loc.delete_desc")}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-border/50" onClick={() => setShowDelete(null)}>
                {t("loc.cancel")}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={deleteLocation}>
                {t("loc.delete")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Locations;
