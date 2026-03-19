"use client";

import { useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = ["en", "fr", "es", "de", "pt", "ar", "zh"];
const langLabels = { en: "English", fr: "French", es: "Spanish", de: "German", pt: "Portuguese", ar: "Arabic", zh: "Chinese" };

const initialCategories = [
  { id: 1, name: { en: "General", fr: "Général" }, slug: "general", order: 1, faqCount: 4 },
  { id: 2, name: { en: "Pricing", fr: "Tarification" }, slug: "pricing", order: 2, faqCount: 3 },
  { id: 3, name: { en: "Features", fr: "Fonctionnalités" }, slug: "features", order: 3, faqCount: 2 },
  { id: 4, name: { en: "Integrations" }, slug: "integrations", order: 4, faqCount: 2 },
  { id: 5, name: { en: "Security" }, slug: "security", order: 5, faqCount: 2 },
  { id: 6, name: { en: "Support" }, slug: "support", order: 6, faqCount: 2 },
];

const FAQCategories = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeLang, setActiveLang] = useState("en");
  const [form, setForm] = useState({ name: {}, slug: "", order: 1 });

  const openCreate = () => { setEditing(null); setActiveLang("en"); setForm({ name: { en: "" }, slug: "", order: categories.length + 1 }); setDialogOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setActiveLang("en"); setForm({ name: { ...cat.name }, slug: cat.slug, order: cat.order }); setDialogOpen(true); };
  const addLang = (lang) => { setForm(f => ({ ...f, name: { ...f.name, [lang]: "" } })); setActiveLang(lang); };

  const save = () => {
    if (editing) { setCategories(c => c.map(cat => cat.id === editing.id ? { ...cat, name: form.name, slug: form.slug, order: form.order } : cat)); }
    else { setCategories(c => [...c, { id: Date.now(), name: form.name, slug: form.slug, order: form.order, faqCount: 0 }]); }
    setDialogOpen(false);
  };

  return (
    <SuperAdminLayout title={t("sa.faqcat_title")} subtitle={t("sa.faqcat_subtitle")} headerAction={<Button onClick={openCreate}><Plus size={16} className="mr-1" /> {t("sa.faqcat_add")}</Button>}>
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t("sa.faqcat_order")}</TableHead><TableHead>{t("sa.faqcat_name")}</TableHead><TableHead>{t("sa.faqcat_slug")}</TableHead><TableHead>{t("sa.faqcat_languages")}</TableHead><TableHead>{t("sa.faqcat_faqs")}</TableHead><TableHead className="w-12"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {categories.sort((a, b) => a.order - b.order).map(cat => (
                <TableRow key={cat.id}>
                  <TableCell className="text-muted-foreground">{cat.order}</TableCell>
                  <TableCell className="font-medium">{cat.name.en}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{cat.slug}</TableCell>
                  <TableCell><div className="flex gap-1">{Object.keys(cat.name).map(l => <span key={l} className="text-xs bg-secondary px-1.5 py-0.5 rounded">{l.toUpperCase()}</span>)}</div></TableCell>
                  <TableCell>{cat.faqCount}</TableCell>
                  <TableCell>
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(cat)}><Pencil size={14} className="mr-2" /> {t("sa.faqcat_edit")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 size={14} className="mr-2" /> {t("sa.faqcat_delete")}</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? t("sa.faqcat_edit_cat") : t("sa.faqcat_create_cat")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2"><Globe size={14} /> {t("sa.faqcat_name_translations")}</Label>
              <Select onValueChange={addLang}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder={t("sa.faqcat_add_language")} /></SelectTrigger>
                <SelectContent>{languages.filter(l => !form.name[l] && form.name[l] !== "").map(l => <SelectItem key={l} value={l}>{langLabels[l]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Tabs value={activeLang} onValueChange={setActiveLang}>
              <TabsList>{Object.keys(form.name).map(l => <TabsTrigger key={l} value={l} className="text-xs">{langLabels[l]}</TabsTrigger>)}</TabsList>
              {Object.keys(form.name).map(l => (
                <TabsContent key={l} value={l}>
                  <Input value={form.name[l] || ""} onChange={e => setForm(f => ({ ...f, name: { ...f.name, [l]: e.target.value }, slug: l === "en" && !editing ? e.target.value.toLowerCase().replace(/\s+/g, "-") : f.slug }))} placeholder={`${t("sa.faqcat_name_placeholder")} ${langLabels[l]}`} />
                </TabsContent>
              ))}
            </Tabs>
            <div><Label>{t("sa.faqcat_slug")}</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="font-mono text-sm" /></div>
            <div><Label>{t("sa.faqcat_order")}</Label><Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 1 }))} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("sa.faqcat_cancel")}</Button>
              <Button onClick={save}>{editing ? t("sa.faqcat_update") : t("sa.faqcat_create")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default FAQCategories;
