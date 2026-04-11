"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Activity, Search, X, Calendar, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalyticsEvents } from "@/hooks/useAnalyticsEvents";

const eventTypes = [
  "All",
  "SCAN",
  "PAGE_VIEW",
  "RATING_SELECTED",
  "GOOGLE_REDIRECT",
  "FEEDBACK_SUBMITTED"
];

const statuses = ["All", "Success", "Failed"];

const statusStyles = {
  Success: { bg: "bg-emerald-400/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Failed: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

const EventLogs = () => {
  const { t } = useLanguage();
  const {
    events,
    stats,
    loading,
    pagination,
    filters,
    updateFilters,
    changePage
  } = useAnalyticsEvents();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (loading && events.length === 0) {
    return (
      <DashboardLayout title={t("evlog.title")} subtitle={t("evlog.subtitle")}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("evlog.title")} subtitle={t("evlog.subtitle")}>
      {/* Stats rapides */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-border/50 bg-gradient-card p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Scans</div>
            <div className="text-2xl font-bold">{stats.totalScans}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-gradient-card p-4">
            <div className="text-xs text-muted-foreground mb-1">Page Views</div>
            <div className="text-2xl font-bold">{stats.totalPageViews}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-gradient-card p-4">
            <div className="text-xs text-muted-foreground mb-1">Positive Reviews</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.positiveRatings}</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-gradient-card p-4">
            <div className="text-xs text-muted-foreground mb-1">Feedbacks</div>
            <div className="text-2xl font-bold">{stats.totalFeedbacks}</div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10 bg-secondary/50 border-border/50"
            placeholder={t("evlog.search")}
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        <select
          value={filters.type}
          onChange={(e) => updateFilters({ type: e.target.value })}
          className="h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm text-foreground"
        >
          {eventTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
          className="h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm text-foreground"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/50 h-10"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar size={14} />
            {filters.startDate && filters.endDate
              ? `${filters.startDate} – ${filters.endDate}`
              : t("evlog.date_range")}
          </Button>

          {showDatePicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
              <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-border/50 bg-card shadow-xl z-50 p-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {t("evlog.start_date")}
                    </label>
                    <Input
                      type="date"
                      className="bg-secondary/50 border-border/50"
                      value={filters.startDate}
                      onChange={(e) => updateFilters({ startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {t("evlog.end_date")}
                    </label>
                    <Input
                      type="date"
                      className="bg-secondary/50 border-border/50"
                      value={filters.endDate}
                      onChange={(e) => updateFilters({ endDate: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => setShowDatePicker(false)}>
                      {t("evlog.apply")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border/50"
                      onClick={() => {
                        updateFilters({ startDate: '', endDate: '' });
                        setShowDatePicker(false);
                      }}
                    >
                      {t("evlog.clear")}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <div className="flex gap-6">
        <motion.div
          variants={fadeUp}
          custom={1}
          className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden flex-1 min-w-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {[
                    t("evlog.timestamp"),
                    t("evlog.event"),
                    t("evlog.source"),
                    t("evlog.location"),
                    t("evlog.status")
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => {
                  const s = statusStyles[ev.status];
                  return (
                    <tr
                      key={ev.id}
                      className={`border-b border-border/30 hover:bg-secondary/20 transition-colors cursor-pointer ${
                        selectedEvent?.id === ev.id ? "bg-secondary/30" : ""
                      }`}
                      onClick={() => setSelectedEvent(ev)}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {ev.timestamp}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono text-primary">{ev.name}</code>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{ev.source}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{ev.location}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <div className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => changePage(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => changePage(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden flex-shrink-0 hidden lg:block"
            >
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    <h3 className="font-display font-semibold text-sm">
                      {t("evlog.event_details")}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                      {t("evlog.event")}
                    </span>
                    <code className="text-sm font-mono text-primary">{selectedEvent.name}</code>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        {t("evlog.timestamp")}
                      </span>
                      <span className="text-xs">{selectedEvent.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        {t("evlog.status")}
                      </span>
                      <Badge
                        variant={selectedEvent.status === "Success" ? "default" : "destructive"}
                        className="text-[10px]"
                      >
                        {selectedEvent.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        {t("evlog.source")}
                      </span>
                      <span className="text-xs">{selectedEvent.source}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        {t("evlog.location")}
                      </span>
                      <span className="text-xs">{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("evlog.payload")}
                  </span>
                  <pre className="rounded-lg bg-secondary/50 border border-border/30 p-4 overflow-x-auto">
                    <code className="text-[11px] font-mono text-muted-foreground whitespace-pre">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};
export default EventLogs;