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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const emptyAddon = { name: "", type: "Fixed", price: "", description: "", active: true };

const AddOnManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editAddon, setEditAddon] = useState(null);
  const [form, setForm] = useState(emptyAddon);

  const loadAddons = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/addon-settings`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load addons");
      }

      setAddons(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err.message || "Failed to load addons");
      setAddons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddons();
  }, []);

  const resetForm = () => {
    setForm(emptyAddon);
    setEditAddon(null);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (addon) => {
    setForm({
      name: addon.name || "",
      type: addon.type || "Fixed",
      price: addon.price || "",
      description: addon.description || "",
      active: Boolean(addon.active),
    });
    setEditAddon(addon);
  };

  const handleSave = async () => {
    setError("");

    if (!form.name || !form.type || !form.price) {
      setError("Please fill in addon name, type and price.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(editAddon?.id);
      const res = await fetch(`${apiBase}/api/superadmin/addon-settings${isEditing ? `/${editAddon.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          price: form.price,
          description: form.description,
          active: form.active,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} addon`);
      }

      if (isEditing) {
        setEditAddon(null);
        toast({ title: "Addon updated" });
      } else {
        setShowCreate(false);
        toast({ title: "Addon created" });
      }

      resetForm();
      await loadAddons();
    } catch (err) {
      setError(err.message || `Failed to ${editAddon ? "update" : "create"} addon`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (addon) => {
    setError("");
    setTogglingId(addon.id);

    try {
      const res = await fetch(`${apiBase}/api/superadmin/addon-settings/${addon.id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to update addon status");
      }

      setAddons((current) =>
        current.map((item) => (item.id === addon.id ? payload : item))
      );
    } catch (err) {
      setError(err.message || "Failed to update addon status");
    } finally {
      setTogglingId(null);
    }
  };

  const AddonFormFields = () => (
    <div className="space-y-4">
      <div><Label>{t("sa.addon_name")}</Label><Input value={form.name} disabled={saving} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 bg-secondary border-border/50" placeholder={t("sa.addon_name_placeholder")} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>{t("sa.addon_pricing_type")}</Label>
          <Select value={form.type} disabled={saving} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Fixed">{t("sa.addon_fixed")}</SelectItem><SelectItem value="Quantity">{t("sa.addon_quantity")}</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>{t("sa.addon_price")}</Label><Input value={form.price} disabled={saving} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 bg-secondary border-border/50" placeholder={t("sa.addon_price_placeholder")} /></div>
      </div>
      <div><Label>{t("sa.addon_description")}</Label><Textarea value={form.description} disabled={saving} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 bg-secondary border-border/50" placeholder={t("sa.addon_desc_placeholder")} /></div>
      <div className="flex items-center gap-3">
        <Switch checked={form.active} disabled={saving} onCheckedChange={(v) => setForm({ ...form, active: v })} />
        <Label>{t("sa.addon_active")}</Label>
      </div>
    </div>
  );

  return (
    <SuperAdminLayout title={t("sa.addon_title")} subtitle={t("sa.addon_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("sa.addon_addons")}</CardTitle>
          <Button size="sm" onClick={openCreate} disabled={loading}>
            <Plus size={14} className="mr-2" />
            {t("sa.addon_create_new")}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.addon_col_name")}</TableHead><TableHead>{t("sa.addon_col_type")}</TableHead><TableHead>{t("sa.addon_price")}</TableHead>
                <TableHead>{t("sa.addon_col_status")}</TableHead><TableHead>{t("sa.addon_col_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    Loading addons...
                  </TableCell>
                </TableRow>
              ) : addons.length === 0 ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    No addons found.
                  </TableCell>
                </TableRow>
              ) : addons.map((addon) => (
                <TableRow key={addon.id || addon.name} className="border-border/50">
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell><Badge variant="outline" className="border-border/50">{addon.type}</Badge></TableCell>
                  <TableCell>{addon.price}</TableCell>
                  <TableCell>
                    <Switch
                      checked={Boolean(addon.active)}
                      disabled={togglingId === addon.id}
                      onCheckedChange={() => handleToggle(addon)}
                    />
                  </TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => openEdit(addon)}><Pencil size={14} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("sa.addon_create_title")}</DialogTitle></DialogHeader>
          <AddonFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }} disabled={saving}>{t("sa.addon_cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : t("sa.addon_create_btn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editAddon} onOpenChange={() => { setEditAddon(null); setForm(emptyAddon); }}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("sa.addon_edit_title")}</DialogTitle></DialogHeader>
          <AddonFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditAddon(null); setForm(emptyAddon); }} disabled={saving}>{t("sa.addon_cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : t("sa.addon_save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default AddOnManagement;
