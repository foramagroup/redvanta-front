"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users, Plus, MapPin, MoreHorizontal, X,
  Clock, Activity, Loader2, Trash2, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

// ─── Config API ───────────────────────────────────────────────
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ""}/admin/team`;

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

// ─── Helpers ──────────────────────────────────────────────────
const ROLE_COLORS = {
  Admin:   "bg-primary/20 text-primary",
  Manager: "bg-blue-500/20 text-blue-400",
  Viewer:  "bg-secondary text-muted-foreground",
};

function timeAgo(dateStr) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / (7 * 86400000));
  if (mins < 2)   return "Just now";
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  if (days < 7)   return `${days} day${days > 1 ? "s" : ""} ago`;
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

// ─────────────────────────────────────────────────────────────
const Team = () => {
  const { t } = useLanguage();

  // ── Data ───────────────────────────────────────────────────
  const [members,      setMembers]      = useState([]);
  const [locations,    setLocations]    = useState([]);   // pour les checkboxes du modal
  const [roles,        setRoles]        = useState([]);   // depuis GET /team/roles
  const [activity,     setActivity]     = useState([]);   // pour le modal d'activité
  const [loading,      setLoading]      = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);

  // ── Modals ─────────────────────────────────────────────────
  const [showInvite,   setShowInvite]   = useState(false);
  const [showActivity, setShowActivity] = useState(null); // member object | null

  // ── Formulaire invite ──────────────────────────────────────
  const [inviteEmail,    setInviteEmail]    = useState("");
  const [inviteName,     setInviteName]     = useState("");
  const [inviteRole,     setInviteRole]     = useState("Viewer");
  const [inviteLocIds,   setInviteLocIds]   = useState([]); // Int[]
  const [inviting,       setInviting]       = useState(false);

  // ── Actions membres ────────────────────────────────────────
  const [actionId,     setActionId]     = useState(null);

  // ─── Charger les membres ───────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const [membersData, locsData, rolesData] = await Promise.all([
        apiFetch(`${API_BASE}/`),
        apiFetch(`${API_BASE}/locations`),
        apiFetch(`${API_BASE}/roles`),
      ]);
      setMembers(membersData.data || []);
      setLocations(locsData.data || []);
      setRoles(rolesData.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ─── Ouvrir modal activité ─────────────────────────────────
  const openActivity = async (member) => {
    setShowActivity(member);
    setActivity([]);
    setActivityLoading(true);
    try {
      const data = await apiFetch(`${API_BASE}/${member.id}/activity`);
      setActivity(data.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load activity");
    } finally {
      setActivityLoading(false);
    }
  };

  // ─── Toggle location dans l'invite ────────────────────────
  const toggleInviteLoc = (id) => {
    setInviteLocIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ─── Réinitialiser le formulaire d'invite ─────────────────
  const resetInvite = () => {
    setInviteEmail("");
    setInviteName("");
    setInviteRole("Viewer");
    setInviteLocIds([]);
  };

  // ─── Envoyer l'invitation ──────────────────────────────────
  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast.error("Email is required"); return; }
    if (!inviteName.trim())  { toast.error("Full name is required"); return; }

    setInviting(true);
    try {
      const data = await apiFetch(`${API_BASE}/invite`, {
        method: "POST",
        body:   JSON.stringify({
          email:       inviteEmail.trim(),
          name:        inviteName.trim(),
          roleName:    inviteRole,
          locationIds: inviteLocIds,
        }),
      });
      toast.success(data.message || "Invitation sent!");
      setShowInvite(false);
      resetInvite();
      fetchMembers();
    } catch (err) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  // ─── Changer le rôle ──────────────────────────────────────
  const handleChangeRole = async (memberId, newRole) => {
    setActionId(memberId);
    try {
      await apiFetch(`${API_BASE}/${memberId}/role`, {
        method: "PUT",
        body:   JSON.stringify({ roleName: newRole }),
      });
      toast.success(`Role updated to ${newRole}`);
      setShowActivity(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.message || "Failed to change role");
    } finally {
      setActionId(null);
    }
  };

  // ─── Activer / Désactiver ──────────────────────────────────
  const handleToggleStatus = async (member) => {
    const activate = member.status === "Inactive";
    setActionId(member.id);
    try {
      const data = await apiFetch(`${API_BASE}/${member.id}/status`, {
        method: "PUT",
        body:   JSON.stringify({ active: activate }),
      });
      toast.success(data.message);
      setShowActivity(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  // ─── Retirer un membre ────────────────────────────────────
  const handleRemove = async (memberId) => {
    if (!confirm("Remove this member from the company?")) return;
    setActionId(memberId);
    try {
      await apiFetch(`${API_BASE}/${memberId}`, { method: "DELETE" });
      toast.success("Member removed");
      setShowActivity(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.message || "Failed to remove member");
    } finally {
      setActionId(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title={t("team.title")}
      subtitle={t("team.subtitle")}
      headerAction={
        <Button
          size="sm"
          className="gap-2 glow-red-hover"
          onClick={() => setShowInvite(true)}
        >
          <Plus size={16} /> {t("team.invite")}
        </Button>
      }
    >
      {/* ── Table membres ──────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        custom={0}
        className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 size={22} className="animate-spin mr-2" />
            <span className="text-sm">Loading team…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("team.member")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("team.role")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t("team.locations")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("team.status")}</th>
                  <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("team.last_login")}</th>
                  <th className="p-4 w-10" />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                    {/* Membre */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {m.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium block truncate">{m.name || m.email}</span>
                          <span className="text-xs text-muted-foreground truncate">{m.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Rôle */}
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[m.role] ?? ROLE_COLORS.Viewer}`}>
                        {m.isOwner ? "Owner" : m.role}
                      </span>
                    </td>

                    {/* Locations */}
                    <td className="p-4 text-sm text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                      {typeof m.locations === "string" ? m.locations : m.locationNames}
                    </td>

                    {/* Statut */}
                    <td className="p-4 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs ${m.status === "Active" ? "text-emerald-400" : "text-muted-foreground"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === "Active" ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                        {m.status === "Active" ? t("team.active") : t("team.inactive")}
                      </span>
                    </td>

                    {/* Dernière connexion */}
                    <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(m.lastLogin)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <button
                        onClick={() => openActivity(m)}
                        disabled={actionId === m.id}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                      >
                        {actionId === m.id
                          ? <Loader2 size={16} className="animate-spin" />
                          : <MoreHorizontal size={16} />
                        }
                      </button>
                    </td>
                  </tr>
                ))}

                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      No team members yet. Invite someone!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Modal : Invite ─────────────────────────────────── */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => { setShowInvite(false); resetInvite(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">{t("team.invite_title")}</h3>
              <button onClick={() => { setShowInvite(false); resetInvite(); }} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("team.email")}</label>
                <Input
                  className="bg-secondary/50 border-border/50"
                  type="email"
                  placeholder="team@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              {/* Nom */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("team.full_name")}</label>
                <Input
                  className="bg-secondary/50 border-border/50"
                  placeholder="Jane Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>

              {/* Rôle */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">{t("team.role")}</label>
                <select
                  className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  {roles.length > 0
                    ? roles.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))
                    : (
                        <>
                          <option value="Viewer">Viewer</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                        </>
                      )
                  }
                </select>
              </div>

              {/* Locations */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  {t("team.assign_locations")}
                  <span className="ml-1 opacity-60">(none = all access)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => {
                    const selected = inviteLocIds.includes(loc.id);
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => toggleInviteLoc(loc.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                        }`}
                      >
                        <MapPin size={12} /> {loc.name}
                      </button>
                    );
                  })}
                  {locations.length === 0 && (
                    <p className="text-xs text-muted-foreground">No locations configured yet.</p>
                  )}
                </div>
              </div>

              <Button
                className="w-full glow-red-hover gap-2"
                onClick={handleInvite}
                disabled={inviting}
              >
                {inviting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {t("team.send_invitation")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modal : Activity Log ──────────────────────────── */}
      {showActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowActivity(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-lg">{t("team.activity_log")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {showActivity.name || showActivity.email} · {showActivity.role}
                </p>
              </div>
              <button onClick={() => setShowActivity(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Logs */}
            <div className="space-y-2 max-h-64 overflow-y-auto mb-5">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 size={18} className="animate-spin mr-2" />
                  <span className="text-xs">Loading…</span>
                </div>
              ) : activity.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No activity found.</p>
              ) : (
                activity.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/30 p-3">
                    <Activity size={14} className="text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{log.action}</p>
                      <span className="text-xs text-muted-foreground">{timeAgo(log.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions — masquées pour le propriétaire */}
            {!showActivity.isOwner && (
              <div className="flex gap-2">
                {/* Changer le rôle (cycle Viewer → Manager → Admin) */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border/50 gap-1"
                  disabled={actionId === showActivity.id}
                  onClick={() => {
                    const next = showActivity.role === "Viewer" ? "Manager" : showActivity.role === "Manager" ? "Admin" : "Viewer";
                    handleChangeRole(showActivity.id, next);
                  }}
                >
                  <ShieldCheck size={14} />
                  {t("team.change_role")}
                </Button>

                {/* Activer / Désactiver */}
                <Button
                  variant={showActivity.status === "Active" ? "destructive" : "outline"}
                  size="sm"
                  className="flex-1 gap-1"
                  disabled={actionId === showActivity.id}
                  onClick={() => handleToggleStatus(showActivity)}
                >
                  {actionId === showActivity.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : null
                  }
                  {showActivity.status === "Active" ? t("team.deactivate") : t("team.activate")}
                </Button>

                {/* Retirer */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-muted-foreground hover:text-destructive"
                  disabled={actionId === showActivity.id}
                  onClick={() => handleRemove(showActivity.id)}
                  title="Remove from company"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Team;