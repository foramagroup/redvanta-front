"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Star,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  MessageSquare,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { get, patch, post } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const statusColors = {
  "rev.public": "bg-primary/20 text-primary",
  "rev.private": "bg-secondary text-muted-foreground",
  "rev.resolved": "bg-emerald-500/20 text-emerald-400",
  "rev.pending": "bg-amber-500/20 text-amber-400",
};

const statusFilterKeys = ["rev.public", "rev.private", "rev.resolved", "rev.pending"];

const Reviews = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, last_page: 1, showing: 0 });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [replyDraft, setReplyDraft] = useState("");

  const queryParams = useMemo(() => ({
    page,
    limit: 20,
    ...(search ? { search } : {}),
    ...(selectedRating ? { rating: selectedRating } : {}),
    ...(selectedStatus ? { statusKey: selectedStatus } : {}),
  }), [page, search, selectedRating, selectedStatus]);

  const loadStats = async () => {
    const response = await get("/api/admin/reviews/stats");
    setStats(response?.data || null);
  };

  const loadReviews = async () => {
    const response = await get("/api/admin/reviews", queryParams);
    setReviews(Array.isArray(response?.data) ? response.data : []);
    setMeta(response?.meta || { total: 0, page: 1, limit: 20, last_page: 1, showing: 0 });
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [statsResponse, reviewsResponse] = await Promise.all([
          get("/api/admin/reviews/stats"),
          get("/api/admin/reviews", queryParams),
        ]);

        if (!mounted) return;

        setStats(statsResponse?.data || null);
        setReviews(Array.isArray(reviewsResponse?.data) ? reviewsResponse.data : []);
        setMeta(reviewsResponse?.meta || { total: 0, page: 1, limit: 20, last_page: 1, showing: 0 });
      } catch (error) {
        if (!mounted) return;
        toast({
          title: t("rev.title"),
          description: error?.error || "Unable to load reviews.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [queryParams, t]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedRating, selectedStatus]);

  useEffect(() => {
    setNotesDraft(selectedReview?.internalNotes || "");
    setReplyDraft("");
  }, [selectedReview]);

  const toggleRow = (id) => {
    setSelectedRows((prev) => (
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    ));
  };

  const openReview = async (review) => {
    try {
      setDetailLoading(true);
      const response = await get(`/api/admin/reviews/${review.id}`);
      const nextReview = response?.data || review;
      setSelectedReview(nextReview);
    } catch (error) {
      toast({
        title: t("rev.title"),
        description: error?.error || "Unable to load review details.",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const syncReviewInList = (updatedReview) => {
    setReviews((current) => current.map((review) => (
      review.id === updatedReview.id ? { ...review, ...updatedReview } : review
    )));
    setSelectedReview((current) => (
      current?.id === updatedReview.id ? { ...current, ...updatedReview } : current
    ));
  };

  const exportCSV = async (selectedOnly = false) => {
    try {
      const params = new URLSearchParams();

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      });

      if (selectedOnly && selectedRows.length) {
        params.delete("page");
        params.delete("limit");
      }

      const response = await fetch(`${API_URL}/api/admin/reviews/export?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "reviews-export.csv";
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: t("rev.exported"),
        description: `${selectedOnly ? selectedRows.length : meta.total} ${t("rev.exported_desc")}`,
      });
    } catch {
      toast({
        title: t("rev.title"),
        description: "Unable to export CSV.",
        variant: "destructive",
      });
    }
  };

  const markResolved = async (reviewId) => {
    try {
      const response = await patch(`/api/admin/reviews/${reviewId}/status`, { statusKey: "rev.resolved" });
      syncReviewInList(response?.data);
      await loadStats();
      toast({ title: t("rev.mark_resolved_btn"), description: "Review updated." });
    } catch (error) {
      toast({
        title: t("rev.mark_resolved_btn"),
        description: error?.error || "Unable to update review status.",
        variant: "destructive",
      });
    }
  };

  const handleBulkResolve = async () => {
    if (!selectedRows.length) return;

    try {
      setBulkLoading(true);
      await patch("/api/admin/reviews/bulk/status", {
        ids: selectedRows,
        statusKey: "rev.resolved",
      });
      setSelectedRows([]);
      await Promise.all([loadStats(), loadReviews()]);
      toast({ title: t("rev.mark_resolved"), description: "Selected reviews updated." });
    } catch (error) {
      toast({
        title: t("rev.mark_resolved"),
        description: error?.error || "Unable to update selected reviews.",
        variant: "destructive",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedReview) return;

    try {
      setSavingNotes(true);
      const response = await patch(`/api/admin/reviews/${selectedReview.id}/notes`, { notes: notesDraft });
      syncReviewInList(response?.data);
      toast({ title: t("rev.internal_notes"), description: "Notes saved." });
    } catch (error) {
      toast({
        title: t("rev.internal_notes"),
        description: error?.error || "Unable to save notes.",
        variant: "destructive",
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const sendReply = async () => {
    if (!selectedReview || !replyDraft.trim()) return;

    try {
      setSendingReply(true);
      const response = await post(`/api/admin/reviews/${selectedReview.id}/reply`, { reply: replyDraft });
      syncReviewInList(response?.data);
      setReplyDraft("");
      await loadStats();
      toast({ title: t("rev.reply"), description: response?.message || "Reply sent." });
    } catch (error) {
      toast({
        title: t("rev.reply"),
        description: error?.error || "Unable to send reply.",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  const totalPages = meta?.last_page || 1;

  return (
    <DashboardLayout
      title={t("rev.title")}
      subtitle={t("rev.subtitle")}
      headerAction={(
        <Button variant="outline" size="sm" className="gap-2 border-border/50" onClick={() => exportCSV(false)}>
          <Download size={16} /> {t("rev.export_csv")}
        </Button>
      )}
    >
      <motion.div variants={fadeUp} custom={0} className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("rev.search")}
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearch(searchDraft);
            }}
            className="border-border/50 bg-card pl-9"
          />
        </div>
        <Button variant="outline" size="sm" className="border-border/50" onClick={() => setSearch(searchDraft)}>
          Search
        </Button>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                selectedRating === rating
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {rating} <Star size={12} className={selectedRating === rating ? "fill-primary" : ""} />
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilterKeys.map((statusKey) => {
            const count = stats?.byStatus?.[
              statusKey === "rev.public"
                ? "PUBLIC"
                : statusKey === "rev.private"
                  ? "PRIVATE"
                  : statusKey === "rev.resolved"
                    ? "RESOLVED"
                    : "PENDING"
            ];

            return (
              <button
                key={statusKey}
                onClick={() => setSelectedStatus(selectedStatus === statusKey ? null : statusKey)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  selectedStatus === statusKey
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(statusKey)}{typeof count === "number" ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      </motion.div>

      {selectedRows.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium">{selectedRows.length} {t("rev.selected")}</span>
          <Button size="sm" variant="outline" className="border-border/50 text-xs" onClick={handleBulkResolve} disabled={bulkLoading}>
            {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            {t("rev.mark_resolved")}
          </Button>
          <Button size="sm" variant="outline" className="border-border/50 text-xs" onClick={() => exportCSV(true)}>
            {t("rev.export_selected")}
          </Button>
          <button onClick={() => setSelectedRows([])} className="ml-auto text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </motion.div>
      )}

      <motion.div variants={fadeUp} custom={1} className="overflow-hidden rounded-xl border border-border/50 bg-gradient-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="w-10 p-4 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-border accent-primary"
                    checked={selectedRows.length === reviews.length && reviews.length > 0}
                    onChange={() => setSelectedRows(selectedRows.length === reviews.length ? [] : reviews.map((review) => review.id))}
                  />
                </th>
                <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("rev.customer")}</th>
                <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("rev.rating")}</th>
                <th className="hidden p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">{t("rev.review")}</th>
                <th className="hidden p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">{t("rev.location")}</th>
                <th className="hidden p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">{t("rev.source")}</th>
                <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("rev.status")}</th>
                <th className="hidden p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">{t("rev.date")}</th>
                <th className="w-10 p-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <Loader2 size={32} className="mx-auto mb-3 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading reviews...</p>
                  </td>
                </tr>
              ) : reviews.map((review) => (
                <tr
                  key={review.id}
                  className="cursor-pointer border-b border-border/30 transition-colors hover:bg-secondary/50"
                  onClick={() => openReview(review)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-border accent-primary"
                      checked={selectedRows.includes(review.id)}
                      onChange={() => toggleRow(review.id)}
                    />
                  </td>
                  <td className="p-4 text-sm font-medium">{review.name}</td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={14} className={index < review.rating ? "fill-primary text-primary" : "text-muted"} />
                      ))}
                    </div>
                  </td>
                  <td className="hidden max-w-xs truncate p-4 text-sm text-muted-foreground md:table-cell">{review.text}</td>
                  <td className="hidden p-4 text-sm text-muted-foreground lg:table-cell">{review.location || "—"}</td>
                  <td className="hidden p-4 lg:table-cell">
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">{review.source}</span>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[review.statusKey] || "bg-secondary text-muted-foreground"}`}>
                      {t(review.statusKey)}
                    </span>
                  </td>
                  <td className="hidden p-4 text-sm text-muted-foreground sm:table-cell">{review.date}</td>
                  <td className="p-4">
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && reviews.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <Star size={40} className="mx-auto mb-3 text-muted" />
                    <p className="text-muted-foreground">{t("rev.no_match")}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        setSearch("");
                        setSearchDraft("");
                        setSelectedRating(null);
                        setSelectedStatus(null);
                      }}
                    >
                      {t("rev.clear_filters")}
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {t("rev.showing")} {meta.showing} {t("rev.of")} {meta.total} {t("rev.reviews")}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-50"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button className="rounded bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              {page}
            </button>
            <button
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-50"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedReview(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-lg rounded-xl border border-border/50 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="py-12 text-center">
                <Loader2 size={28} className="mx-auto mb-3 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{selectedReview.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} size={14} className={index < selectedReview.rating ? "fill-primary text-primary" : "text-muted"} />
                        ))}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[selectedReview.statusKey] || "bg-secondary text-muted-foreground"}`}>
                        {t(selectedReview.statusKey)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedReview(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                  </button>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{selectedReview.text}</p>
                <div className="mb-6 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-muted-foreground">{t("rev.location")}</span>
                    <p className="mt-1 font-medium">{selectedReview.location || "—"}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-muted-foreground">{t("rev.source")}</span>
                    <p className="mt-1 font-medium">{selectedReview.source}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <span className="text-muted-foreground">{t("rev.date")}</span>
                    <p className="mt-1 font-medium">{selectedReview.date}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-xs text-muted-foreground">{t("rev.internal_notes")}</label>
                  <textarea
                    className="h-20 w-full resize-none rounded-lg border border-border/50 bg-secondary/50 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={t("rev.add_notes")}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-xs text-muted-foreground">{t("rev.reply")}</label>
                  <textarea
                    className="h-20 w-full resize-none rounded-lg border border-border/50 bg-secondary/50 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={t("rev.reply")}
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-2 glow-red-hover" onClick={sendReply} disabled={sendingReply || !replyDraft.trim()}>
                    {sendingReply ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                    {t("rev.reply")}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-border/50" onClick={() => markResolved(selectedReview.id)}>
                    <CheckCircle size={14} /> {t("rev.mark_resolved_btn")}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-border/50" onClick={saveNotes} disabled={savingNotes}>
                    {savingNotes ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    Save Notes
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reviews;
