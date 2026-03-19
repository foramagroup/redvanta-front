"use client";

import { useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, Globe, Search } from "lucide-react";
import HtmlEditor from "@/components/HtmlEditor";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";

const languages = LANGUAGES.map(l => l.code);
const langLabels = Object.fromEntries(LANGUAGES.map(l => [l.code, l.label]));

const initialPages = [
  { id: 1, title: "Terms & Conditions", slug: "terms-and-conditions", status: "Published", updatedAt: "2026-02-28", translations: ["en", "fr"], seoTitle: "", seoDesc: "", metaImage: "" },
  { id: 2, title: "Privacy Policy", slug: "privacy-policy", status: "Published", updatedAt: "2026-02-25", translations: ["en", "fr", "es"], seoTitle: "", seoDesc: "", metaImage: "" },
  { id: 3, title: "Cookie Policy", slug: "cookie-policy", status: "Draft", updatedAt: "2026-02-20", translations: ["en"], seoTitle: "", seoDesc: "", metaImage: "" },
  { id: 4, title: "Refund Policy", slug: "refund-policy", status: "Published", updatedAt: "2026-02-15", translations: ["en", "de"], seoTitle: "", seoDesc: "", metaImage: "" },
];

const AllPages = () => {
  const { t } = useLanguage();
  const [pages, setPages] = useState(initialPages);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [activeLang, setActiveLang] = useState("en");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    status: "Draft",
    published: false,
    content: {},
    seoTitle: "",
    seoDesc: "",
    metaImage: "",
    titleTranslations: {},
    slugTranslations: {},
  });

  const openCreate = () => {
    setEditingPage(null);
    setActiveLang("en");
    setForm({
      title: "", slug: "", status: "Draft", published: false, content: { en: "" },
      seoTitle: "", seoDesc: "", metaImage: "",
      titleTranslations: { en: "" }, slugTranslations: { en: "" },
    });
    setEditorOpen(true);
  };

  const openEdit = (page) => {
    setEditingPage(page);
    setActiveLang("en");
    const titleT = {};
    const slugT = {};
    page.translations.forEach((l) => {
      titleT[l] = l === "en" ? page.title : `${page.title} (${l.toUpperCase()})`;
      slugT[l] = l === "en" ? page.slug : `${page.slug}-${l}`;
    });
    setForm({
      title: page.title, slug: page.slug, status: page.status, published: page.status === "Published",
      content: page.translations.reduce((acc, l) => ({ ...acc, [l]: `<h1>${page.title}</h1>\n<p>Content for ${langLabels[l]}...</p>` }), {}),
      seoTitle: page.seoTitle || "", seoDesc: page.seoDesc || "", metaImage: page.metaImage || "",
      titleTranslations: titleT, slugTranslations: slugT,
    });
    setEditorOpen(true);
  };

  const save = () => {
    const titleStr = typeof form.title === "string" ? form.title : (form.titleTranslations?.en || "");
    const slugStr = typeof form.slug === "string" ? form.slug : (form.slugTranslations?.en || "");
    if (editingPage) {
      setPages(p => p.map(pg => pg.id === editingPage.id ? {
        ...pg, title: titleStr, slug: slugStr,
        status: form.published ? "Published" : "Draft",
        translations: Object.keys(form.content).filter(k => form.content[k]),
        seoTitle: form.seoTitle, seoDesc: form.seoDesc, metaImage: form.metaImage,
      } : pg));
    } else {
      setPages(p => [...p, {
        id: Date.now(), title: titleStr, slug: slugStr,
        status: form.published ? "Published" : "Draft",
        updatedAt: new Date().toISOString().split("T")[0],
        translations: Object.keys(form.content).filter(k => form.content[k]),
        seoTitle: form.seoTitle, seoDesc: form.seoDesc, metaImage: form.metaImage,
      }]);
    }
    setEditorOpen(false);
  };

  const addLang = (lang) => {
    setForm(f => ({
      ...f,
      content: { ...f.content, [lang]: "" },
      titleTranslations: { ...f.titleTranslations, [lang]: "" },
      slugTranslations: { ...f.slugTranslations, [lang]: "" },
    }));
    setActiveLang(lang);
  };

  const filtered = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <SuperAdminLayout title={t("sa.ap_title")} subtitle={t("sa.ap_subtitle")} headerAction={<Button onClick={openCreate}><Plus size={16} className="mr-1" /> {t("sa.ap_create")}</Button>}>
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("sa.ap_search")} className="pl-9" />
          </div>
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t("sa.ap_col_title")}</TableHead><TableHead>{t("sa.ap_col_slug")}</TableHead><TableHead>{t("sa.ap_col_status")}</TableHead><TableHead>{t("sa.ap_col_languages")}</TableHead><TableHead>{t("sa.ap_col_updated")}</TableHead><TableHead className="w-12"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(page => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">/{page.slug}</TableCell>
                  <TableCell><Badge variant={page.status === "Published" ? "default" : "secondary"}>{page.status === "Published" ? t("sa.ap_published") : t("sa.ap_draft")}</Badge></TableCell>
                  <TableCell><div className="flex gap-1">{page.translations.map(l => <span key={l} className="text-xs bg-secondary px-1.5 py-0.5 rounded">{l.toUpperCase()}</span>)}</div></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{page.updatedAt}</TableCell>
                  <TableCell>
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(page)}><Pencil size={14} className="mr-2" /> {t("sa.ap_edit")}</DropdownMenuItem>
                        <DropdownMenuItem><Eye size={14} className="mr-2" /> {t("sa.ap_preview")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setPages(p => p.filter(pg => pg.id !== page.id))}><Trash2 size={14} className="mr-2" /> {t("sa.ap_delete")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingPage ? t("sa.ap_edit_page") : t("sa.ap_create_page")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Language tabs for title & slug */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2"><Globe size={14} /> {t("sa.ap_content_translations")}</Label>
                <Select onValueChange={addLang}>
                  <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder={t("sa.ap_add_language")} /></SelectTrigger>
                  <SelectContent>{languages.filter(l => !form.content[l]).map(l => <SelectItem key={l} value={l}>{langLabels[l]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Tabs value={activeLang} onValueChange={setActiveLang}>
                <TabsList className="mb-2">
                  {Object.keys(form.content).map(l => <TabsTrigger key={l} value={l} className="text-xs">{langLabels[l] || l.toUpperCase()}</TabsTrigger>)}
                </TabsList>
                {Object.keys(form.content).map(l => (
                  <TabsContent key={l} value={l} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t("sa.ap_page_title")} ({langLabels[l]})</Label>
                        <Input
                          value={form.titleTranslations?.[l] || ""}
                          onChange={e => {
                            const val = e.target.value;
                            setForm(f => ({
                              ...f,
                              title: l === "en" ? val : f.title,
                              titleTranslations: { ...f.titleTranslations, [l]: val },
                              slugTranslations: l === "en" ? {
                                ...f.slugTranslations,
                                [l]: val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                              } : f.slugTranslations,
                              slug: l === "en" ? val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") : f.slug,
                            }));
                          }}
                          placeholder={`${t("sa.ap_title_in")} ${langLabels[l]}`}
                        />
                      </div>
                      <div>
                        <Label>{t("sa.ap_slug_label")} ({langLabels[l]})</Label>
                        <Input
                          value={form.slugTranslations?.[l] || ""}
                          onChange={e => setForm(f => ({
                            ...f,
                            slugTranslations: { ...f.slugTranslations, [l]: e.target.value },
                            slug: l === "en" ? e.target.value : f.slug,
                          }))}
                          placeholder={`slug-in-${l}`}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                     <HtmlEditor
                      value={form.content[l] || ""}
                      onChange={v => setForm(f => ({ ...f, content: { ...f.content, [l]: v } }))}
                      placeholder={`${t("sa.ap_content_in")} ${langLabels[l]}...`}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.published} onCheckedChange={v => setForm(f => ({ ...f, published: v }))} />
              <Label>{t("sa.ap_published")}</Label>
            </div>

            {/* SEO Configuration */}
            <div className="rounded-lg border border-border/50 p-4 space-y-4">
              <h4 className="text-sm font-semibold">{t("sa.ap_seo_config")}</h4>
              <div>
                <Label>{t("sa.ap_seo_title")}</Label>
                <Input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder={t("sa.ap_seo_title_placeholder")} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">{form.seoTitle.length}/60 {t("sa.ap_characters")}</p>
              </div>
              <div>
                <Label>{t("sa.ap_seo_desc")}</Label>
                <Textarea value={form.seoDesc} onChange={e => setForm(f => ({ ...f, seoDesc: e.target.value }))} placeholder={t("sa.ap_seo_desc_placeholder")} className="mt-1" rows={3} />
                <p className="text-xs text-muted-foreground mt-1">{form.seoDesc.length}/160 {t("sa.ap_characters")}</p>
              </div>
              <div>
                <Label>{t("sa.ap_meta_image")}</Label>
                <Input value={form.metaImage} onChange={e => setForm(f => ({ ...f, metaImage: e.target.value }))} placeholder="https://example.com/og-image.jpg" className="mt-1" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setEditorOpen(false)}>{t("sa.ap_cancel")}</Button>
              <Button onClick={save}>{editingPage ? t("sa.ap_update_page") : t("sa.ap_create_page")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default AllPages;
