"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, TestTube, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function maskValue(value) {
  if (!value) return "-";
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 3)}***...${value.slice(-3)}`;
}

const SmsApiConfig = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [providers, setProviders] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingGlobals, setSavingGlobals] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    supplier_id: "",
    region_id: "",
    api_key: "",
    auth_token: "",
    phone_number: "",
    set_default: false,
    status: true,
  });
  const [globalSettings, setGlobalSettings] = useState({
    enableFailover: false,
    failoverProviderId: "",
    retryAttempts: 3,
    maxPerMinute: 100,
    maxPerDay: 5000,
    globalDailyLimit: 100000,
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      supplier_id: "",
      region_id: "",
      api_key: "",
      auth_token: "",
      phone_number: "",
      set_default: false,
      status: true,
    });
  };

  const loadProviders = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/sms-settings`, {
        credentials: "include",
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load SMS settings");
      }

      setProviders(Array.isArray(payload?.data) ? payload.data : []);
      setSupplierOptions(Array.isArray(payload?.options?.suppliers) ? payload.options.suppliers : []);
      setRegionOptions(Array.isArray(payload?.options?.regions) ? payload.options.regions : []);
      setGlobalSettings((current) => ({
        ...current,
        ...(payload?.settings || {}),
      }));
    } catch (err) {
      setError(err.message || "Failed to load SMS settings");
      setProviders([]);
      setSupplierOptions([]);
      setRegionOptions([]);
      setGlobalSettings({
        enableFailover: false,
        failoverProviderId: "",
        retryAttempts: 3,
        maxPerMinute: 100,
        maxPerDay: 5000,
        globalDailyLimit: 100000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/sms-settings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete SMS setting");
      }

      setProviders((current) => current.filter((item) => item.id !== id));
      toast({ title: "SMS provider deleted" });
    } catch (err) {
      setError(err.message || "Failed to delete SMS setting");
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = () => {
    resetForm();
    setShowAdd(true);
  };

  const openEdit = (provider) => {
    setEditingId(provider.id);
    setForm({
      supplier_id: String(provider.supplier_id ?? ""),
      region_id: String(provider.region_id ?? ""),
      api_key: provider.api_key || "",
      auth_token: provider.auth_token || "",
      phone_number: provider.phone_number || "",
      set_default: Boolean(provider.set_default),
      status: Boolean(provider.status),
    });
    setShowAdd(true);
  };

  const handleSave = async () => {
    setError("");

    if (!form.supplier_id || !form.region_id || !form.api_key || !form.phone_number) {
      setError("Please fill in supplier, region, API key and sender ID.");
      return;
    }

    setCreating(true);

    try {
      const isEditing = Boolean(editingId);
      const res = await fetch(`${apiBase}/superadmin/sms-settings${isEditing ? `/${editingId}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplier_id: Number(form.supplier_id),
          region_id: Number(form.region_id),
          api_key: form.api_key,
          auth_token: form.auth_token,
          phone_number: form.phone_number,
          set_default: form.set_default,
          status: form.status,
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} SMS setting`);
      }

      resetForm();
      setShowAdd(false);
      await loadProviders();
      toast({ title: isEditing ? "SMS provider updated" : "SMS provider created" });
    } catch (err) {
      setError(err.message || `Failed to ${editingId ? "update" : "create"} SMS setting`);
    } finally {
      setCreating(false);
    }
  };

  const activeProviders = providers.filter((item) => item.status).length;
  const defaultProvider = providers.find((item) => item.set_default);
  const failoverCandidates = providers.filter((item) => item.status && !item.set_default);

  const handleSaveGlobals = async () => {
    setError("");
    setSavingGlobals(true);

    try {
      const res = await fetch(`${apiBase}/superadmin/sms-settings/global-settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enableFailover: globalSettings.enableFailover,
          failoverProviderId: globalSettings.failoverProviderId,
          retryAttempts: Number(globalSettings.retryAttempts),
          maxPerMinute: Number(globalSettings.maxPerMinute),
          maxPerDay: Number(globalSettings.maxPerDay),
          globalDailyLimit: Number(globalSettings.globalDailyLimit),
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to save global SMS settings");
      }

      setGlobalSettings((current) => ({
        ...current,
        ...(payload?.data || {}),
      }));
      toast({ title: "SMS global settings updated" });
    } catch (err) {
      setError(err.message || "Failed to save global SMS settings");
    } finally {
      setSavingGlobals(false);
    }
  };

  return (
    <SuperAdminLayout title={t("sa.smsapi_title")} subtitle={t("sa.smsapi_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t("sa.smsapi_active_providers")}</p>
            <p className="mt-1 text-2xl font-bold">{loading ? "-" : activeProviders}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t("sa.smsapi_default_provider")}</p>
            <p className="mt-1 text-2xl font-bold">{loading ? "-" : defaultProvider?.supplier?.name || "-"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t("sa.smsapi_failover_enabled")}</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {loading ? "-" : globalSettings.enableFailover ? t("sa.smsapi_yes") : "No"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-border/50 bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("sa.smsapi_providers")}</CardTitle>
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} className="mr-2" />
            {t("sa.smsapi_add_provider")}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.smsapi_provider")}</TableHead>
                <TableHead>{t("sa.smsapi_status")}</TableHead>
                <TableHead>{t("sa.smsapi_api_key")}</TableHead>
                <TableHead>{t("sa.smsapi_region")}</TableHead>
                <TableHead>{t("sa.smsapi_default")}</TableHead>
                <TableHead>{t("sa.smsapi_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : providers.length === 0 ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No SMS providers configured yet.
                  </TableCell>
                </TableRow>
              ) : (
                providers.map((provider) => (
                  <TableRow key={provider.id} className="border-border/50">
                    <TableCell className="font-medium">{provider.supplier?.name || `#${provider.supplier_id}`}</TableCell>
                    <TableCell>
                      <Badge variant={provider.status ? "default" : "secondary"}>
                        {provider.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {maskValue(provider.api_key)}
                    </TableCell>
                    <TableCell>{provider.region?.name || `#${provider.region_id}`}</TableCell>
                    <TableCell>
                      {provider.set_default ? (
                        <Badge className="bg-primary/20 text-primary">Default</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          toast({
                            title: "Provider details",
                            description: `${provider.supplier?.name || "Provider"} ${provider.status ? "is active" : "is inactive"} in ${provider.region?.name || "unknown region"}.`,
                          })
                        }
                      >
                        <TestTube size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(provider)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={deletingId === provider.id}
                        onClick={() => handleDelete(provider.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-base">{t("sa.smsapi_failover_settings")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("sa.smsapi_enable_failover")}</Label>
                <p className="text-xs text-muted-foreground">{t("sa.smsapi_failover_desc")}</p>
              </div>
              <Switch
                checked={globalSettings.enableFailover}
                onCheckedChange={(checked) => setGlobalSettings((current) => ({ ...current, enableFailover: checked }))}
              />
            </div>
            <div>
              <Label>{t("sa.smsapi_failover_provider")}</Label>
              <Select
                value={globalSettings.failoverProviderId ? String(globalSettings.failoverProviderId) : ""}
                onValueChange={(value) => setGlobalSettings((current) => ({ ...current, failoverProviderId: value }))}
                disabled={!globalSettings.enableFailover}
              >
                <SelectTrigger className="mt-1 border-border/50 bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {failoverCandidates.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.supplier?.name || `#${item.supplier_id}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("sa.smsapi_retry_attempts")}</Label>
              <Input
                type="number"
                value={globalSettings.retryAttempts}
                onChange={(e) => setGlobalSettings((current) => ({ ...current, retryAttempts: e.target.value }))}
                className="mt-1 border-border/50 bg-secondary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-base">{t("sa.smsapi_rate_limits")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("sa.smsapi_max_per_min")}</Label>
              <Input
                type="number"
                value={globalSettings.maxPerMinute}
                onChange={(e) => setGlobalSettings((current) => ({ ...current, maxPerMinute: e.target.value }))}
                className="mt-1 border-border/50 bg-secondary"
              />
            </div>
            <div>
              <Label>{t("sa.smsapi_max_per_day")}</Label>
              <Input
                type="number"
                value={globalSettings.maxPerDay}
                onChange={(e) => setGlobalSettings((current) => ({ ...current, maxPerDay: e.target.value }))}
                className="mt-1 border-border/50 bg-secondary"
              />
            </div>
            <div>
              <Label>{t("sa.smsapi_global_daily")}</Label>
              <Input
                type="number"
                value={globalSettings.globalDailyLimit}
                onChange={(e) => setGlobalSettings((current) => ({ ...current, globalDailyLimit: e.target.value }))}
                className="mt-1 border-border/50 bg-secondary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="mt-6" onClick={handleSaveGlobals} disabled={savingGlobals}>
        {savingGlobals ? "Saving..." : t("sa.smsapi_save")}
      </Button>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="border-border/50 bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit SMS Provider" : t("sa.smsapi_add_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("sa.smsapi_provider")}</Label>
              <Select
                value={form.supplier_id}
                onValueChange={(value) => setForm((current) => ({ ...current, supplier_id: value }))}
              >
                <SelectTrigger className="mt-1 border-border/50 bg-secondary">
                  <SelectValue placeholder={t("sa.smsapi_select_provider")} />
                </SelectTrigger>
                <SelectContent>
                  {supplierOptions.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("sa.smsapi_region")}</Label>
              <Select
                value={form.region_id}
                onValueChange={(value) => setForm((current) => ({ ...current, region_id: value }))}
              >
                <SelectTrigger className="mt-1 border-border/50 bg-secondary">
                  <SelectValue placeholder={t("sa.smsapi_select_region")} />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((region) => (
                    <SelectItem key={region.id} value={String(region.id)}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("sa.smsapi_account_sid")}</Label>
              <Input
                className="mt-1 border-border/50 bg-secondary"
                placeholder={t("sa.smsapi_enter_api")}
                value={form.api_key}
                onChange={(e) => setForm((current) => ({ ...current, api_key: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t("sa.smsapi_auth_token")}</Label>
              <Input
                type="password"
                className="mt-1 border-border/50 bg-secondary"
                placeholder={t("sa.smsapi_enter_secret")}
                value={form.auth_token}
                onChange={(e) => setForm((current) => ({ ...current, auth_token: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t("sa.smsapi_sender_id")}</Label>
              <Input
                className="mt-1 border-border/50 bg-secondary"
                placeholder="+1234567890"
                value={form.phone_number}
                onChange={(e) => setForm((current) => ({ ...current, phone_number: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("sa.smsapi_set_default")}</Label>
              <Switch
                checked={form.set_default}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, set_default: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("sa.smsapi_status")}</Label>
              <Switch
                checked={form.status}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, status: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdd(false);
                resetForm();
              }}
            >
              {t("sa.smsapi_cancel")}
            </Button>
            <Button onClick={handleSave} disabled={creating}>
              {creating ? "Saving..." : editingId ? "Save changes" : t("sa.smsapi_add_provider")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default SmsApiConfig;
