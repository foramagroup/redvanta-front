"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const emptyAdmin = { name: "", email: "", roleId: "" };

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const SecurityPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);
  const [roles, setRoles] = useState([]);
  const [policy, setPolicy] = useState({
    enforce2FA: false,
    ipRestriction: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [error, setError] = useState("");
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [form, setForm] = useState(emptyAdmin);

  const loadSecurityData = async () => {
    setLoading(true);
    setError("");

    try {
      const [settingsRes, adminsRes] = await Promise.all([
        fetch(`${apiBase}/api/superadmin/security-settings`, {
          credentials: "include",
        }),
        fetch(`${apiBase}/api/superadmin/security-settings/admins`, {
          credentials: "include",
        }),
      ]);

      const settingsPayload = await settingsRes.json().catch(() => ({}));
      const adminsPayload = await adminsRes.json().catch(() => ({}));

      if (!settingsRes.ok) {
        throw new Error(settingsPayload?.message || "Failed to load security settings");
      }

      if (!adminsRes.ok) {
        throw new Error(adminsPayload?.message || "Failed to load admin users");
      }

      setRoles(Array.isArray(settingsPayload?.roles) ? settingsPayload.roles : []);
      setPolicy({
        enforce2FA: Boolean(settingsPayload?.policy?.enforce2FA),
        ipRestriction: settingsPayload?.policy?.ipRestriction || "",
      });
      setAdmins(Array.isArray(adminsPayload?.admins) ? adminsPayload.admins : []);
      setLoginActivity(Array.isArray(adminsPayload?.loginActivity) ? adminsPayload.loginActivity : []);
    } catch (err) {
      setError(err.message || "Failed to load security data");
      setRoles([]);
      setAdmins([]);
      setLoginActivity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const resetAdminForm = () => {
    setForm(emptyAdmin);
    setEditAdmin(null);
  };

  const openAdd = () => {
    resetAdminForm();
    setShowAddAdmin(true);
  };

  const openEdit = (admin) => {
    setForm({
      name: admin.name || "",
      email: admin.email || "",
      roleId: admin.roleId ? String(admin.roleId) : "",
    });
    setEditAdmin(admin);
  };

  const handleSavePolicy = async (nextPolicy = policy) => {
    setSavingPolicy(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/security-settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextPolicy),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to save security settings");
      }

      setPolicy({
        enforce2FA: Boolean(payload?.enforce2FA),
        ipRestriction: payload?.ipRestriction || "",
      });
      toast({ title: "Security settings updated" });
    } catch (err) {
      setError(err.message || "Failed to save security settings");
      throw err;
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleToggleEnforce2FA = async (checked) => {
    setPolicy((current) => ({
      ...current,
      enforce2FA: checked,
    }));
  };

  const handleSaveAdmin = async () => {
    setError("");

    if (!form.name || !form.email || !form.roleId) {
      setError("Please fill in admin name, email and role.");
      return;
    }

    setSavingAdmin(true);

    try {
      const isEditing = Boolean(editAdmin?.id);
      const res = await fetch(`${apiBase}/api/superadmin/security-settings/admins${isEditing ? `/${editAdmin.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          roleId: Number(form.roleId),
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} admin`);
      }

      if (isEditing) {
        setEditAdmin(null);
        toast({ title: "Admin updated" });
      } else {
        setShowAddAdmin(false);
        toast({ title: "Admin created" });
      }

      resetAdminForm();
      await loadSecurityData();
    } catch (err) {
      setError(err.message || `Failed to ${editAdmin ? "update" : "create"} admin`);
    } finally {
      setSavingAdmin(false);
    }
  };

  const AdminFormFields = () => (
    <div className="space-y-4">
      <div><Label>{t("sa.sec_full_name")}</Label><Input value={form.name} disabled={savingAdmin} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 bg-secondary border-border/50" placeholder={t("sa.sec_enter_name")} /></div>
      <div><Label>{t("sa.sec_email")}</Label><Input type="email" value={form.email} disabled={savingAdmin} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 bg-secondary border-border/50" placeholder="admin@opinoor.com" /></div>
      <div><Label>{t("sa.sec_role")}</Label>
        <Select value={form.roleId} disabled={savingAdmin} onValueChange={(v) => setForm({ ...form, roleId: v })}>
          <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.sec_select_role")} /></SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <SuperAdminLayout title={t("sa.sec_title")} subtitle={t("sa.sec_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="space-y-6 max-w-5xl">
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("sa.sec_admin_users")}</CardTitle>
            <Button size="sm" onClick={openAdd} disabled={loading}>
              <Plus size={14} className="mr-2" />
              {t("sa.sec_add_admin")}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>{t("sa.sec_col_name")}</TableHead><TableHead>{t("sa.sec_email")}</TableHead><TableHead>{t("sa.sec_role")}</TableHead>
                  <TableHead>{t("sa.sec_2fa")}</TableHead><TableHead>{t("sa.sec_last_login")}</TableHead><TableHead>{t("sa.sec_actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-border/50">
                    <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">Loading admins...</TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow className="border-border/50">
                    <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">No admin users found.</TableCell>
                  </TableRow>
                ) : admins.map((admin) => (
                  <TableRow key={admin.id || admin.email} className="border-border/50">
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell><Badge variant="outline" className="border-border/50">{admin.role || "-"}</Badge></TableCell>
                    <TableCell>{admin.twoFa ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{t("sa.sec_enabled")}</Badge> : <Badge className="bg-primary/10 text-primary border-primary/20">{t("sa.sec_disabled")}</Badge>}</TableCell>
                    <TableCell className="text-sm">{formatDate(admin.lastLogin)}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => openEdit(admin)}><Pencil size={14} /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("sa.sec_policies")}</CardTitle>
              <Button size="sm" onClick={() => handleSavePolicy()} disabled={loading || savingPolicy}>
                {savingPolicy ? "Saving..." : t("sa.sec_save")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><Label>{t("sa.sec_enforce_2fa")}</Label><p className="text-xs text-muted-foreground">{t("sa.sec_enforce_2fa_desc")}</p></div>
                <Switch checked={policy.enforce2FA} disabled={loading || savingPolicy} onCheckedChange={handleToggleEnforce2FA} />
              </div>
              <div>
                <Label>{t("sa.sec_ip_restriction")}</Label>
                <Input value={policy.ipRestriction} disabled={loading || savingPolicy} onChange={(e) => setPolicy((current) => ({ ...current, ipRestriction: e.target.value }))} placeholder={t("sa.sec_ip_placeholder")} className="mt-1 bg-secondary border-border/50" />
                <p className="text-xs text-muted-foreground mt-1">{t("sa.sec_ip_hint")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader><CardTitle className="text-base">{t("sa.sec_login_activity")}</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>{t("sa.sec_admin")}</TableHead><TableHead>{t("sa.sec_ip")}</TableHead><TableHead>{t("sa.sec_status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-border/50">
                      <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">Loading activity...</TableCell>
                    </TableRow>
                  ) : loginActivity.length === 0 ? (
                    <TableRow className="border-border/50">
                      <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">No login activity found.</TableCell>
                    </TableRow>
                  ) : loginActivity.map((activity, index) => (
                    <TableRow key={`${activity.admin}-${activity.time}-${index}`} className="border-border/50">
                      <TableCell>{activity.admin || "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{activity.ip || "-"}</TableCell>
                      <TableCell>
                        <Badge className={activity.status === "Success" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"}>
                          {activity.status === "Success" ? t("sa.sec_success") : t("sa.sec_failed")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.sec_add_admin_title")}</DialogTitle></DialogHeader>
          <AdminFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddAdmin(false); resetAdminForm(); }} disabled={savingAdmin}>{t("sa.sec_cancel")}</Button>
            <Button onClick={handleSaveAdmin} disabled={savingAdmin}>{savingAdmin ? "Saving..." : t("sa.sec_add_admin")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editAdmin} onOpenChange={() => { setEditAdmin(null); setForm(emptyAdmin); }}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.sec_edit_admin_title")}</DialogTitle></DialogHeader>
          <AdminFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditAdmin(null); setForm(emptyAdmin); }} disabled={savingAdmin}>{t("sa.sec_cancel")}</Button>
            <Button onClick={handleSaveAdmin} disabled={savingAdmin}>{savingAdmin ? "Saving..." : t("sa.sec_save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default SecurityPage;
