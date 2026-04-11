"use client";

import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Copy, Globe, Eye, Send, Monitor, Smartphone, Moon, Sun, User, Variable } from "lucide-react";
import HtmlEditor from "@/components/HtmlEditor";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const languages = ["en", "fr", "es", "de"];
const langLabels = { en: "English", fr: "French", es: "Spanish", de: "German" };
const variables = ["{{company_name}}", "{{customer_name}}", "{{review_link}}", "{{location}}", "{{date}}", "{{support_url}}", "{{unsubscribe_link}}", "{{logo_url}}"];
const emptyForm = { name: "", slug: "", category: "Onboarding", subject: { en: "" }, body: { en: "" }, active: true };

const normalizeTemplate = (template) => ({
  ...template,
  subject: template.subject || {},
  body: template.body || {},
});

const EmailTemplates = () => {
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewDark, setPreviewDark] = useState(false);
  const [previewUser, setPreviewUser] = useState("customer");

  const userPresets = {
    customer: { "{{customer_name}}": "John Smith", "{{company_name}}": "Acme Corp", "{{review_link}}": "#", "{{location}}": "New York", "{{date}}": "Mar 3, 2026" },
    admin: { "{{customer_name}}": "Admin User", "{{company_name}}": "Opinoor", "{{review_link}}": "#", "{{location}}": "HQ", "{{date}}": "Mar 3, 2026" },
  };

  const replaceVars = (text) => {
    let result = text || "";
    const preset = userPresets[previewUser] || userPresets.customer;
    Object.entries(preset).forEach(([key, value]) => {
      result = result.split(key).join(value);
    });
    return result;
  };

  const loadTemplates = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/email-templates`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load email templates");
      }

      setTemplates(Array.isArray(payload) ? payload.map(normalizeTemplate) : []);
    } catch (err) {
      setError(err.message || "Failed to load email templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const formLanguages = useMemo(() => Object.keys(form.body), [form.body]);

  const openCreate = () => {
    setEditing(null);
    setActiveLang("en");
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (template) => {
    setEditing(template);
    setActiveLang(Object.keys(template.body)[0] || "en");
    setForm({
      name: template.name,
      slug: template.slug,
      category: template.category,
      subject: { ...template.subject },
      body: { ...template.body },
      active: Boolean(template.active),
    });
    setDialogOpen(true);
  };

  const openPreview = (template) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const addLang = (lang) => {
    setForm((current) => ({
      ...current,
      subject: { ...current.subject, [lang]: "" },
      body: { ...current.body, [lang]: "" },
    }));
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
      const res = await fetch(`${apiBase}/api/superadmin/email-templates${isEditing ? `/${editing.id}` : ""}`, {
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
      toast({ title: isEditing ? t("sa.emt_update") : t("sa.emt_create_btn") });
    } catch (err) {
      setError(err.message || `Failed to ${editing ? "update" : "create"} template`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/email-templates/${template.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete template");
      }

      setTemplates((current) => current.filter((item) => item.id !== template.id));
      toast({ title: t("sa.emt_delete") });
    } catch (err) {
      setError(err.message || "Failed to delete template");
    }
  };

  const handleDuplicate = async (template) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/email-templates/${template.id}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to duplicate template");
      }

      await loadTemplates();
      toast({ title: t("sa.emt_duplicate") });
    } catch (err) {
      setError(err.message || "Failed to duplicate template");
    }
  };

  return (
    <SuperAdminLayout title={t("sa.emt_title")} subtitle={t("sa.emt_subtitle")} headerAction={<Button onClick={openCreate}><Plus size={16} className="mr-1" /> {t("sa.emt_create")}</Button>}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t("sa.emt_name")}</TableHead><TableHead>{t("sa.emt_slug")}</TableHead><TableHead>{t("sa.emt_category")}</TableHead><TableHead>{t("sa.emt_languages")}</TableHead><TableHead>{t("sa.emt_status")}</TableHead><TableHead className="w-12"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">Loading email templates...</TableCell></TableRow>
              ) : templates.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">No email templates found.</TableCell></TableRow>
              ) : templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{template.slug}</TableCell>
                  <TableCell><Badge variant="secondary">{template.category}</Badge></TableCell>
                  <TableCell><div className="flex gap-1">{Object.keys(template.body).map((lang) => <span key={lang} className="text-xs bg-secondary px-1.5 py-0.5 rounded">{lang.toUpperCase()}</span>)}</div></TableCell>
                  <TableCell><Badge variant={template.active ? "default" : "secondary"}>{template.active ? t("sa.emt_active") : t("sa.emt_inactive")}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(template)}><Pencil size={14} className="mr-2" /> {t("sa.emt_edit")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}><Copy size={14} className="mr-2" /> {t("sa.emt_duplicate")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPreview(template)}><Eye size={14} className="mr-2" /> {t("sa.emt_preview")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(template)}><Trash2 size={14} className="mr-2" /> {t("sa.emt_delete")}</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t("sa.emt_edit_template") : t("sa.emt_create_template")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("sa.emt_template_name")}</Label><Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value, slug: !editing ? e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") : current.slug }))} /></div>
                <div><Label>{t("sa.emt_slug")}</Label><Input value={form.slug} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} className="font-mono text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("sa.emt_category")}</Label>
                  <Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["Onboarding", "Review", "Billing", "Auth", "Notification", "Marketing", "System"].map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} />
                  <Label>{t("sa.emt_active")}</Label>
                </div>
              </div>

              <Card className="bg-secondary/30 border-border/30">
                <CardContent className="p-3">
                  <Label className="text-xs flex items-center gap-1 mb-2"><Variable size={12} /> {t("sa.emt_variables")}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map((variable) => <button key={variable} type="button" onClick={() => insertVariable(variable)} className="text-xs bg-secondary px-2 py-1 rounded hover:bg-primary/20 hover:text-primary transition-colors font-mono">{variable}</button>)}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2"><Globe size={14} /> {t("sa.emt_content")}</Label>
                <Select onValueChange={addLang}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder={t("sa.emt_add_language")} /></SelectTrigger>
                  <SelectContent>{languages.filter((lang) => !formLanguages.includes(lang)).map((lang) => <SelectItem key={lang} value={lang}>{langLabels[lang]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Tabs value={activeLang} onValueChange={setActiveLang}>
                <TabsList>{formLanguages.map((lang) => <TabsTrigger key={lang} value={lang} className="text-xs">{langLabels[lang]}</TabsTrigger>)}</TabsList>
                {formLanguages.map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-3">
                    <div><Label>{t("sa.emt_subject")} ({langLabels[lang]})</Label><Input value={form.subject[lang] || ""} onChange={(e) => setForm((current) => ({ ...current, subject: { ...current.subject, [lang]: e.target.value } }))} placeholder={t("sa.emt_subject_placeholder")} /></div>
                    <div><Label>{t("sa.emt_body")} ({langLabels[lang]})</Label>
                      <HtmlEditor value={form.body[lang] || ""} onChange={(value) => setForm((current) => ({ ...current, body: { ...current.body, [lang]: value } }))} placeholder={`Email body in ${langLabels[lang]}...`} />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("sa.emt_live_preview")}</Label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded ${previewDevice === "desktop" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}><Monitor size={14} /></button>
                  <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded ${previewDevice === "mobile" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}><Smartphone size={14} /></button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <button onClick={() => setPreviewDark(!previewDark)} className={`p-1.5 rounded ${previewDark ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{previewDark ? <Moon size={14} /> : <Sun size={14} />}</button>
                </div>
              </div>
              <div className={`rounded-lg border border-border/50 overflow-hidden ${previewDevice === "mobile" ? "max-w-[375px] mx-auto" : ""}`}>
                <div className={`p-3 border-b border-border/30 ${previewDark ? "bg-gray-900" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-medium ${previewDark ? "text-gray-300" : "text-gray-600"}`}>{t("sa.emt_subject")}:</span>
                    <span className={previewDark ? "text-white" : "text-gray-900"}>{replaceVars(form.subject[activeLang] || t("sa.emt_no_subject"))}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className={`font-medium ${previewDark ? "text-gray-300" : "text-gray-600"}`}>{t("sa.emt_to")}:</span>
                    <span className={previewDark ? "text-gray-400" : "text-gray-500"}>{previewUser === "admin" ? "admin@opinoor.com" : "john@example.com"}</span>
                  </div>
                </div>
                <div className={`p-0 min-h-[400px] ${previewDark ? "bg-gray-800" : "bg-white"}`}>
                  <div dangerouslySetInnerHTML={{ __html: replaceVars(form.body[activeLang] || `<p style='padding:40px;color:#999;text-align:center;'>${t("sa.emt_start_editing")}</p>`) }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={previewUser} onValueChange={setPreviewUser}>
                  <SelectTrigger className="h-8 text-xs w-40"><User size={12} className="mr-1" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">{t("sa.emt_customer")}</SelectItem>
                    <SelectItem value="admin">{t("sa.emt_admin")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="text-xs h-8 ml-auto"><Send size={12} className="mr-1" /> {t("sa.emt_send_test")}</Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("sa.emt_cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? t("sa.emt_update") : t("sa.emt_create_btn")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("sa.emt_preview")}: {previewTemplate?.name}</DialogTitle></DialogHeader>
          {previewTemplate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded ${previewDevice === "desktop" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}><Monitor size={14} /></button>
                  <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded ${previewDevice === "mobile" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}><Smartphone size={14} /></button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <button onClick={() => setPreviewDark(!previewDark)} className={`p-1.5 rounded ${previewDark ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{previewDark ? <Moon size={14} /> : <Sun size={14} />}</button>
                </div>
                <div className="flex gap-2">
                  <Select value={previewUser} onValueChange={setPreviewUser}>
                    <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">{t("sa.emt_customer")}</SelectItem>
                      <SelectItem value="admin">{t("sa.emt_admin")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="text-xs h-8"><Send size={12} className="mr-1" /> {t("sa.emt_send_test")}</Button>
                </div>
              </div>
              <div className={`rounded-lg border border-border/50 overflow-hidden ${previewDevice === "mobile" ? "max-w-[375px] mx-auto" : ""}`}>
                <div className={`p-3 border-b border-border/30 ${previewDark ? "bg-gray-900" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-medium ${previewDark ? "text-gray-300" : "text-gray-600"}`}>{t("sa.emt_subject")}:</span>
                    <span className={previewDark ? "text-white" : "text-gray-900"}>{replaceVars(previewTemplate.subject.en || "")}</span>
                  </div>
                </div>
                <div className={`p-0 min-h-[400px] ${previewDark ? "bg-gray-800" : "bg-white"}`}>
                  <div dangerouslySetInnerHTML={{ __html: replaceVars(previewTemplate.body.en || "") }} />
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default EmailTemplates;
