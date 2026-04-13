"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const allFeatures = [
  "Review Monitoring", "Review Responses", "AI Auto-Responses", "Analytics Dashboard",
  "Multi-Location", "API Access", "Webhook Integrations", "White-Label Dashboard",
  "Priority Support", "Custom Automation", "SMS Campaigns", "Advanced Filtering",
  "Team Collaboration", "Custom Reports", "Dedicated Account Manager",
];

const emptyPlan = {
  name: "", price: 0, annual: 0, apiLimit: "", smsLimit: "", locationLimit: 1,
  trialDays: 14, trialFeatures: [], features: [], status: "Active",
};

const parseFeatureList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizePlan = (plan) => ({
  ...plan,
  price: Number(plan.price ?? 0),
  annual: Number(plan.annual ?? 0),
  locationLimit: Number(plan.locationLimit ?? 1),
  trialDays: Number(plan.trialDays ?? 14),
  trialFeatures: parseFeatureList(plan.trialFeatures),
  features: parseFeatureList(plan.features),
  status: plan.status || "Active",
});

const PlansAndPricing = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyPlan);

  const loadPlans = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/plan-settings`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load plans");
      }

      setPlans(Array.isArray(payload) ? payload.map(normalizePlan) : []);
    } catch (err) {
      setError(err.message || "Failed to load plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openAdd = () => {
    setForm(emptyPlan);
    setEditId(null);
    setShowDialog(true);
  };

  const openEdit = (plan) => {
    setForm({ ...normalizePlan(plan) });
    setEditId(plan.id);
    setShowDialog(true);
  };

  const toggleFeature = (feature, list) => {
    setForm((prev) => ({
      ...prev,
      [list]: prev[list].includes(feature)
        ? prev[list].filter((item) => item !== feature)
        : [...prev[list], feature],
    }));
  };

  const handleSave = async () => {
    setError("");

    if (!form.name || !form.apiLimit || !form.smsLimit) {
      setError("Please fill in plan name, API limit and SMS limit.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(editId);
      const res = await fetch(`${apiBase}/superadmin/plan-settings${isEditing ? `/${editId}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          annual: Number(form.annual),
          apiLimit: form.apiLimit,
          smsLimit: form.smsLimit,
          locationLimit: Number(form.locationLimit),
          trialDays: Number(form.trialDays),
          trialFeatures: JSON.stringify(form.trialFeatures),
          features: JSON.stringify(form.features),
          status: form.status,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} plan`);
      }

      setShowDialog(false);
      setForm(emptyPlan);
      setEditId(null);
      await loadPlans();
      toast({ title: isEditing ? "Plan updated" : "Plan created" });
    } catch (err) {
      setError(err.message || `Failed to ${editId ? "update" : "create"} plan`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/plan-settings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete plan");
      }

      setPlans((current) => current.filter((plan) => plan.id !== id));
      toast({ title: "Plan deleted" });
    } catch (err) {
      setError(err.message || "Failed to delete plan");
    }
  };

  return (
    <SuperAdminLayout title={t("sa.plans_title")} subtitle={t("sa.plans_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("sa.plans_plans")}</CardTitle>
          <Button size="sm" onClick={openAdd} disabled={loading}>
            <Plus size={14} className="mr-2" />
            {t("sa.plans_add")}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.plans_plan")}</TableHead><TableHead>{t("sa.plans_monthly")}</TableHead><TableHead>{t("sa.plans_annual")}</TableHead>
                <TableHead>{t("sa.plans_trial")}</TableHead><TableHead>{t("sa.plans_api_limit")}</TableHead><TableHead>{t("sa.plans_sms_limit")}</TableHead>
                <TableHead>{t("sa.plans_locations")}</TableHead><TableHead>{t("sa.plans_features")}</TableHead><TableHead>{t("sa.plans_status")}</TableHead><TableHead>{t("sa.plans_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={10} className="py-6 text-center text-muted-foreground">
                    Loading plans...
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={10} className="py-6 text-center text-muted-foreground">
                    No plans found.
                  </TableCell>
                </TableRow>
              ) : plans.map((p) => (
                <TableRow key={p.id || p.name} className="border-border/50">
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>${p.price}/{t("sa.plans_mo")}</TableCell>
                  <TableCell>${p.annual}/{t("sa.plans_mo")}</TableCell>
                  <TableCell>{p.trialDays} {t("sa.plans_days")}</TableCell>
                  <TableCell>{p.apiLimit}</TableCell>
                  <TableCell>{p.smsLimit}</TableCell>
                  <TableCell>{p.locationLimit}</TableCell>
                  <TableCell><Badge variant="secondary">{p.features.length} {t("sa.plans_features_count")}</Badge></TableCell>
                  <TableCell><Badge variant={p.status === "Active" ? "default" : "secondary"}>{p.status === "Active" ? t("sa.plans_active") : p.status}</Badge></TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border/50 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId !== null ? t("sa.plans_edit_plan") : t("sa.plans_add_new")}</DialogTitle></DialogHeader>
          <Tabs defaultValue="general">
            <TabsList className="bg-secondary border border-border/50 mb-4">
              <TabsTrigger value="general">{t("sa.plans_general")}</TabsTrigger>
              <TabsTrigger value="trial">{t("sa.plans_trial_period")}</TabsTrigger>
              <TabsTrigger value="features">{t("sa.plans_features")}</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("sa.plans_plan_name")}</Label><Input value={form.name} disabled={saving} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 bg-secondary border-border/50" placeholder={t("sa.plans_name_placeholder")} /></div>
                <div><Label>{t("sa.plans_status")}</Label>
                  <Select value={form.status} disabled={saving} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Active">{t("sa.plans_active")}</SelectItem><SelectItem value="Draft">{t("sa.plans_draft")}</SelectItem><SelectItem value="Archived">{t("sa.plans_archived")}</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("sa.plans_monthly_price")}</Label><Input type="number" value={form.price} disabled={saving} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="mt-1 bg-secondary border-border/50" /></div>
                <div><Label>{t("sa.plans_annual_price")}</Label><Input type="number" value={form.annual} disabled={saving} onChange={(e) => setForm({ ...form, annual: Number(e.target.value) })} className="mt-1 bg-secondary border-border/50" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>{t("sa.plans_api_limit")}</Label><Input value={form.apiLimit} disabled={saving} onChange={(e) => setForm({ ...form, apiLimit: e.target.value })} className="mt-1 bg-secondary border-border/50" placeholder={t("sa.plans_api_placeholder")} /></div>
                <div><Label>{t("sa.plans_sms_limit")}</Label><Input value={form.smsLimit} disabled={saving} onChange={(e) => setForm({ ...form, smsLimit: e.target.value })} className="mt-1 bg-secondary border-border/50" placeholder={t("sa.plans_sms_placeholder")} /></div>
                <div><Label>{t("sa.plans_location_limit")}</Label><Input type="number" value={form.locationLimit} disabled={saving} onChange={(e) => setForm({ ...form, locationLimit: Number(e.target.value) })} className="mt-1 bg-secondary border-border/50" /></div>
              </div>
            </TabsContent>

            <TabsContent value="trial" className="space-y-4">
              <div className="max-w-xs">
                <Label>{t("sa.plans_trial_days")}</Label>
                <Input type="number" value={form.trialDays} disabled={saving} onChange={(e) => setForm({ ...form, trialDays: Number(e.target.value) })} className="mt-1 bg-secondary border-border/50" />
                <p className="text-xs text-muted-foreground mt-1">{t("sa.plans_trial_hint")}</p>
              </div>
              <div>
                <Label className="mb-3 block">{t("sa.plans_trial_features")}</Label>
                <p className="text-xs text-muted-foreground mb-3">{t("sa.plans_trial_features_desc")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {allFeatures.map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm p-2 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/60 cursor-pointer transition-colors">
                      <Checkbox checked={form.trialFeatures.includes(f)} disabled={saving} onCheckedChange={() => toggleFeature(f, "trialFeatures")} />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div>
                <Label className="mb-3 block">{t("sa.plans_included_features")}</Label>
                <p className="text-xs text-muted-foreground mb-3">{t("sa.plans_included_features_desc")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {allFeatures.map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm p-2 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/60 cursor-pointer transition-colors">
                      <Checkbox checked={form.features.includes(f)} disabled={saving} onCheckedChange={() => toggleFeature(f, "features")} />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>{t("sa.plans_cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editId !== null ? t("sa.plans_save") : t("sa.plans_create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default PlansAndPricing;
