"use client";

import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Download, Search, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const languageLimit = 100;
const translationLimit = 200;

const emptyLanguage = {
  code: "",
  name: "",
  native: "",
  flag: "",
  rtl: false,
  status: "Draft",
  isDefault: false,
};

const emptyKeyData = { key: "", description: "" };

const normalizeTranslations = (rows) =>
  rows.map((row) => {
    const values = row.translations.reduce((accumulator, translation) => {
      accumulator[translation.language.code] = translation.value || "";
      return accumulator;
    }, {});

    return {
      id: row.id,
      key: row.key,
      description: row.description || "",
      ...values,
    };
  });

const LanguageSettings = () => {
  const { t: tr } = useLanguage();
  const { toast } = useToast();
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingTranslations, setLoadingTranslations] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAddLang, setShowAddLang] = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);
  const [editingLang, setEditingLang] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [languageForm, setLanguageForm] = useState(emptyLanguage);
  const [newKeyData, setNewKeyData] = useState(emptyKeyData);

  const loadLanguages = async () => {
    setLoadingLanguages(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/language-settings?page=1&limit=${languageLimit}`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load languages");
      }

      setLanguages(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      setError(err.message || "Failed to load languages");
      setLanguages([]);
    } finally {
      setLoadingLanguages(false);
    }
  };

  const loadTranslations = async () => {
    setLoadingTranslations(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/language-settings/translations?page=1&limit=${translationLimit}`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load translations");
      }

      setTranslations(normalizeTranslations(Array.isArray(payload?.data) ? payload.data : []));
    } catch (err) {
      setError(err.message || "Failed to load translations");
      setTranslations([]);
    } finally {
      setLoadingTranslations(false);
    }
  };

  useEffect(() => {
    loadLanguages();
    loadTranslations();
  }, []);

  const activeLanguages = useMemo(
    () => languages.filter((language) => language.status === "Active"),
    [languages]
  );

  const filteredTranslations = useMemo(
    () =>
      translations.filter((translation) =>
        translation.key.toLowerCase().includes(searchKey.toLowerCase()) ||
        Object.values(translation).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(searchKey.toLowerCase())
        )
      ),
    [translations, searchKey]
  );

  const openAddLanguage = () => {
    setLanguageForm(emptyLanguage);
    setEditingLang(null);
    setShowAddLang(true);
  };

  const openEditLanguage = (language) => {
    setLanguageForm({
      code: language.code || "",
      name: language.name || "",
      native: language.native || "",
      flag: language.flag || "",
      rtl: Boolean(language.rtl),
      status: language.status || "Draft",
      isDefault: Boolean(language.isDefault),
    });
    setEditingLang(language);
  };

  const handleSaveLanguage = async () => {
    setError("");

    if (!languageForm.code || !languageForm.name || !languageForm.native) {
      setError("Please fill in code, language name and native name.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(editingLang?.id);
      const res = await fetch(`${apiBase}/superadmin/language-settings${isEditing ? `/${editingLang.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(languageForm),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} language`);
      }

      setShowAddLang(false);
      setEditingLang(null);
      setLanguageForm(emptyLanguage);
      await loadLanguages();
      toast({ title: isEditing ? "Language updated" : "Language created" });
    } catch (err) {
      setError(err.message || `Failed to ${editingLang ? "update" : "create"} language`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLanguage = async (language) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/language-settings/${language.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete language");
      }

      await loadLanguages();
      await loadTranslations();
      toast({ title: "Language deleted" });
    } catch (err) {
      setError(err.message || "Failed to delete language");
    }
  };

  const startEdit = (translation, languageCode) => {
    setEditingCell({ keyId: translation.id, languageCode });
    setEditValue(translation[languageCode] || "");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const language = languages.find((item) => item.code === editingCell.languageCode);
    if (!language) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/language-settings/translations/update`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyId: editingCell.keyId,
          languageId: language.id,
          value: editValue,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to update translation");
      }

      setTranslations((current) =>
        current.map((translation) =>
          translation.id === editingCell.keyId
            ? { ...translation, [editingCell.languageCode]: editValue }
            : translation
        )
      );
      toast({ title: "Translation updated" });
      cancelEdit();
    } catch (err) {
      setError(err.message || "Failed to update translation");
    } finally {
      setSaving(false);
    }
  };

  const handleAddKey = async () => {
    setError("");

    if (!newKeyData.key) {
      setError("Please enter a translation key.");
      return;
    }

    setSaving(true);

    try {
      const translationsPayload = activeLanguages.reduce((accumulator, language) => {
        if (newKeyData[language.code]) {
          accumulator[language.code] = newKeyData[language.code];
        }
        return accumulator;
      }, {});

      const res = await fetch(`${apiBase}/superadmin/language-settings/translations/key`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: newKeyData.key,
          translations: translationsPayload,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to create translation key");
      }

      setShowAddKey(false);
      setNewKeyData(emptyKeyData);
      await loadLanguages();
      await loadTranslations();
      toast({ title: "Translation key created" });
    } catch (err) {
      setError(err.message || "Failed to create translation key");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (translation) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/language-settings/translations/${translation.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete translation key");
      }

      setTranslations((current) => current.filter((item) => item.id !== translation.id));
      await loadLanguages();
      toast({ title: "Translation key deleted" });
    } catch (err) {
      setError(err.message || "Failed to delete translation key");
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(translations, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "translations.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast({ title: "Translations exported" });
  };

  return (
    <SuperAdminLayout title={tr("sa.lang_title")} subtitle={tr("sa.lang_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <Tabs defaultValue="languages">
        <TabsList className="bg-secondary border border-border/50 mb-6">
          <TabsTrigger value="languages">{tr("sa.lang_languages")}</TabsTrigger>
          <TabsTrigger value="translations">{tr("sa.lang_translations")}</TabsTrigger>
        </TabsList>

        <TabsContent value="languages">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tr("sa.lang_total")}</p><p className="text-2xl font-bold mt-1">{languages.length}</p></CardContent></Card>
            <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tr("sa.lang_active_langs")}</p><p className="text-2xl font-bold mt-1">{activeLanguages.length}</p></CardContent></Card>
            <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{tr("sa.lang_keys")}</p><p className="text-2xl font-bold mt-1">{translations.length}</p></CardContent></Card>
          </div>

          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{tr("sa.lang_languages")}</CardTitle>
              <Button size="sm" onClick={openAddLanguage} disabled={loadingLanguages}>
                <Plus size={14} className="mr-2" />
                {tr("sa.lang_add_lang")}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead></TableHead><TableHead>{tr("sa.lang_code")}</TableHead><TableHead>{tr("sa.lang_language")}</TableHead><TableHead>{tr("sa.lang_native")}</TableHead>
                    <TableHead>{tr("sa.lang_status")}</TableHead><TableHead>{tr("sa.lang_completion")}</TableHead><TableHead>{tr("sa.lang_rtl")}</TableHead><TableHead>{tr("sa.lang_default")}</TableHead><TableHead>{tr("sa.lang_actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLanguages ? (
                    <TableRow className="border-border/50">
                      <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">Loading languages...</TableCell>
                    </TableRow>
                  ) : languages.length === 0 ? (
                    <TableRow className="border-border/50">
                      <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">No languages found.</TableCell>
                    </TableRow>
                  ) : languages.map((language) => (
                    <TableRow key={language.id} className="border-border/50">
                      <TableCell className="text-lg">{language.flag || "-"}</TableCell>
                      <TableCell className="font-mono text-xs">{language.code}</TableCell>
                      <TableCell className="font-medium">{language.name}</TableCell>
                      <TableCell>{language.native}</TableCell>
                      <TableCell><Badge variant={language.status === "Active" ? "default" : "secondary"}>{language.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${language.completion || 0}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{language.completion || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{language.rtl ? <Badge variant="outline" className="text-xs">RTL</Badge> : "-"}</TableCell>
                      <TableCell>{language.isDefault ? <Badge className="bg-primary/20 text-primary">Default</Badge> : "-"}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditLanguage(language)}><Pencil size={14} /></Button>
                        {!language.isDefault ? <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteLanguage(language)}><Trash2 size={14} /></Button> : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search translation keys or values..." className="pl-10 bg-secondary border-border/50" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download size={14} className="mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => { setShowAddKey(true); setNewKeyData(emptyKeyData); }}>
                <Plus size={14} className="mr-2" />
                Add Key
              </Button>
            </div>
          </div>

          <Card className="bg-card border-border/50">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="min-w-[180px]">Key</TableHead>
                    {activeLanguages.map((language) => (
                      <TableHead key={language.id} className="min-w-[140px]">{language.flag || ""} {language.name}</TableHead>
                    ))}
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTranslations ? (
                    <TableRow className="border-border/50">
                      <TableCell colSpan={activeLanguages.length + 2} className="py-6 text-center text-muted-foreground">Loading translations...</TableCell>
                    </TableRow>
                  ) : filteredTranslations.length === 0 ? (
                    <TableRow className="border-border/50">
                      <TableCell colSpan={activeLanguages.length + 2} className="py-6 text-center text-muted-foreground">No translations found.</TableCell>
                    </TableRow>
                  ) : filteredTranslations.map((translation) => (
                    <TableRow key={translation.id} className="border-border/50">
                      <TableCell className="font-mono text-xs text-muted-foreground">{translation.key}</TableCell>
                      {activeLanguages.map((language) => (
                        <TableCell key={language.id} className="p-1">
                          {editingCell?.keyId === translation.id && editingCell?.languageCode === language.code ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 text-xs bg-secondary border-border/50"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape") cancelEdit();
                                }}
                              />
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-500" onClick={saveEdit}><Check size={12} /></Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={cancelEdit}><X size={12} /></Button>
                            </div>
                          ) : (
                            <div className="text-sm cursor-pointer hover:bg-secondary/50 rounded px-2 py-1 min-h-[28px] transition-colors" onDoubleClick={() => startEdit(translation, language.code)}>
                              {translation[language.code] || <span className="text-muted-foreground/50 italic text-xs">- empty -</span>}
                            </div>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" onClick={() => handleDeleteKey(translation)}><Trash2 size={12} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground mt-3">Double-click on any cell to edit inline. Press Enter to save or Escape to cancel.</p>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddLang || !!editingLang} onOpenChange={() => { setShowAddLang(false); setEditingLang(null); setLanguageForm(emptyLanguage); }}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{editingLang ? "Edit Language" : "Add Language"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Language Code</Label><Input className="mt-1 bg-secondary border-border/50" placeholder="e.g., pt" value={languageForm.code} disabled={saving || Boolean(editingLang)} onChange={(e) => setLanguageForm((current) => ({ ...current, code: e.target.value }))} /></div>
            <div><Label>Language Name</Label><Input className="mt-1 bg-secondary border-border/50" placeholder="e.g., Portuguese" value={languageForm.name} disabled={saving} onChange={(e) => setLanguageForm((current) => ({ ...current, name: e.target.value }))} /></div>
            <div><Label>Native Name</Label><Input className="mt-1 bg-secondary border-border/50" placeholder="e.g., Portugues" value={languageForm.native} disabled={saving} onChange={(e) => setLanguageForm((current) => ({ ...current, native: e.target.value }))} /></div>
            <div><Label>Flag Emoji</Label><Input className="mt-1 bg-secondary border-border/50" placeholder="e.g., 🇵🇹" value={languageForm.flag} disabled={saving} onChange={(e) => setLanguageForm((current) => ({ ...current, flag: e.target.value }))} /></div>
            <div><Label>Status</Label>
              <Select value={languageForm.status} disabled={saving} onValueChange={(value) => setLanguageForm((current) => ({ ...current, status: value }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between"><Label>RTL (Right-to-Left)</Label><Switch checked={languageForm.rtl} disabled={saving} onCheckedChange={(checked) => setLanguageForm((current) => ({ ...current, rtl: checked }))} /></div>
            <div className="flex items-center justify-between"><Label>Default Language</Label><Switch checked={languageForm.isDefault} disabled={saving} onCheckedChange={(checked) => setLanguageForm((current) => ({ ...current, isDefault: checked }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowAddLang(false); setEditingLang(null); setLanguageForm(emptyLanguage); }} disabled={saving}>Cancel</Button><Button onClick={handleSaveLanguage} disabled={saving}>{saving ? "Saving..." : editingLang ? "Save" : "Add Language"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
        <DialogContent className="bg-card border-border/50 sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Translation Key</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Key</Label><Input className="mt-1 bg-secondary border-border/50" placeholder="e.g., common.submit" value={newKeyData.key} disabled={saving} onChange={(e) => setNewKeyData((current) => ({ ...current, key: e.target.value }))} /></div>
            <div><Label>Description (optional)</Label><Textarea className="mt-1 bg-secondary border-border/50" placeholder="Context for translators" value={newKeyData.description || ""} disabled={saving} onChange={(e) => setNewKeyData((current) => ({ ...current, description: e.target.value }))} /></div>
            {activeLanguages.map((language) => (
              <div key={language.id}>
                <Label>{language.flag || ""} {language.name} Value</Label>
                <Input className="mt-1 bg-secondary border-border/50" placeholder={`Translation in ${language.name}...`} value={newKeyData[language.code] || ""} disabled={saving} onChange={(e) => setNewKeyData((current) => ({ ...current, [language.code]: e.target.value }))} />
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddKey(false)} disabled={saving}>Cancel</Button><Button onClick={handleAddKey} disabled={saving}>{saving ? "Saving..." : "Add Key"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default LanguageSettings;
