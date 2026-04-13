"use client";

import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, RotateCcw, Eye, Webhook, Activity, CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const eventTypes = [
  "account.created", "account.updated", "account.deleted",
  "subscription.created", "subscription.updated", "subscription.cancelled",
  "invoice.created", "invoice.paid", "invoice.failed",
  "review.received", "review.responded",
  "user.login", "user.signup",
  "sms.sent", "sms.failed",
];

const emptyForm = { name: "", url: "", events: [], active: true, retryEnabled: true, maxRetries: 3 };

const normalizeWebhook = (webhook) => ({
  ...webhook,
  events: Array.isArray(webhook.events) ? webhook.events : [],
  successRate: Number(webhook.successRate || 0),
  lastTriggered: webhook.lastTriggered || "Never",
});

const Webhooks = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadWebhooks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/superadmin/webhooks-settings`, {
        credentials: "include",
      });
      const payload = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load webhooks");
      }

      setWebhooks(Array.isArray(payload) ? payload.map(normalizeWebhook) : []);
    } catch (err) {
      setError(err.message || "Failed to load webhooks");
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (webhook) => {
    setEditing(webhook);
    setForm({
      name: webhook.name,
      url: webhook.url,
      events: [...webhook.events],
      active: Boolean(webhook.active),
      retryEnabled: Boolean(webhook.retryEnabled),
      maxRetries: webhook.maxRetries || 3,
    });
    setDialogOpen(true);
  };

  const toggleEvent = (event) => {
    setForm((current) => ({
      ...current,
      events: current.events.includes(event)
        ? current.events.filter((item) => item !== event)
        : [...current.events, event],
    }));
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const isEditing = Boolean(editing?.id);
      const response = await fetch(`${apiBase}/superadmin/webhooks-settings${isEditing ? `/${editing.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || `Failed to ${isEditing ? "update" : "create"} webhook`);
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadWebhooks();
      toast({ title: isEditing ? t("sa.wh_updated_toast") : t("sa.wh_created_toast") });
    } catch (err) {
      setError(err.message || `Failed to ${editing ? "update" : "create"} webhook`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (webhook) => {
    setError("");

    try {
      const response = await fetch(`${apiBase}/superadmin/webhooks-settings/${webhook.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete webhook");
      }

      setWebhooks((current) => current.filter((item) => item.id !== webhook.id));
      toast({ title: t("sa.wh_delete") });
    } catch (err) {
      setError(err.message || "Failed to delete webhook");
    }
  };

  const metrics = useMemo(() => ({
    total: webhooks.length,
    active: webhooks.filter((item) => item.active).length,
    avgSuccess: webhooks.length ? (webhooks.reduce((sum, item) => sum + item.successRate, 0) / webhooks.length).toFixed(1) : "0.0",
  }), [webhooks]);

  return (
    <SuperAdminLayout title={t("sa.wh_title")} subtitle={t("sa.wh_subtitle")} headerAction={<Button onClick={openCreate}><Plus size={16} className="mr-1" /> {t("sa.wh_add")}</Button>}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-border/50 bg-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Webhook size={20} className="text-primary" /></div>
          <div><p className="text-2xl font-bold">{metrics.total}</p><p className="text-xs text-muted-foreground">{t("sa.wh_total")}</p></div>
        </CardContent></Card>
        <Card className="border-border/50 bg-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle size={20} className="text-green-500" /></div>
          <div><p className="text-2xl font-bold">{metrics.active}</p><p className="text-xs text-muted-foreground">{t("sa.wh_active_label")}</p></div>
        </CardContent></Card>
        <Card className="border-border/50 bg-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10"><Activity size={20} className="text-blue-500" /></div>
          <div><p className="text-2xl font-bold">{metrics.avgSuccess}%</p><p className="text-xs text-muted-foreground">{t("sa.wh_avg_success")}</p></div>
        </CardContent></Card>
      </div>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t("sa.wh_name")}</TableHead><TableHead>{t("sa.wh_url")}</TableHead><TableHead>{t("sa.wh_events")}</TableHead><TableHead>{t("sa.wh_success")}</TableHead><TableHead>{t("sa.wh_last_triggered")}</TableHead><TableHead>{t("sa.wh_status")}</TableHead><TableHead className="w-12"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">Loading webhooks...</TableCell></TableRow>
              ) : webhooks.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">No webhooks found.</TableCell></TableRow>
              ) : webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground max-w-xs truncate">{webhook.url}</TableCell>
                  <TableCell><Badge variant="secondary">{webhook.events.length} {t("sa.wh_events")}</Badge></TableCell>
                  <TableCell>
                    <span className={webhook.successRate >= 98 ? "text-green-500" : webhook.successRate >= 90 ? "text-yellow-500" : "text-destructive"}>
                      {webhook.successRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{webhook.lastTriggered}</TableCell>
                  <TableCell><Badge variant={webhook.active ? "default" : "secondary"}>{webhook.active ? t("sa.wh_active") : t("sa.wh_inactive")}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(webhook)}><Pencil size={14} className="mr-2" /> {t("sa.wh_edit")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(webhook.secret || ""); toast({ title: t("sa.wh_secret_copied") }); }}><Copy size={14} className="mr-2" /> {t("sa.wh_copy_secret")}</DropdownMenuItem>
                        <DropdownMenuItem><RotateCcw size={14} className="mr-2" /> {t("sa.wh_test")}</DropdownMenuItem>
                        <DropdownMenuItem><Eye size={14} className="mr-2" /> {t("sa.wh_view_logs")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(webhook)}><Trash2 size={14} className="mr-2" /> {t("sa.wh_delete")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t("sa.wh_edit_webhook") : t("sa.wh_add_webhook")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("sa.wh_webhook_name")}</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="CRM Sync" /></div>
            <div><Label>{t("sa.wh_endpoint_url")}</Label><Input value={form.url} onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))} placeholder="https://example.com/webhook" className="font-mono text-sm" /></div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} /><Label>{t("sa.wh_active")}</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.retryEnabled} onCheckedChange={(value) => setForm((current) => ({ ...current, retryEnabled: value }))} /><Label>{t("sa.wh_auto_retry")}</Label></div>
              {form.retryEnabled ? (
                <div className="flex items-center gap-2">
                  <Label className="text-xs">{t("sa.wh_max_retries")}:</Label>
                  <Input type="number" value={form.maxRetries} onChange={(event) => setForm((current) => ({ ...current, maxRetries: parseInt(event.target.value, 10) || 1 }))} className="w-16 h-8 text-sm" min={1} max={10} />
                </div>
              ) : null}
            </div>

            <div>
              <Label className="mb-2 block">{t("sa.wh_subscribe")}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-secondary/20 rounded-lg border border-border/30">
                {eventTypes.map((event) => (
                  <div key={event} className="flex items-center gap-2">
                    <Checkbox checked={form.events.includes(event)} onCheckedChange={() => toggleEvent(event)} id={event} />
                    <label htmlFor={event} className="text-xs font-mono cursor-pointer">{event}</label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{form.events.length} {t("sa.wh_events_selected")}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("sa.wh_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.url || form.events.length === 0}>{saving ? "Saving..." : editing ? t("sa.wh_update") : t("sa.wh_create")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default Webhooks;
