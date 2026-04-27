"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Star, ArrowRight, Mail, Eye, Save, TestTube, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

// ─── Config API ───────────────────────────────────────────────
const API_BASE  = `${process.env.NEXT_PUBLIC_API_URL || ""}/admin/filtering`;
const TEAM_API  = `${process.env.NEXT_PUBLIC_API_URL || ""}/admin/team`;

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error(`Server error (${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data;
}

// ─────────────────────────────────────────────────────────────
const Filtering = () => {
  const { t } = useLanguage();

  // ── State config ───────────────────────────────────────────
  const [threshold,         setThreshold]         = useState([4]);
  const [redirectPlatform,  setRedirectPlatform]  = useState("google");
  const [customUrl,         setCustomUrl]          = useState("");
  const [assignedUserId,    setAssignedUserId]     = useState("");
  const [autoEmail,         setAutoEmail]          = useState(true);
  const [autoEmailAddress,  setAutoEmailAddress]   = useState("");
  const [autoResponseMsg,   setAutoResponseMsg]    = useState(
    "Thank you for your feedback. We take every comment seriously and will address your concerns within 24 hours. Your experience matters to us."
  );

  // ── State UI ───────────────────────────────────────────────
  const [teamMembers,  setTeamMembers]  = useState([]);
  const [showPreview,  setShowPreview]  = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [testing,      setTesting]      = useState(false);
  const [testResult,   setTestResult]   = useState(null);   // résultat du dernier test
  const [isDirty,      setIsDirty]      = useState(false);  // config modifiée mais non sauvegardée

  // ─── Charger la config + l'équipe depuis Team API ────────────
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [configData, teamData] = await Promise.all([
        apiFetch(`${API_BASE}/config`),
        apiFetch(`${TEAM_API}/`),           // ← GET /api/admin/team (même source que la vue Team)
      ]);

      const cfg = configData.data;
      setThreshold([cfg.threshold ?? 4]);
      setRedirectPlatform(cfg.redirectPlatform ?? "google");
      setCustomUrl(cfg.customUrl ?? "");
      setAssignedUserId(cfg.assignedUserId ? String(cfg.assignedUserId) : "");
      setAutoEmail(cfg.autoEmailEnabled ?? true);
      setAutoEmailAddress(cfg.autoEmailAddress ?? "");
      setAutoResponseMsg(cfg.autoResponseMessage ?? "");
      // teamData.data = membres formatés par Team.controller (id, name, email, isOwner, role...)
      setTeamMembers(teamData.data || []);
      setIsDirty(false);
    } catch (err) {
      toast.error(err.message || "Failed to load filtering config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // ─── Marquer comme modifié à chaque changement ────────────
  const markDirty = () => setIsDirty(true);

  // ─── Sauvegarder ──────────────────────────────────────────
  const handleSave = async () => {
    if (redirectPlatform === "custom" && !customUrl.trim()) {
      toast.error("Please enter a custom redirect URL");
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`${API_BASE}/config`, {
        method: "PUT",
        body: JSON.stringify({
          threshold:           threshold[0],
          redirectPlatform,
          customUrl:           redirectPlatform === "custom" ? customUrl.trim() : undefined,
          assignedUserId:      assignedUserId ? parseInt(assignedUserId) : null,
          autoEmailEnabled:    autoEmail,
          autoEmailAddress:    autoEmailAddress.trim() || null,
          autoResponseMessage: autoResponseMsg.trim()  || null,
        }),
      });
      toast.success("Filtering configuration saved!");
      setIsDirty(false);
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ─── Test du filtrage ──────────────────────────────────────
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // On teste avec la valeur du slider actuel
      const data = await apiFetch(`${API_BASE}/test`, {
        method: "POST",
        body:   JSON.stringify({ rating: threshold[0] }),
      });
      setTestResult(data.data);
      toast.success(`Test completed — rating ${threshold[0]} → ${data.data.route}`);
    } catch (err) {
      toast.error(err.message || "Test failed");
    } finally {
      setTesting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  const redirectOptions = [
    { id: "google",   labelKey: "filt.google_business", descKey: "filt.redirect_google"   },
    { id: "facebook", labelKey: "filt.facebook",        descKey: "filt.redirect_facebook"  },
    { id: "custom",   labelKey: "filt.custom_url",      descKey: "filt.redirect_custom"    },
  ];

  if (loading) {
    return (
      <DashboardLayout title={t("filt.title")} subtitle={t("filt.subtitle")}>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="text-sm">Loading configuration…</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t("filt.title")}
      subtitle={t("filt.subtitle")}
      headerAction={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/50"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={16} /> {t("filt.preview_exp")}
          </Button>
          <Button
            size="sm"
            className="gap-2 glow-red-hover"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? <Loader2 size={16} className="animate-spin" />
              : <Save size={16} />
            }
            {t("filt.save_config")}
            {isDirty && <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 inline-block" />}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Rating Threshold ──────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="rounded-xl border border-border/50 bg-gradient-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">{t("filt.rating_threshold")}</h3>
              <p className="text-xs text-muted-foreground">{t("filt.rating_desc")}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{t("filt.threshold")}</span>
              <span className="font-display text-2xl font-bold text-primary">{threshold[0]}+ ⭐</span>
            </div>
            <Slider
              value={threshold}
              onValueChange={(v) => { setThreshold(v); markDirty(); setTestResult(null); }}
              min={1} max={5} step={1}
              className="mb-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 {t("filt.star")}</span>
              <span>5 {t("filt.stars")}</span>
            </div>
          </div>

          {/* Preview public/privé selon le threshold */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < threshold[0] ? "text-primary fill-primary" : "text-muted"} />
                ))}
              </div>
              <ArrowRight size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">{t("filt.public_platform")}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < threshold[0] - 1 ? "text-amber-400 fill-amber-400" : "text-muted"} />
                ))}
              </div>
              <ArrowRight size={14} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">{t("filt.private_form")}</span>
            </div>
          </div>

          {/* Résultat du dernier test */}
          {testResult && (
            <div className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
              testResult.route === "public"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}>
              <CheckCircle size={14} className="mt-0.5 shrink-0" />
              <span>
                {testResult.route === "public"
                  ? testResult.public?.message
                  : testResult.private?.message
                }
              </span>
            </div>
          )}
        </motion.div>

        {/* ── Redirect Platform ─────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className="rounded-xl border border-border/50 bg-gradient-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">{t("filt.redirect_config")}</h3>
              <p className="text-xs text-muted-foreground">{t("filt.redirect_desc")}</p>
            </div>
          </div>

          <div className="space-y-3">
            {redirectOptions.map((p) => (
              <button
                key={p.id}
                onClick={() => { setRedirectPlatform(p.id); markDirty(); }}
                className={`w-full flex items-center gap-3 rounded-lg p-4 text-left transition-colors border ${
                  redirectPlatform === p.id
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-secondary/30 hover:bg-secondary/60"
                }`}
              >
                <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                  redirectPlatform === p.id ? "border-primary bg-primary" : "border-muted-foreground"
                }`} />
                <div>
                  <span className="text-sm font-medium">{t(p.labelKey)}</span>
                  <p className="text-xs text-muted-foreground">{t(p.descKey)}</p>
                </div>
              </button>
            ))}
          </div>

          {redirectPlatform === "custom" && (
            <Input
              className="mt-3 bg-secondary/50 border-border/50"
              placeholder="https://your-review-page.com"
              value={customUrl}
              onChange={(e) => { setCustomUrl(e.target.value); markDirty(); }}
            />
          )}
        </motion.div>

        {/* ── Private Feedback Handling ─────────────────────── */}
        <motion.div
          variants={fadeUp}
          custom={2}
          className="lg:col-span-2 rounded-xl border border-border/50 bg-gradient-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">{t("filt.private_handling")}</h3>
              <p className="text-xs text-muted-foreground">{t("filt.private_desc")}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Membre assigné */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{t("filt.assign_team")}</label>
              <select
                value={assignedUserId}
                onChange={(e) => { setAssignedUserId(e.target.value); markDirty(); }}
                className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">— Auto-assign by location —</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name}{m.isOwner ? " (Owner)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle auto email + adresse */}
            <div>
              <label className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                {t("filt.auto_email")}
                <button
                  onClick={() => { setAutoEmail(!autoEmail); markDirty(); }}
                  className={`relative w-10 h-5 rounded-full transition-colors ${autoEmail ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${autoEmail ? "left-5" : "left-0.5"}`} />
                </button>
              </label>
              <Input
                className="bg-secondary/50 border-border/50"
                type="email"
                placeholder="manager@company.com"
                value={autoEmailAddress}
                disabled={!autoEmail}
                onChange={(e) => { setAutoEmailAddress(e.target.value); markDirty(); }}
              />
            </div>

            {/* Message de réponse automatique */}
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block">{t("filt.auto_response")}</label>
              <textarea
                className="w-full rounded-lg border border-border/50 bg-secondary/50 p-3 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                value={autoResponseMsg}
                onChange={(e) => { setAutoResponseMsg(e.target.value); markDirty(); }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/50"
              onClick={handleTest}
              disabled={testing}
            >
              {testing
                ? <Loader2 size={14} className="animate-spin" />
                : <TestTube size={14} />
              }
              {t("filt.test_filtering")}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ── Modal Preview ────────────────────────────────────── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm mx-4 rounded-xl border border-border/50 bg-card p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h3 className="font-display font-semibold text-lg mb-2">{t("filt.preview_title")}</h3>
            <p className="text-xs text-muted-foreground mb-6">{t("filt.preview_desc")}</p>
            <div className="rounded-lg bg-secondary/50 p-6 mb-4">
              <p className="text-sm mb-4">{t("filt.how_was")}</p>
              <div className="flex justify-center gap-2 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={28}
                    className={i < threshold[0] ? "text-primary fill-primary" : "text-muted cursor-pointer hover:text-primary"}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {threshold[0]}+ {t("filt.stars_redirect")}{" "}
                {redirectPlatform === "google"
                  ? "Google"
                  : redirectPlatform === "facebook"
                  ? "Facebook"
                  : "custom URL"}
              </p>
            </div>
            <Button onClick={() => setShowPreview(false)} className="w-full">
              {t("filt.close_preview")}
            </Button>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Filtering;