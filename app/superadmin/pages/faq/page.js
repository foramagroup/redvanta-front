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
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Globe, GripVertical, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import HtmlEditor from "@/components/HtmlEditor";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = ["en", "fr", "es", "de", "pt", "ar", "zh"];
const langLabels = { en: "English", fr: "French", es: "Spanish", de: "German", pt: "Portuguese", ar: "Arabic", zh: "Chinese" };
const faqCategories = ["General", "Pricing", "Features", "Integrations", "Security", "Support"];

const initialFaqs = [
  { id: 1, question: { en: "What is Opinoor?", fr: "Qu'est-ce que Opinoor?" }, answer: { en: "<p>Opinoor is a comprehensive reputation management platform.</p>", fr: "<p>Opinoor est une plateforme de gestion de réputation.</p>" }, category: "General", published: true, order: 1 },
  { id: 2, question: { en: "Is there a free trial?" }, answer: { en: "<p>Yes, we offer a 14-day free trial on all plans.</p>" }, category: "Pricing", published: true, order: 2 },
  { id: 3, question: { en: "What platforms do you integrate with?" }, answer: { en: "<p>We integrate with Google Business, Trustpilot, Yelp, and 50+ platforms.</p>" }, category: "Integrations", published: true, order: 3 },
  { id: 4, question: { en: "How do you handle data security?" }, answer: { en: "<p>We use enterprise-grade AES-256 encryption and SOC 2 compliance.</p>" }, category: "Security", published: false, order: 4 },
  { id: 5, question: { en: "Can I customize the review card design?" }, answer: { en: "<p>Yes, you can fully customize colors, logo, and layout through our dashboard.</p>" }, category: "Features", published: true, order: 5 },
];

const FAQPages = () => {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeLang, setActiveLang] = useState("en");
  const [form, setForm] = useState({ question: {}, answer: {}, category: "General", published: true, order: 1 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedAll, setExpandedAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState([]);
  const [dragId, setDragId] = useState(null);

  const openCreate = () => {
    setEditing(null); setActiveLang("en");
    setForm({ question: { en: "" }, answer: { en: "" }, category: "General", published: true, order: faqs.length + 1 });
    setEditorOpen(true);
  };

  const openEdit = (faq) => {
    setEditing(faq); setActiveLang("en");
    setForm({ question: { ...faq.question }, answer: { ...faq.answer }, category: faq.category, published: faq.published, order: faq.order });
    setEditorOpen(true);
  };

  const addLang = (lang) => {
    setForm(f => ({ ...f, question: { ...f.question, [lang]: "" }, answer: { ...f.answer, [lang]: "" } }));
    setActiveLang(lang);
  };

  const save = () => {
    if (editing) {
      setFaqs(f => f.map(fq => fq.id === editing.id ? { ...fq, question: form.question, answer: form.answer, category: form.category, published: form.published, order: form.order } : fq));
    } else {
      setFaqs(f => [...f, { id: Date.now(), question: form.question, answer: form.answer, category: form.category, published: form.published, order: form.order }]);
    }
    setEditorOpen(false);
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => { if (selectedIds.length === filtered.length) { setSelectedIds([]); } else { setSelectedIds(filtered.map(f => f.id)); } };

  const bulkAction = (action) => {
    if (action === "delete") { setFaqs(f => f.filter(fq => !selectedIds.includes(fq.id))); }
    else if (action === "publish") { setFaqs(f => f.map(fq => selectedIds.includes(fq.id) ? { ...fq, published: true } : fq)); }
    else if (action === "unpublish") { setFaqs(f => f.map(fq => selectedIds.includes(fq.id) ? { ...fq, published: false } : fq)); }
    else if (faqCategories.includes(action)) { setFaqs(f => f.map(fq => selectedIds.includes(fq.id) ? { ...fq, category: action } : fq)); }
    setSelectedIds([]);
  };

  const toggleExpand = (id) => setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleExpandAll = () => { if (expandedAll) { setExpandedIds([]); } else { setExpandedIds(filtered.map(f => f.id)); } setExpandedAll(!expandedAll); };

  const handleDragStart = (id) => setDragId(id);
  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    if (dragId === null || dragId === targetId) return;
    setFaqs(prev => {
      const items = [...prev];
      const dragIdx = items.findIndex(f => f.id === dragId);
      const targetIdx = items.findIndex(f => f.id === targetId);
      const [removed] = items.splice(dragIdx, 1);
      items.splice(targetIdx, 0, removed);
      return items.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };
  const handleDragEnd = () => setDragId(null);

  const filtered = faqs.filter(f => {
    const matchSearch = !search || (f.question.en || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || f.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <SuperAdminLayout title={t("sa.faq_title")} subtitle={t("sa.faq_subtitle")} headerAction={<Button onClick={openCreate}><Plus size={16} className="mr-1" /> {t("sa.faq_create")}</Button>}>
      <Card className="border-border/50 bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("sa.faq_search")} className="pl-9" />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("sa.faq_all_categories")}</SelectItem>
                {faqCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleExpandAll} className="text-xs">
              <ChevronsUpDown size={14} className="mr-1" /> {expandedAll ? t("sa.faq_collapse_all") : t("sa.faq_expand_all")}
            </Button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="text-sm font-medium">{selectedIds.length} {t("sa.faq_selected")}</span>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs h-7">{t("sa.faq_bulk_actions")} <ChevronDown size={12} className="ml-1" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => bulkAction("publish")}>{t("sa.faq_publish")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkAction("unpublish")}>{t("sa.faq_unpublish")}</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => bulkAction("delete")}>{t("sa.faq_delete")}</DropdownMenuItem>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{t("sa.faq_move_to_category")}</div>
                    {faqCategories.map(c => <DropdownMenuItem key={c} onClick={() => bulkAction(c)}>{c}</DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedIds([])}>{t("sa.faq_clear")}</Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-10"><Checkbox checked={selectedIds.length === filtered.length && filtered.length > 0} onCheckedChange={selectAll} /></TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead>#</TableHead>
              <TableHead>{t("sa.faq_question")}</TableHead>
              <TableHead>{t("sa.faq_category")}</TableHead>
              <TableHead>{t("sa.faq_languages")}</TableHead>
              <TableHead>{t("sa.faq_status")}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(faq => (
                <>
                  <TableRow key={faq.id} draggable onDragStart={() => handleDragStart(faq.id)} onDragOver={e => handleDragOver(e, faq.id)} onDragEnd={handleDragEnd} className={`${dragId === faq.id ? "opacity-50" : ""} cursor-move`}>
                    <TableCell><Checkbox checked={selectedIds.includes(faq.id)} onCheckedChange={() => toggleSelect(faq.id)} /></TableCell>
                    <TableCell><GripVertical size={14} className="text-muted-foreground" /></TableCell>
                    <TableCell className="text-muted-foreground">{faq.order}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleExpand(faq.id)} className="flex items-center gap-2 text-left font-medium max-w-xs">
                        {expandedIds.includes(faq.id) ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
                        <span className="truncate">{faq.question.en}</span>
                      </button>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{faq.category}</Badge></TableCell>
                    <TableCell><div className="flex gap-1">{Object.keys(faq.question).map(l => <span key={l} className="text-xs bg-secondary px-1.5 py-0.5 rounded">{l.toUpperCase()}</span>)}</div></TableCell>
                    <TableCell><Badge variant={faq.published ? "default" : "secondary"}>{faq.published ? t("sa.faq_published") : t("sa.faq_draft")}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(faq)}><Pencil size={14} className="mr-2" /> {t("sa.faq_edit")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setFaqs(f => f.filter(x => x.id !== faq.id))}><Trash2 size={14} className="mr-2" /> {t("sa.faq_delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedIds.includes(faq.id) && (
                    <TableRow key={`${faq.id}-expanded`}>
                      <TableCell colSpan={8} className="bg-secondary/20 border-b border-border/30">
                        <div className="p-4 text-sm text-muted-foreground prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer.en || `<p>${t("sa.faq_no_answer")}</p>` }} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? t("sa.faq_edit_faq") : t("sa.faq_create_faq")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("sa.faq_category")}</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{faqCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("sa.faq_display_order")}</Label><Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 1 }))} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.published} onCheckedChange={v => setForm(f => ({ ...f, published: v }))} />
              <Label>{t("sa.faq_published")}</Label>
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2"><Globe size={14} /> {t("sa.faq_translations")}</Label>
              <Select onValueChange={addLang}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder={t("sa.faq_add_language")} /></SelectTrigger>
                <SelectContent>{languages.filter(l => !form.question[l] && form.question[l] !== "").map(l => <SelectItem key={l} value={l}>{langLabels[l]}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <Tabs value={activeLang} onValueChange={setActiveLang}>
              <TabsList>{Object.keys(form.question).map(l => <TabsTrigger key={l} value={l} className="text-xs">{langLabels[l]}</TabsTrigger>)}</TabsList>
              {Object.keys(form.question).map(l => (
                <TabsContent key={l} value={l} className="space-y-4">
                  <div><Label>{t("sa.faq_question_label")} ({langLabels[l]})</Label><Input value={form.question[l] || ""} onChange={e => setForm(f => ({ ...f, question: { ...f.question, [l]: e.target.value } }))} placeholder={t("sa.faq_enter_question")} /></div>
                  <div><Label>{t("sa.faq_answer_label")} ({langLabels[l]})</Label>
                    <HtmlEditor value={form.answer[l] || ""} onChange={v => setForm(f => ({ ...f, answer: { ...f.answer, [l]: v } }))} placeholder={`${t("sa.faq_answer_label")} ${langLabels[l]}...`} rows={8} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => setEditorOpen(false)}>{t("sa.faq_cancel")}</Button>
              <Button onClick={save}>{editing ? t("sa.faq_update") : t("sa.faq_create")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default FAQPages;
