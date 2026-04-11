"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Plus, Shield, Eye, MapPin, MoreHorizontal, X, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const roleColors = { Admin: "bg-primary/20 text-primary", Manager: "bg-blue-500/20 text-blue-400", Viewer: "bg-secondary text-muted-foreground" };

const members = [
  { id: 1, name: "John Anderson", email: "john@opinoor.com", role: "Admin", locations: "All", status: "Active", lastLogin: "2 min ago", avatar: "JA" },
  { id: 2, name: "Sarah Williams", email: "sarah@opinoor.com", role: "Manager", locations: "Downtown, Midtown", status: "Active", lastLogin: "1 hr ago", avatar: "SW" },
  { id: 3, name: "Mike Chen", email: "mike@opinoor.com", role: "Manager", locations: "Westside", status: "Active", lastLogin: "3 hrs ago", avatar: "MC" },
  { id: 4, name: "Emily Davis", email: "emily@opinoor.com", role: "Viewer", locations: "Downtown", status: "Active", lastLogin: "1 day ago", avatar: "ED" },
  { id: 5, name: "Tom Wilson", email: "tom@opinoor.com", role: "Viewer", locations: "Midtown", status: "Inactive", lastLogin: "2 weeks ago", avatar: "TW" },
];

const Team = () => {
  const { t } = useLanguage();
  const [showInvite, setShowInvite] = useState(false);
  const [showActivity, setShowActivity] = useState(null);

  return (
    <DashboardLayout title={t("team.title")} subtitle={t("team.subtitle")}
      headerAction={<Button size="sm" className="gap-2 glow-red-hover" onClick={() => setShowInvite(true)}><Plus size={16} /> {t("team.invite")}</Button>}
    >
      <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("team.member")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("team.role")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t("team.locations")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("team.status")}</th>
                <th className="p-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t("team.last_login")}</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{m.avatar}</div>
                      <div><span className="text-sm font-medium block">{m.name}</span><span className="text-xs text-muted-foreground">{m.email}</span></div>
                    </div>
                  </td>
                  <td className="p-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[m.role]}`}>{m.role}</span></td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{m.locations}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs ${m.status === "Active" ? "text-emerald-400" : "text-muted-foreground"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.status === "Active" ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                      {m.status === "Active" ? t("team.active") : t("team.inactive")}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell"><div className="flex items-center gap-1"><Clock size={12} /> {m.lastLogin}</div></td>
                  <td className="p-4"><button onClick={() => setShowActivity(m.id)} className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowInvite(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">{t("team.invite_title")}</h3>
              <button onClick={() => setShowInvite(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("team.email")}</label><Input className="bg-secondary/50 border-border/50" placeholder="team@company.com" type="email" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("team.full_name")}</label><Input className="bg-secondary/50 border-border/50" placeholder="Jane Doe" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("team.role")}</label>
                <select className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Viewer</option><option>Manager</option><option>Admin</option>
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("team.assign_locations")}</label>
                <div className="flex flex-wrap gap-2">
                  {["Downtown", "Midtown", "Westside"].map((loc) => (
                    <button key={loc} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"><MapPin size={12} /> {loc}</button>
                  ))}
                </div>
              </div>
              <Button className="w-full glow-red-hover">{t("team.send_invitation")}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowActivity(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg">{t("team.activity_log")}</h3>
              <button onClick={() => setShowActivity(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {[
                { action: "Replied to review from Sarah M.", time: "2 hrs ago" },
                { action: "Updated location settings for Downtown", time: "5 hrs ago" },
                { action: "Sent bulk review request (15 contacts)", time: "1 day ago" },
                { action: "Logged in", time: "1 day ago" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/30 p-3">
                  <Activity size={14} className="text-primary mt-0.5" />
                  <div><p className="text-sm">{log.action}</p><span className="text-xs text-muted-foreground">{log.time}</span></div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" size="sm" className="flex-1 border-border/50">{t("team.change_role")}</Button>
              <Button variant="destructive" size="sm" className="flex-1">{t("team.deactivate")}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Team;
