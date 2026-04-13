"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MoreVertical, Eye, UserCheck, Ban, Pencil, Plus, Upload } from "lucide-react";

import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const countries = [
  { name: "United States", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "France", code: "+33" },
  { name: "Germany", code: "+49" },
  { name: "Spain", code: "+34" },
];
const statusColor = {
  Active: "bg-green-500/10 text-green-500 border-green-500/20",
  Trial: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Suspended: "bg-primary/10 text-primary border-primary/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
};
const defaultForm = {
  id: null, adminName: "", adminEmail: "", name: "", email: "", phone: "", country: "", address: "",
  vatNumber: "", tradeNumber: "", type: "direct", status: "active", planId: "", defaultLanguageId: "",
  billingDate: "", billingNextDate: "", logo: null, logoPreview: null,
};

const cap = (v) => v ? `${v[0].toUpperCase()}${v.slice(1)}` : "";
const fmtDate = (v) => v ? new Date(v).toISOString().slice(0, 10) : "";
const money = (v) => `$${Number(v || 0)}`;
const mediaUrl = (v) => (!v ? null : v.startsWith("/uploads/") ? `${apiBase}${v}` : v);

function normalizeCompany(item) {
  return {
    id: item.id,
    company: item.name,
    fullName: item.admin?.name || "",
    adminEmail: item.admin?.email || "",
    type: item.type === "agency" ? "Agency Child" : "Direct",
    typeRaw: item.type || "direct",
    plan: item.plan?.name || "-",
    planId: item.plan?.id ? String(item.plan.id) : "",
    status: cap(item.status),
    statusRaw: item.status || "active",
    mrr: money(item.mrr),
    locations: item.locations || 0,
    apiUsage: String(item.apiUsageCount ?? 0),
    created: fmtDate(item.createdAt),
    email: item.email || "",
    phone: item.phone || "",
    country: item.country || "",
    vatNumber: item.vatNumber || "",
    tradeNumber: item.tradeNumber || "",
    address: item.address || "",
    defaultLanguage: item.defaultLanguage?.code || "",
    defaultLanguageId: item.defaultLanguage?.id ? String(item.defaultLanguage.id) : "",
    logo: item.logo || null,
    billingDate: fmtDate(item.billingDate),
    billingNextDate: fmtDate(item.billingNextDate),
  };
}

export default function Accounts() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const editFileRef = useRef(null);

  const [accounts, setAccounts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewAccount, setViewAccount] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(defaultForm);
  const [editForm, setEditForm] = useState(defaultForm);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [companiesRes, plansRes, langsRes] = await Promise.all([
        fetch(`${apiBase}/superadmin/companies`, { credentials: "include" }),
        fetch(`${apiBase}/superadmin/plan-settings`, { credentials: "include" }),
        fetch(`${apiBase}/superadmin/language-settings`, { credentials: "include" }),
      ]);
      if (!companiesRes.ok || !plansRes.ok || !langsRes.ok) throw new Error("Failed to load accounts data");
      const companies = await companiesRes.json();
      const planPayload = await plansRes.json();
      const langPayload = await langsRes.json();
      setAccounts((companies.data || []).map(normalizeCompany));
      setPlans(Array.isArray(planPayload) ? planPayload : planPayload.data || []);
      setLanguages((langPayload.data || []).filter((x) => !x.status || x.status === "Active"));
    } catch (e) {
      setError(e.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const setFormValue = (setter, key, value) => setter((s) => ({ ...s, [key]: value }));
  const uploadLogo = (event, isEdit) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      (isEdit ? setEditForm : setCreateForm)((s) => ({ ...s, logo: result, logoPreview: result }));
    };
    reader.readAsDataURL(file);
  };

  const buildPayload = (form, isEdit = false) => {
    const code = countries.find((c) => c.name === form.country)?.code || "";
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone ? `${code}${form.phone.trim()}` : "",
      country: form.country || undefined,
      address: form.address || undefined,
      vatNumber: form.vatNumber || undefined,
      tradeNumber: form.tradeNumber || undefined,
      logo: form.logo,
      type: form.type,
      status: form.status,
      planId: form.planId ? Number(form.planId) : null,
      defaultLanguageId: form.defaultLanguageId ? Number(form.defaultLanguageId) : null,
      billingDate: form.billingDate || null,
      billingNextDate: form.billingNextDate || null,
    };
    if (!isEdit) {
      payload.adminName = form.adminName.trim();
      payload.adminEmail = form.adminEmail.trim() || undefined;
      payload.locations = 1;
    }
    return payload;
  };

  const submitCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/superadmin/companies`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(createForm)),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || "Failed to create account");
      toast({ title: "Account created", description: payload.message || "Company created successfully." });
      setShowCreate(false);
      setCreateForm(defaultForm);
      await loadData();
    } catch (e) {
      toast({ title: "Create failed", description: e.message || "Failed to create account." });
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    if (!editAccount) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/superadmin/companies/${editAccount.id}`, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(editForm, true)),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || "Failed to update account");
      toast({ title: "Account updated", description: payload.message || "Company updated successfully." });
      setEditAccount(null);
      await loadData();
    } catch (e) {
      toast({ title: "Update failed", description: e.message || "Failed to update account." });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (account) => {
    const nextStatus = account.statusRaw === "suspended" ? "active" : "suspended";
    try {
      const res = await fetch(`${apiBase}/superadmin/companies/${account.id}/status`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || "Failed to update status");
      toast({ title: "Status updated", description: payload.message || "Company status updated." });
      await loadData();
    } catch (e) {
      toast({ title: "Status update failed", description: e.message || "Failed to update status." });
    }
  };

  const impersonate = async (account) => {
    try {
      const res = await fetch(`${apiBase}/superadmin/companies/${account.id}/impersonate`, {
        method: "POST", credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || "Failed to impersonate account");
      toast({ title: "Impersonation ready", description: payload.message || "Impersonation token created." });
    } catch (e) {
      toast({ title: "Impersonation failed", description: e.message || "Failed to impersonate account." });
    }
  };

  const openEdit = (account) => {
    setEditAccount(account);
    setEditForm({
      id: account.id,
      adminName: account.fullName,
      adminEmail: account.adminEmail,
      name: account.company,
      email: account.email,
      phone: account.phone.replace(/^\+\d+/, ""),
      country: account.country,
      address: account.address,
      vatNumber: account.vatNumber,
      tradeNumber: account.tradeNumber,
      type: account.typeRaw,
      status: account.statusRaw,
      planId: account.planId,
      defaultLanguageId: account.defaultLanguageId,
      billingDate: account.billingDate,
      billingNextDate: account.billingNextDate,
      logo: account.logo,
      logoPreview: account.logo,
    });
  };

  const filtered = accounts.filter((a) => {
    const matchSearch = a.company.toLowerCase().includes(search.toLowerCase()) || a.fullName.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.statusRaw === statusFilter;
    const matchType = typeFilter === "all" || a.typeRaw === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const renderForm = (form, setForm, isEdit) => (
    <div className="space-y-4">
      <div>
        <Label>{t("sa.acc_logo")}</Label>
        <div className="mt-2 flex items-center gap-4">
          <div className="h-20 w-20 rounded-lg border border-border/50 bg-secondary flex items-center justify-center overflow-hidden">
            {form.logoPreview ? <img src={mediaUrl(form.logoPreview)} alt="Logo" className="w-full h-full object-contain" /> : <Upload size={18} className="text-muted-foreground" />}
          </div>
          <Button type="button" variant="outline" className="border-border/50" onClick={() => (isEdit ? editFileRef : fileRef).current?.click()}>Upload</Button>
          <input type="file" ref={isEdit ? editFileRef : fileRef} accept="image/*" className="hidden" onChange={(e) => uploadLogo(e, isEdit)} />
        </div>
      </div>
      {!isEdit && <><div><Label>{t("sa.acc_full_name")}</Label><Input value={form.adminName} onChange={(e) => setFormValue(setForm, "adminName", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div><div><Label>Admin Email</Label><Input value={form.adminEmail} onChange={(e) => setFormValue(setForm, "adminEmail", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div></>}
      {isEdit && <div><Label>{t("sa.acc_full_name")}</Label><Input value={form.adminName} disabled className="mt-1 bg-secondary border-border/50 opacity-70" /></div>}
      <div><Label>{t("sa.acc_company_name")}</Label><Input value={form.name} onChange={(e) => setFormValue(setForm, "name", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>{t("sa.acc_vat")}</Label><Input value={form.vatNumber} onChange={(e) => setFormValue(setForm, "vatNumber", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div><div><Label>{t("sa.acc_trade")}</Label><Input value={form.tradeNumber} onChange={(e) => setFormValue(setForm, "tradeNumber", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div></div>
      <div><Label>{t("sa.acc_email")}</Label><Input value={form.email} onChange={(e) => setFormValue(setForm, "email", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div>
      <div><Label>{t("sa.acc_country")}</Label><Select value={form.country || "__empty__"} onValueChange={(v) => setFormValue(setForm, "country", v === "__empty__" ? "" : v)}><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_select_country")} /></SelectTrigger><SelectContent><SelectItem value="__empty__">-</SelectItem>{countries.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>{t("sa.acc_phone")}</Label><Input value={form.phone} onChange={(e) => setFormValue(setForm, "phone", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div>
      <div><Label>{t("sa.acc_address")}</Label><Input value={form.address} onChange={(e) => setFormValue(setForm, "address", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>{t("sa.acc_default_lang")}</Label><Select value={form.defaultLanguageId || "__empty__"} onValueChange={(v) => setFormValue(setForm, "defaultLanguageId", v === "__empty__" ? "" : v)}><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__empty__">-</SelectItem>{languages.map((l) => <SelectItem key={l.id} value={String(l.id)}>{(l.code || l.name || "").toUpperCase()}</SelectItem>)}</SelectContent></Select></div><div><Label>{t("sa.acc_status")}</Label><Select value={form.status} onValueChange={(v) => setFormValue(setForm, "status", v)}><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">{t("sa.acc_active")}</SelectItem><SelectItem value="trial">{t("sa.acc_trial")}</SelectItem><SelectItem value="suspended">{t("sa.acc_suspended")}</SelectItem><SelectItem value="cancelled">{t("sa.acc_cancelled")}</SelectItem></SelectContent></Select></div></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>{t("sa.acc_type")}</Label><Select value={form.type} onValueChange={(v) => setFormValue(setForm, "type", v)}><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="direct">{t("sa.acc_direct")}</SelectItem><SelectItem value="agency">{t("sa.acc_agency_child")}</SelectItem></SelectContent></Select></div><div><Label>{t("sa.acc_plan")}</Label><Select value={form.planId || "__empty__"} onValueChange={(v) => setFormValue(setForm, "planId", v === "__empty__" ? "" : v)}><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__empty__">-</SelectItem>{plans.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="grid grid-cols-2 gap-4"><div><Label>{t("sa.acc_payment_date")}</Label><Input type="date" value={form.billingDate} onChange={(e) => setFormValue(setForm, "billingDate", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div><div><Label>{t("sa.acc_next_payment")}</Label><Input type="date" value={form.billingNextDate} onChange={(e) => setFormValue(setForm, "billingNextDate", e.target.value)} className="mt-1 bg-secondary border-border/50" /></div></div>
    </div>
  );

  return (
    <SuperAdminLayout title={t("sa.acc_title")} subtitle={t("sa.acc_subtitle")}>
      {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t("sa.acc_search")} className="pl-9 bg-secondary border-border/50" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_status")} /></SelectTrigger><SelectContent><SelectItem value="all">{t("sa.acc_all_status")}</SelectItem><SelectItem value="active">{t("sa.acc_active")}</SelectItem><SelectItem value="trial">{t("sa.acc_trial")}</SelectItem><SelectItem value="suspended">{t("sa.acc_suspended")}</SelectItem><SelectItem value="cancelled">{t("sa.acc_cancelled")}</SelectItem></SelectContent></Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-40 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_type")} /></SelectTrigger><SelectContent><SelectItem value="all">{t("sa.acc_all_types")}</SelectItem><SelectItem value="direct">{t("sa.acc_direct")}</SelectItem><SelectItem value="agency">{t("sa.acc_agency_child")}</SelectItem></SelectContent></Select>
        <Button size="sm" onClick={() => { setCreateForm(defaultForm); setShowCreate(true); }}><Plus size={14} className="mr-2" />{t("sa.acc_create")}</Button>
      </div>

      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="border-border/50 hover:bg-transparent"><TableHead>{t("sa.acc_company")}</TableHead><TableHead>{t("sa.acc_type")}</TableHead><TableHead>{t("sa.acc_plan")}</TableHead><TableHead>{t("sa.acc_status")}</TableHead><TableHead>{t("sa.acc_mrr")}</TableHead><TableHead className="hidden lg:table-cell">{t("sa.acc_locations")}</TableHead><TableHead className="hidden lg:table-cell">{t("sa.acc_api_usage")}</TableHead><TableHead className="hidden md:table-cell">{t("sa.acc_created")}</TableHead><TableHead>{t("sa.acc_actions")}</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Loading accounts...</TableCell></TableRow> : filtered.length === 0 ? <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No accounts found.</TableCell></TableRow> : filtered.map((a) => (
                <TableRow key={a.id} className="border-border/50">
                  <TableCell className="font-medium">{a.company}</TableCell>
                  <TableCell><Badge variant="outline" className="border-border/50 text-muted-foreground">{a.type}</Badge></TableCell>
                  <TableCell>{a.plan}</TableCell>
                  <TableCell><Badge className={statusColor[a.status] || statusColor.Active}>{a.status}</Badge></TableCell>
                  <TableCell>{a.mrr}</TableCell>
                  <TableCell className="hidden lg:table-cell">{a.locations}</TableCell>
                  <TableCell className="hidden lg:table-cell">{a.apiUsage}</TableCell>
                  <TableCell className="hidden md:table-cell">{a.created}</TableCell>
                  <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical size={16} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setViewAccount(a)}><Eye size={14} className="mr-2" />{t("sa.acc_view")}</DropdownMenuItem><DropdownMenuItem onClick={() => openEdit(a)}><Pencil size={14} className="mr-2" />{t("sa.acc_edit")}</DropdownMenuItem><DropdownMenuItem onClick={() => impersonate(a)}><UserCheck size={14} className="mr-2" />{t("sa.acc_impersonate")}</DropdownMenuItem><DropdownMenuItem className="text-primary" onClick={() => updateStatus(a)}><Ban size={14} className="mr-2" />{a.statusRaw === "suspended" ? t("sa.acc_active") : t("sa.acc_suspend")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!viewAccount} onOpenChange={() => setViewAccount(null)}>
        <SheetContent className="bg-card border-border/50 sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{t("sa.acc_details")}</SheetTitle></SheetHeader>
          {viewAccount && <div className="space-y-4 mt-6">{viewAccount.logo && <div className="flex justify-center"><div className="h-16 w-16 rounded-lg border border-border/50 bg-secondary overflow-hidden"><img src={mediaUrl(viewAccount.logo)} alt="Logo" className="w-full h-full object-contain" /></div></div>}{[{ label: t("sa.acc_full_name"), value: viewAccount.fullName || "-" }, { label: t("sa.acc_company"), value: viewAccount.company }, { label: t("sa.acc_email"), value: viewAccount.email || "-" }, { label: t("sa.acc_country"), value: viewAccount.country || "-" }, { label: t("sa.acc_phone"), value: viewAccount.phone || "-" }, { label: t("sa.acc_address"), value: viewAccount.address || "-" }, { label: t("sa.acc_type"), value: viewAccount.type }, { label: t("sa.acc_plan"), value: viewAccount.plan }, { label: t("sa.acc_mrr"), value: viewAccount.mrr }].map((item) => <div key={item.label} className="flex justify-between border-b border-border/50 pb-2 gap-4"><span className="text-sm text-muted-foreground">{item.label}</span><span className="text-sm font-medium text-right">{item.value}</span></div>)}</div>}
        </SheetContent>
      </Sheet>

      <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("sa.acc_edit_title")}</DialogTitle></DialogHeader>
          {renderForm(editForm, setEditForm, true)}
          <DialogFooter><Button variant="outline" onClick={() => setEditAccount(null)}>{t("sa.acc_cancel")}</Button><Button onClick={submitEdit} disabled={saving}>{t("sa.acc_save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border/50 sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("sa.acc_create_new")}</DialogTitle></DialogHeader>
          {renderForm(createForm, setCreateForm, false)}
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>{t("sa.acc_cancel")}</Button><Button onClick={submitCreate} disabled={saving}>{t("sa.acc_create")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}
