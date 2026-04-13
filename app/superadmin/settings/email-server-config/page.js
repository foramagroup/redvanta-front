"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const serverOptions = [
  { value: "aws_smtp", label: "Amazon Web Service SMTP" },
  { value: "amazon_smtp", label: "Amazon SMTP" },
  { value: "aws_api", label: "Amazon Web Service API" },
  { value: "sendgrid_smtp", label: "SendGrid SMTP" },
  { value: "sendgrid_api", label: "SendGrid API" },
  { value: "mailgun_api", label: "Mailgun API" },
  { value: "mailgun_smtp", label: "Mailgun SMTP" },
  { value: "elasticemail_api", label: "ElasticEmail API" },
  { value: "elasticemail_smtp", label: "ElasticEmail SMTP" },
  { value: "sparkpost_api", label: "SparkPost API" },
  { value: "sparkpost_smtp", label: "SparkPost SMTP" },
  { value: "smtp", label: "SMTP" },
  { value: "email_server", label: "Email Server" },
  { value: "sendmail_unix", label: "Sendmail (UNIX)" },
  { value: "blastengine_smtp", label: "Blastengine SMTP" },
];

const smtpFields = [
  { key: "hostname", label: "Hostname", type: "text", placeholder: "smtp.example.com" },
  { key: "smtp_username", label: "SMTP Username", type: "text", placeholder: "username" },
  { key: "smtp_password", label: "SMTP Password", type: "password", placeholder: "********" },
  { key: "smtp_port", label: "SMTP Port", type: "text", placeholder: "587" },
  { key: "smtp_encryption", label: "SMTP Encryption Method", type: "text", placeholder: "TLS / SSL / STARTTLS" },
];

const apiFields = [
  { key: "api_key", label: "API Key", type: "text", placeholder: "Enter API key" },
  { key: "api_secret", label: "API Secret", type: "password", placeholder: "Enter API secret" },
];

const awsApiFields = [
  { key: "aws_access_key_id", label: "AWS Access Key ID", type: "text", placeholder: "Enter AWS access key ID" },
  { key: "aws_secret_key", label: "AWS Secret Key", type: "password", placeholder: "Enter AWS secret key" },
];

const defaultRegionOptions = [
  { value: "US", label: "US" },
  { value: "EU", label: "EU" },
  { value: "Global", label: "Global" },
];

const awsRegionOptions = [
  { value: "US East (Virginia)", label: "US East (Virginia)" },
  { value: "US East (Ohio)", label: "US East (Ohio)" },
  { value: "US West (N. California)", label: "US West (N. California)" },
  { value: "US West (Oregon)", label: "US West (Oregon)" },
  { value: "Asia Pacific (Mumbai)", label: "Asia Pacific (Mumbai)" },
];

const amazonSmtpFields = [
  { key: "aws_region", label: "AWS Region", type: "select", placeholder: "Select AWS region", options: awsRegionOptions },
  { key: "hostname", label: "Hostname", type: "text", placeholder: "smtp.example.com" },
  { key: "aws_access_key_id", label: "AWS Access Key ID", type: "text", placeholder: "Enter AWS access key ID" },
  { key: "aws_secret_key", label: "AWS Secret Key", type: "password", placeholder: "Enter AWS secret key" },
  { key: "smtp_username", label: "SMTP Username", type: "text", placeholder: "username" },
  { key: "smtp_password", label: "SMTP Password", type: "password", placeholder: "Enter SMTP password" },
  { key: "smtp_port", label: "SMTP Port", type: "number", placeholder: "587" },
  { key: "smtp_encryption", label: "SMTP encryption method", type: "text", placeholder: "TLS / SSL / STARTTLS" },
];

const serverFieldMap = {
  aws_smtp: smtpFields,
  amazon_smtp: amazonSmtpFields,
  aws_api: awsApiFields,
  sendgrid_smtp: [...apiFields, ...smtpFields],
  sendgrid_api: apiFields,
  mailgun_api: apiFields,
  mailgun_smtp: smtpFields,
  elasticemail_api: apiFields,
  elasticemail_smtp: smtpFields,
  sparkpost_api: apiFields,
  sparkpost_smtp: smtpFields,
  smtp: smtpFields,
  email_server: smtpFields,
  sendmail_unix: [{ key: "sendmail_path", label: "Sendmail Binary Path", type: "text", placeholder: "/usr/sbin/sendmail" }],
  blastengine_smtp: smtpFields,
};

const emptySettings = {
  failoverEnabled: true,
  failoverServer: "",
  retryAttempts: 3,
  maxPerMinute: 100,
  maxPerDay: 5000,
  globalDailyLimit: 100000,
};

const emptyForm = {
  value: "aws_smtp",
  region: "US",
  isDefault: false,
  config: {},
};

const getServerLabel = (value) => serverOptions.find((option) => option.value === value)?.label || value;
const getServerSid = (value) => (String(value).includes("api") ? "API" : "SMTP");

const EmailServerConfig = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [servers, setServers] = useState([]);
  const [settings, setSettings] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingServer, setSavingServer] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingServerId, setEditingServerId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadConfig = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/superadmin/email-server-config`, {
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load email server config");
      }

      setServers(Array.isArray(payload?.servers) ? payload.servers : []);
      setSettings({ ...emptySettings, ...(payload?.settings || {}) });
    } catch (err) {
      setError(err.message || "Failed to load email server config");
      setServers([]);
      setSettings(emptySettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const activeFields = serverFieldMap[form.value] || [];
  const isPlainSmtp = form.value === "smtp";
  const failoverOptions = servers.filter((server) => server.status === "Active");
  const activeServers = servers.filter((server) => server.status === "Active");
  const defaultServer = servers.find((server) => server.isDefault);

  const activeRegionOptions = useMemo(
    () => (form.value === "aws_api" || form.value === "amazon_smtp" ? awsRegionOptions : defaultRegionOptions),
    [form.value]
  );

  const openAddModal = () => {
    setEditingServerId(null);
    setForm({
      ...emptyForm,
      value: "aws_smtp",
      region: "US",
      isDefault: servers.length === 0,
      config: {},
    });
    setShowAdd(true);
  };

  const openEditModal = (server) => {
    setEditingServerId(server.id);
    setForm({
      value: server.value || "aws_smtp",
      region: server.region || "US",
      isDefault: Boolean(server.isDefault),
      config: server.config || {},
    });
    setShowAdd(true);
  };

  const onServerFieldChange = (key, value) => {
    setForm((current) => ({
      ...current,
      config: { ...current.config, [key]: value },
    }));
  };

  const handleSaveServer = async () => {
    setSavingServer(true);
    setError("");

    const body = {
      value: form.value,
      name: getServerLabel(form.value),
      region: form.region,
      sid: getServerSid(form.value),
      status: "Active",
      isDefault: form.isDefault,
      config: form.config,
    };

    try {
      const response = await fetch(`${apiBase}/superadmin/email-server-config${editingServerId ? `/${editingServerId}` : ""}`, {
        method: editingServerId ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || `Failed to ${editingServerId ? "update" : "create"} server`);
      }

      setShowAdd(false);
      setEditingServerId(null);
      setForm(emptyForm);
      await loadConfig();
      toast({ title: editingServerId ? t("sett.save_changes") : t("sa.smsapi_add_server") });
    } catch (err) {
      setError(err.message || `Failed to ${editingServerId ? "update" : "create"} server`);
    } finally {
      setSavingServer(false);
    }
  };

  const handleDeleteServer = async (serverId) => {
    setError("");

    try {
      const response = await fetch(`${apiBase}/superadmin/email-server-config/${serverId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete server");
      }

      setServers((current) => current.filter((server) => server.id !== serverId));
      toast({ title: t("sa.smsapi_delete") || "Server deleted" });
    } catch (err) {
      setError(err.message || "Failed to delete server");
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/superadmin/email-server-config/settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save email server settings");
      }

      setSettings({ ...emptySettings, ...payload });
      toast({ title: t("sa.smsapi_save") });
    } catch (err) {
      setError(err.message || "Failed to save email server settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <SuperAdminLayout title={t("sa.smsapi_title")} subtitle={t("sa.smsapi_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t("sa.smsapi_active_servers")}</p>
            <p className="text-2xl font-bold mt-1">{loading ? "--" : activeServers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t("sa.smsapi_default_server")}</p>
            <p className="text-2xl font-bold mt-1">{loading ? "--" : defaultServer?.name || "--"}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t("sa.smsapi_failover_enabled")}</p>
            <p className="text-2xl font-bold mt-1 text-primary">{loading ? "--" : settings.failoverEnabled ? t("sa.smsapi_yes") : "No"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50 mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("sa.smsapi_servers")}</CardTitle>
          <Button size="sm" onClick={openAddModal}><Plus size={14} className="mr-2" />{t("sa.smsapi_add_server")}</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.smsapi_server")}</TableHead><TableHead>{t("sa.smsapi_status")}</TableHead><TableHead>{t("sa.smsapi_api_key")}</TableHead>
                <TableHead>{t("sa.smsapi_region")}</TableHead><TableHead>{t("sa.smsapi_default")}</TableHead><TableHead>{t("sa.smsapi_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">Loading email servers...</TableCell></TableRow>
              ) : servers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">No email servers configured.</TableCell></TableRow>
              ) : servers.map((server) => (
                <TableRow key={server.id} className="border-border/50">
                  <TableCell className="font-medium">{server.name}</TableCell>
                  <TableCell><Badge variant={server.status === "Active" ? "default" : "secondary"}>{server.status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{server.sid}</TableCell>
                  <TableCell>{server.region}</TableCell>
                  <TableCell>{server.isDefault ? <Badge className="bg-primary/20 text-primary">Default</Badge> : "--"}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => toast({ title: "Test action not wired yet" })}><TestTube size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(server)}><Pencil size={14} /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteServer(server.id)}><Trash2 size={14} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.smsapi_failover_settings")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>{t("sa.smsapi_enable_failover")}</Label><p className="text-xs text-muted-foreground">{t("sa.smsapi_failover_desc")}</p></div>
              <Switch checked={settings.failoverEnabled} onCheckedChange={(value) => setSettings((current) => ({ ...current, failoverEnabled: value }))} />
            </div>
            <div>
              <Label>{t("sa.smsapi_failover_server")}</Label>
              <Select value={settings.failoverServer || ""} onValueChange={(value) => setSettings((current) => ({ ...current, failoverServer: value }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder="Select fallback server" /></SelectTrigger>
                <SelectContent>
                  {failoverOptions.map((server) => (
                    <SelectItem key={server.id} value={server.value}>{server.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("sa.smsapi_retry_attempts")}</Label>
              <Input type="number" value={settings.retryAttempts} onChange={(event) => setSettings((current) => ({ ...current, retryAttempts: parseInt(event.target.value, 10) || 0 }))} className="mt-1 bg-secondary border-border/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.smsapi_rate_limits")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{t("sa.smsapi_max_per_min")}</Label><Input type="number" value={settings.maxPerMinute} onChange={(event) => setSettings((current) => ({ ...current, maxPerMinute: parseInt(event.target.value, 10) || 0 }))} className="mt-1 bg-secondary border-border/50" /></div>
            <div><Label>{t("sa.smsapi_max_per_day")}</Label><Input type="number" value={settings.maxPerDay} onChange={(event) => setSettings((current) => ({ ...current, maxPerDay: parseInt(event.target.value, 10) || 0 }))} className="mt-1 bg-secondary border-border/50" /></div>
            <div><Label>{t("sa.smsapi_global_daily")}</Label><Input type="number" value={settings.globalDailyLimit} onChange={(event) => setSettings((current) => ({ ...current, globalDailyLimit: parseInt(event.target.value, 10) || 0 }))} className="mt-1 bg-secondary border-border/50" /></div>
          </CardContent>
        </Card>
      </div>

      <Button className="mt-6" onClick={handleSaveSettings} disabled={savingSettings}>{savingSettings ? "Saving..." : t("sa.smsapi_save")}</Button>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="!max-h-[42rem] !overflow-y-auto bg-card border-border/50 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingServerId ? `${t("sa.smsapi_server")} - Edit` : t("sa.smsapi_add_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("sa.smsapi_server")}</Label>
              <Select value={form.value} onValueChange={(value) => setForm((current) => ({ ...current, value }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.smsapi_select_server")} /></SelectTrigger>
                <SelectContent>
                  {serverOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {activeFields.map((field) => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                {field.type === "select" ? (
                  <Select value={form.config[field.key] || ""} onValueChange={(value) => onServerFieldChange(field.key, value)}>
                    <SelectTrigger className="mt-1 bg-secondary border-border/50">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options || []).map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type}
                    className="mt-1 bg-secondary border-border/50"
                    placeholder={field.placeholder}
                    value={form.config[field.key] || ""}
                    onChange={(event) => onServerFieldChange(field.key, event.target.value)}
                  />
                )}
              </div>
            ))}
            <div>
              <Label>{t("sa.smsapi_region")}</Label>
              <Select value={form.region} onValueChange={(value) => setForm((current) => ({ ...current, region: value }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.smsapi_select_region")} /></SelectTrigger>
                <SelectContent>
                  {activeRegionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isPlainSmtp ? (
              <div className="flex items-center justify-between">
                <Label>{t("sa.smsapi_set_default")}</Label><Switch checked={form.isDefault} onCheckedChange={(value) => setForm((current) => ({ ...current, isDefault: value }))} />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>{t("sa.smsapi_cancel")}</Button>
            <Button onClick={handleSaveServer} disabled={savingServer}>{savingServer ? "Saving..." : editingServerId ? t("sett.save_changes") : t("sa.smsapi_add_server")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default EmailServerConfig;
