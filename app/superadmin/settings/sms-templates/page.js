"use client";

import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Copy, Globe, MessageSquare, Variable } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const languages = ["en", "fr", "es", "de"];
const langLabels = { en: "English", fr: "French", es: "Spanish", de: "German" };
const variables = ["{{company_name}}", "{{customer_name}}", "{{review_link}}", "{{location}}", "{{date}}", "{{support_url}}"];

const emptyForm = { name: "", slug: "", category: "Review", body: { en: "" }, active: true };

const normalizeTemplate = (template) => ({
  ...template,
  body: Array.isArray(template.translations)
    ? template.translations.reduce((accumulator, translation) => {
        accumulator[translation.language] = translation.body || "";
        return accumulator;
      }, {})
    : template.body || {},
});

const SmsTemplates = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeLang, setActiveLang] = useState("en");
  const [form, setForm] = useState(emptyForm);

  const loadTemplates = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/sms-templates`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load SMS templates");
      }

      setTemplates(Array.isArray(payload) ? payload.map(normalizeTemplate) : []);
    } catch (err) {
      setError(err.message || "Failed to load SMS templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setActiveLang("en");
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (template) => {
    const normalized = normalizeTemplate(template);
    setEditing(normalized);
    setActiveLang(Object.keys(normalized.body)[0] || "en");
    setForm({
      name: normalized.name,
      slug: normalized.slug,
      category: normalized.category,
      body: { ...normalized.body },
      active: Boolean(normalized.active),
    });
    setDialogOpen(true);
  };

  const activeFormLanguages = useMemo(() => Object.keys(form.body), [form.body]);

  const addLang = (lang) => {
    setForm((current) => ({ ...current, body: { ...current.body, [lang]: "" } }));
    setActiveLang(lang);
  };

  const insertVariable = (variable) => {
    setForm((current) => ({
      ...current,
      body: { ...current.body, [activeLang]: (current.body[activeLang] || "") + variable },
    }));
  };

  const handleSave = async () => {
    setError("");

    if (!form.name || !form.slug) {
      setError("Please fill in template name and slug.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(editing?.id);
      const res = await fetch(`${apiBase}/superadmin/sms-templates${isEditing ? `/${editing.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} template`);
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await loadTemplates();
      toast({ title: isEditing ? t("sa.smst_update") : t("sa.smst_create_btn") });
    } catch (err) {
      setError(err.message || `Failed to ${editing ? "update" : "create"} template`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/sms-templates/${template.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete template");
      }

      setTemplates((current) => current.filter((item) => item.id !== template.id));
      toast({ title: t("sa.smst_delete") });
    } catch (err) {
      setError(err.message || "Failed to delete template");
    }
  };

  const handleDuplicate = async (template) => {
    setError("");

    try {
      const duplicateSlug = `${template.slug}_${Date.now()}`;
      const res = await fetch(`${apiBase}/superadmin/sms-templates`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${template.name} Copy`,
          slug: duplicateSlug,
          category: template.category,
          active: template.active,
          body: template.body,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to duplicate template");
      }

      await loadTemplates();
      toast({ title: t("sa.smst_duplicate") });
    } catch (err) {
      setError(err.message || "Failed to duplicate template");
    }
  };

  const charCount = (text) => text.length;

  return (
    <SuperAdminLayout title={t("sa.smst_title")} subtitle={t("sa.smst_subtitle")} headerAction={<Button onClick={openCreate}><Plus size={16} className="mr-1" /> {t("sa.smst_create")}</Button>}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t("sa.smst_name")}</TableHead><TableHead>{t("sa.smst_slug")}</TableHead><TableHead>{t("sa.smst_category")}</TableHead><TableHead>{t("sa.smst_languages")}</TableHead><TableHead>{t("sa.smst_status")}</TableHead><TableHead className="w-12"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">Loading SMS templates...</TableCell></TableRow>
              ) : templates.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">No SMS templates found.</TableCell></TableRow>
              ) : templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{template.slug}</TableCell>
                  <TableCell><Badge variant="secondary">{template.category}</Badge></TableCell>
                  <TableCell><div className="flex gap-1">{Object.keys(template.body).map((lang) => <span key={lang} className="text-xs bg-secondary px-1.5 py-0.5 rounded">{lang.toUpperCase()}</span>)}</div></TableCell>
                  <TableCell><Badge variant={template.active ? "default" : "secondary"}>{template.active ? t("sa.smst_active") : t("sa.smst_inactive")}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(template)}><Pencil size={14} className="mr-2" /> {t("sa.smst_edit")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}><Copy size={14} className="mr-2" /> {t("sa.smst_duplicate")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(template)}><Trash2 size={14} className="mr-2" /> {t("sa.smst_delete")}</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t("sa.smst_edit_template") : t("sa.smst_create_template")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("sa.smst_template_name")}</Label><Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value, slug: !editing ? e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") : current.slug }))} /></div>
              <div><Label>{t("sa.smst_slug")}</Label><Input value={form.slug} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} className="font-mono text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("sa.smst_category")}</Label>
                <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Review", "Notification", "Auth", "Marketing", "System"].map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} />
                <Label>{t("sa.smst_active")}</Label>
              </div>
            </div>

            <Card className="bg-secondary/30 border-border/30">
              <CardContent className="p-3">
                <Label className="text-xs flex items-center gap-1 mb-2"><Variable size={12} /> {t("sa.smst_variables")}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {variables.map((variable) => <button key={variable} type="button" onClick={() => insertVariable(variable)} className="text-xs bg-secondary px-2 py-1 rounded hover:bg-primary/20 hover:text-primary transition-colors font-mono">{variable}</button>)}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2"><Globe size={14} /> {t("sa.smst_message_body")}</Label>
              <Select onValueChange={addLang}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder={t("sa.smst_add_language")} /></SelectTrigger>
                <SelectContent>{languages.filter((lang) => !activeFormLanguages.includes(lang)).map((lang) => <SelectItem key={lang} value={lang}>{langLabels[lang]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Tabs value={activeLang} onValueChange={setActiveLang}>
              <TabsList>{activeFormLanguages.map((lang) => <TabsTrigger key={lang} value={lang} className="text-xs">{langLabels[lang]}</TabsTrigger>)}</TabsList>
              {activeFormLanguages.map((lang) => (
                <TabsContent key={lang} value={lang}>
                  <Textarea value={form.body[lang] || ""} onChange={(e) => setForm((current) => ({ ...current, body: { ...current.body, [lang]: e.target.value } }))} rows={4} placeholder={`SMS body in ${langLabels[lang]}...`} />
                  <p className="text-xs text-muted-foreground mt-1">{charCount(form.body[lang] || "")} {t("sa.smst_characters")} · {Math.ceil(charCount(form.body[lang] || "") / 160) || 1} {t("sa.smst_segments")}</p>
                </TabsContent>
              ))}
            </Tabs>

            <Card className="bg-secondary/30 border-border/30">
              <CardHeader className="p-3 pb-1"><CardTitle className="text-xs flex items-center gap-1"><MessageSquare size={12} /> {t("sa.smst_preview")}</CardTitle></CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="bg-card rounded-lg p-3 text-sm border border-border/30 max-w-xs">
                  {(form.body[activeLang] || t("sa.smst_preview_placeholder")).replace(/\{\{(\w+)\}\}/g, (_, key) => `[${key}]`)}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("sa.smst_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? t("sa.smst_update") : t("sa.smst_create_btn")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default SmsTemplates;
