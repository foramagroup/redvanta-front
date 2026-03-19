"use client";

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
import { Search, MoreVertical, Eye, UserCheck, Ban, Pencil, Plus, Upload, Crop, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

const countries = [
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Romania", code: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
];

const planPricing = {
  starter: { amount: "$49" },
  growth: { amount: "$149" },
  pro: { amount: "$499" },
  agency: { amount: "$999" },
};

const accountsData = [
  { id: 1, company: "Urban Bites NYC", fullName: "John Smith", type: "Direct", plan: "Pro", status: "Active", mrr: "$499", locations: 4, apiUsage: "12.4K", created: "2025-03-12", email: "admin@urbanbites.com", phone: "+1-212-555-0101", country: "United States", vatNumber: "US123456789", tradeNumber: "TRD-001", address: "123 Broadway, New York, NY 10001", defaultLanguage: "en", logo: null },
  { id: 2, company: "Glow Beauty Co", fullName: "Marie Dupont", type: "Agency Child", plan: "Growth", status: "Active", mrr: "$249", locations: 2, apiUsage: "5.2K", created: "2025-05-20", email: "hello@glowbeauty.com", phone: "+33-1-55-02-0202", country: "France", vatNumber: "FR87654321", tradeNumber: "TRD-002", address: "15 Rue de Rivoli, Paris", defaultLanguage: "fr", logo: null },
  { id: 3, company: "FreshFit Gym", fullName: "Alex Turner", type: "Direct", plan: "Starter", status: "Trial", mrr: "$0", locations: 1, apiUsage: "820", created: "2026-02-10", email: "ops@freshfit.com", phone: "+1-415-555-0303", country: "United States", vatNumber: "", tradeNumber: "", address: "789 Market St, San Francisco", defaultLanguage: "en", logo: null },
  { id: 4, company: "CloudDine Group", fullName: "Sarah Chen", type: "Agency Child", plan: "Agency", status: "Active", mrr: "$999", locations: 12, apiUsage: "48.1K", created: "2024-11-05", email: "tech@clouddine.com", phone: "+44-20-7946-0404", country: "United Kingdom", vatNumber: "GB112233445", tradeNumber: "TRD-004", address: "10 Downing St, London", defaultLanguage: "en", logo: null },
  { id: 5, company: "PetPals Clinic", fullName: "Carlos Ruiz", type: "Direct", plan: "Growth", status: "Suspended", mrr: "$249", locations: 3, apiUsage: "0", created: "2025-08-15", email: "info@petpals.com", phone: "+34-91-555-0505", country: "Spain", vatNumber: "ES998877665", tradeNumber: "TRD-005", address: "Calle Mayor 5, Madrid", defaultLanguage: "es", logo: null },
  { id: 6, company: "Metro Auto Care", fullName: "Hans Mueller", type: "Direct", plan: "Pro", status: "Cancelled", mrr: "$0", locations: 6, apiUsage: "0", created: "2024-06-22", email: "admin@metroauto.com", phone: "+49-30-555-0606", country: "Germany", vatNumber: "DE556677889", tradeNumber: "TRD-006", address: "Friedrichstraße 43, Berlin", defaultLanguage: "de", logo: null },
];

const statusColor = {
  Active: "bg-green-500/10 text-green-500 border-green-500/20",
  Trial: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Suspended: "bg-primary/10 text-primary border-primary/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

const Accounts = () => {
  const { t } = useLanguage();
  const [impersonating, setImpersonating] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewAccount, setViewAccount] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoScale, setLogoScale] = useState([100]);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef(null);
  
  const [editCountry, setEditCountry] = useState("");
  const [editPhoneCode, setEditPhoneCode] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editLogoPreview, setEditLogoPreview] = useState(null);
  const [editLogoScale, setEditLogoScale] = useState([100]);
  const editFileInputRef = useRef(null);

  const handleCountryChange = (country, isEdit = false) => {
    const c = countries.find(co => co.name === country);
    if (isEdit) {
      setEditCountry(country);
      setEditPhoneCode(c?.code || "");
    } else {
      setSelectedCountry(country);
      setPhoneCode(c?.code || "");
    }
  };

  const handleLogoUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) setEditLogoPreview(reader.result);
        else setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = accountsData.filter(a => {
    const matchSearch = a.company.toLowerCase().includes(search.toLowerCase()) || a.fullName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status.toLowerCase() === statusFilter;
    const matchType = typeFilter === "all" || (typeFilter === "direct" ? a.type === "Direct" : a.type === "Agency Child");
    return matchSearch && matchStatus && matchType;
  });

  const openEdit = (a) => {
    setEditAccount(a);
    setEditCountry(a.country);
    const c = countries.find(co => co.name === a.country);
    setEditPhoneCode(c?.code || "");
    setEditPlan(a.plan.toLowerCase());
    setEditLogoPreview(a.logo);
    setEditLogoScale([100]);
  };

  const LogoUploadSection = ({ preview, scale, onScaleChange, onUpload, inputRef, isEdit = false }) => (
    <div>
      <Label>{t("sa.acc_logo")}</Label>
      <div className="mt-1 flex items-start gap-4">
        <div className="h-20 w-20 rounded-lg border border-border/50 bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            <img src={preview} alt="Logo" className="object-contain" style={{ transform: `scale(${scale[0] / 100})`, width: '100%', height: '100%' }} />
          ) : (
            <Upload size={20} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input type="file" ref={inputRef} accept="image/*" className="hidden" onChange={(e) => onUpload(e, isEdit)} />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" className="border-border/50" onClick={() => inputRef.current?.click()}>
              <Upload size={12} className="mr-1" />{t("sa.acc_upload")}
            </Button>
            {preview && (
              <Button type="button" size="sm" variant="outline" className="border-border/50" onClick={() => setShowCropModal(true)}>
                <Crop size={12} className="mr-1" />{t("sa.acc_crop")}
              </Button>
            )}
          </div>
          {preview && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t("sa.acc_resize")}</Label>
              <Slider value={scale} onValueChange={onScaleChange} min={20} max={200} step={5} className="w-full" />
              <span className="text-xs text-muted-foreground">{scale[0]}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const PlanDependentFields = ({ plan }) => {
    if (!plan || !planPricing[plan]) return null;
    return (
      <div className="grid grid-cols-3 gap-3 p-3 bg-secondary/50 rounded-lg border border-border/30">
        <div>
          <Label className="text-xs text-muted-foreground">{t("sa.acc_amount")}</Label>
          <Input value={planPricing[plan].amount} readOnly className="mt-1 bg-secondary border-border/50 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t("sa.acc_payment_date")}</Label>
          <Input type="date" defaultValue="2026-03-01" className="mt-1 bg-secondary border-border/50 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t("sa.acc_next_payment")}</Label>
          <Input type="date" defaultValue="2026-04-01" className="mt-1 bg-secondary border-border/50 text-sm" />
        </div>
      </div>
    );
  };

  return (
    <SuperAdminLayout title={t("sa.acc_title")} subtitle={t("sa.acc_subtitle")}>
      {impersonating && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">⚠️ {t("sa.acc_impersonating")} <strong>{impersonating}</strong></span>
          <Button size="sm" variant="outline" onClick={() => setImpersonating(null)} className="border-primary/30 text-primary hover:bg-primary/10">{t("sa.acc_exit")}</Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("sa.acc_search")} className="pl-9 bg-secondary border-border/50" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_status")} /></SelectTrigger>
           <SelectContent>
            <SelectItem value="all">{t("sa.acc_all_status")}</SelectItem>
            <SelectItem value="active">{t("sa.acc_active")}</SelectItem>
            <SelectItem value="trial">{t("sa.acc_trial")}</SelectItem>
            <SelectItem value="suspended">{t("sa.acc_suspended")}</SelectItem>
            <SelectItem value="cancelled">{t("sa.acc_cancelled")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_type")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("sa.acc_all_types")}</SelectItem>
            <SelectItem value="direct">{t("sa.acc_direct")}</SelectItem>
            <SelectItem value="agency">{t("sa.acc_agency_child")}</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => { setShowCreate(true); setSelectedCountry(""); setPhoneCode(""); setSelectedPlan(""); setLogoPreview(null); setLogoScale([100]); }}>
          <Plus size={14} className="mr-2" />{t("sa.acc_create")}
        </Button>
      </div>

      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.acc_company")}</TableHead><TableHead>{t("sa.acc_type")}</TableHead><TableHead>{t("sa.acc_plan")}</TableHead>
                <TableHead>{t("sa.acc_status")}</TableHead><TableHead>{t("sa.acc_mrr")}</TableHead><TableHead className="hidden lg:table-cell">{t("sa.acc_locations")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("sa.acc_api_usage")}</TableHead><TableHead className="hidden md:table-cell">{t("sa.acc_created")}</TableHead><TableHead>{t("sa.acc_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id} className="border-border/50">
                  <TableCell className="font-medium">{a.company}</TableCell>
                  <TableCell><Badge variant="outline" className="border-border/50 text-muted-foreground">{a.type}</Badge></TableCell>
                  <TableCell>{a.plan}</TableCell>
                  <TableCell><Badge className={statusColor[a.status]}>{a.status}</Badge></TableCell>
                  <TableCell>{a.mrr}</TableCell>
                  <TableCell className="hidden lg:table-cell">{a.locations}</TableCell>
                  <TableCell className="hidden lg:table-cell">{a.apiUsage}</TableCell>
                  <TableCell className="hidden md:table-cell">{a.created}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical size={16} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewAccount(a)}><Eye size={14} className="mr-2" />{t("sa.acc_view")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(a)}><Pencil size={14} className="mr-2" />{t("sa.acc_edit")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setImpersonating(a.company)}><UserCheck size={14} className="mr-2" />{t("sa.acc_impersonate")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-primary"><Ban size={14} className="mr-2" />{t("sa.acc_suspend")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Account Sheet */}
      <Sheet open={!!viewAccount} onOpenChange={() => setViewAccount(null)}>
        <SheetContent className="bg-card border-border/50 sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{t("sa.acc_details")}</SheetTitle></SheetHeader>
          {viewAccount && (
            <div className="space-y-6 mt-6">
              {viewAccount.logo && (
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-lg border border-border/50 bg-secondary overflow-hidden">
                    <img src={viewAccount.logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {[
                  { labelKey: "sa.acc_full_name", value: viewAccount.fullName },
                  { labelKey: "sa.acc_company", value: viewAccount.company },
                  { labelKey: "sa.acc_vat", value: viewAccount.vatNumber || "—" },
                  { labelKey: "sa.acc_trade", value: viewAccount.tradeNumber || "—" },
                  { labelKey: "sa.acc_email", value: viewAccount.email },
                  { labelKey: "sa.acc_country", value: viewAccount.country },
                  { labelKey: "sa.acc_phone", value: viewAccount.phone },
                  { labelKey: "sa.acc_address", value: viewAccount.address || "—" },
                  { labelKey: "sa.acc_default_lang", value: viewAccount.defaultLanguage?.toUpperCase() || "—" },
                  { labelKey: "sa.acc_type", value: viewAccount.type },
                  { labelKey: "sa.acc_plan", value: viewAccount.plan },
                  { labelKey: "sa.acc_mrr", value: viewAccount.mrr },
                  { labelKey: "sa.acc_locations", value: String(viewAccount.locations) },
                  { labelKey: "sa.acc_api_usage", value: viewAccount.apiUsage },
                  { labelKey: "sa.acc_created", value: viewAccount.created },
                ].map(item => (
                  <div key={item.labelKey} className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">{t(item.labelKey)}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("sa.acc_status")}</span>
                  <Badge className={statusColor[viewAccount.status]}>{viewAccount.status}</Badge>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Account Dialog */}
      <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
        <DialogContent className="bg-card border-border/50 sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("sa.acc_edit_title")}</DialogTitle></DialogHeader>
          {editAccount && (
            <div className="space-y-4">
              <LogoUploadSection preview={editLogoPreview} scale={editLogoScale} onScaleChange={setEditLogoScale} onUpload={handleLogoUpload} inputRef={editFileInputRef} isEdit />
              <div><Label>{t("sa.acc_full_name")}</Label><Input defaultValue={editAccount.fullName} className="mt-1 bg-secondary border-border/50" /></div>
              <div><Label>{t("sa.acc_company_name")}</Label><Input defaultValue={editAccount.company} className="mt-1 bg-secondary border-border/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("sa.acc_vat")}</Label><Input defaultValue={editAccount.vatNumber} className="mt-1 bg-secondary border-border/50" /></div>
                <div><Label>{t("sa.acc_trade")}</Label><Input defaultValue={editAccount.tradeNumber} className="mt-1 bg-secondary border-border/50" /></div>
              </div>
              <div><Label>{t("sa.acc_email")}</Label><Input defaultValue={editAccount.email} className="mt-1 bg-secondary border-border/50" /></div>
              <div><Label>{t("sa.acc_country")}</Label>
                <Select value={editCountry} onValueChange={(v) => handleCountryChange(v, true)}>
                  <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_select_country")} /></SelectTrigger>
                  <SelectContent>{countries.map(c => <SelectItem key={c.name} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("sa.acc_phone")}</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={editPhoneCode} readOnly className="w-20 bg-secondary border-border/50 text-center" />
                  <Input defaultValue={editAccount.phone.replace(/^\+\d+-?/, '')} className="flex-1 bg-secondary border-border/50" />
                </div>
              </div>
              <div><Label>{t("sa.acc_address")}</Label><Input defaultValue={editAccount.address} className="mt-1 bg-secondary border-border/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("sa.acc_default_lang")}</Label>
                  <Select defaultValue={editAccount.defaultLanguage}>
                    <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                     <SelectItem value="en">{t("sa.acc_lang_en")}</SelectItem><SelectItem value="fr">{t("sa.acc_lang_fr")}</SelectItem>
                     <SelectItem value="de">{t("sa.acc_lang_de")}</SelectItem><SelectItem value="es">{t("sa.acc_lang_es")}</SelectItem>
                     <SelectItem value="ro">{t("sa.acc_lang_ro")}</SelectItem><SelectItem value="ru">{t("sa.acc_lang_ru")}</SelectItem>
                     <SelectItem value="ar">{t("sa.acc_lang_ar")}</SelectItem><SelectItem value="zh">{t("sa.acc_lang_zh")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{t("sa.acc_status")}</Label>
                  <Select defaultValue={editAccount.status.toLowerCase()}>
                    <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">{t("sa.acc_active")}</SelectItem><SelectItem value="trial">{t("sa.acc_trial")}</SelectItem><SelectItem value="suspended">{t("sa.acc_suspended")}</SelectItem><SelectItem value="cancelled">{t("sa.acc_cancelled")}</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t("sa.acc_type")}</Label>
                 <Select defaultValue={editAccount.type === "Direct" ? "direct" : "agency"}>
                   <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                   <SelectContent><SelectItem value="direct">{t("sa.acc_direct")}</SelectItem><SelectItem value="agency">{t("sa.acc_agency_child")}</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>{t("sa.acc_plan")}</Label>
                  <Select value={editPlan} onValueChange={setEditPlan}>
                    <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                   <SelectContent><SelectItem value="starter">{t("sa.acc_starter")}</SelectItem><SelectItem value="growth">{t("sa.acc_growth")}</SelectItem><SelectItem value="pro">{t("sa.acc_pro")}</SelectItem><SelectItem value="agency">{t("sa.acc_agency")}</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <PlanDependentFields plan={editPlan} />
              <div><Label>{t("sa.acc_locations")}</Label><Input type="number" defaultValue={editAccount.locations} className="mt-1 bg-secondary border-border/50" /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditAccount(null)}>{t("sa.acc_cancel")}</Button><Button>{t("sa.acc_save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Account Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border/50 sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("sa.acc_create_new")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <LogoUploadSection preview={logoPreview} scale={logoScale} onScaleChange={setLogoScale} onUpload={handleLogoUpload} inputRef={fileInputRef} />
            <div><Label>{t("sa.acc_full_name")}</Label><Input placeholder={t("sa.acc_enter_name")} className="mt-1 bg-secondary border-border/50" /></div>
            <div><Label>{t("sa.acc_company_name")}</Label><Input placeholder={t("sa.acc_enter_company")} className="mt-1 bg-secondary border-border/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("sa.acc_vat")}</Label><Input placeholder={t("sa.acc_vat_placeholder")} className="mt-1 bg-secondary border-border/50" /></div>
              <div><Label>{t("sa.acc_trade")}</Label><Input placeholder={t("sa.acc_trade_placeholder")} className="mt-1 bg-secondary border-border/50" /></div>
            </div>
            <div><Label>{t("sa.acc_email")}</Label><Input type="email" placeholder={t("sa.acc_email_placeholder")} className="mt-1 bg-secondary border-border/50" /></div>
            <div><Label>{t("sa.acc_country")}</Label>
              <Select value={selectedCountry} onValueChange={(v) => handleCountryChange(v)}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_select_country")} /></SelectTrigger>
                <SelectContent>{countries.map(c => <SelectItem key={c.name} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{t("sa.acc_phone")}</Label>
              <div className="flex gap-2 mt-1">
                <Input value={phoneCode} readOnly placeholder={t("sa.acc_code")} className="w-20 bg-secondary border-border/50 text-center" />
                <Input placeholder={t("sa.acc_phone_placeholder")} className="flex-1 bg-secondary border-border/50" />
              </div>
            </div>
            <div><Label>{t("sa.acc_address")}</Label><Input placeholder={t("sa.acc_address_placeholder")} className="mt-1 bg-secondary border-border/50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("sa.acc_default_lang")}</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                     <SelectItem value="en">{t("sa.acc_lang_en")}</SelectItem><SelectItem value="fr">{t("sa.acc_lang_fr")}</SelectItem>
                     <SelectItem value="de">{t("sa.acc_lang_de")}</SelectItem><SelectItem value="es">{t("sa.acc_lang_es")}</SelectItem>
                     <SelectItem value="ro">{t("sa.acc_lang_ro")}</SelectItem><SelectItem value="ru">{t("sa.acc_lang_ru")}</SelectItem>
                     <SelectItem value="ar">{t("sa.acc_lang_ar")}</SelectItem><SelectItem value="zh">{t("sa.acc_lang_zh")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("sa.acc_status")}</Label>
                <Select defaultValue="active">
                  <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">{t("sa.acc_active")}</SelectItem><SelectItem value="trial">{t("sa.acc_trial")}</SelectItem><SelectItem value="suspended">{t("sa.acc_suspended")}</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("sa.acc_type")}</Label>
               <Select><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_select_type")} /></SelectTrigger>
                  <SelectContent><SelectItem value="direct">{t("sa.acc_direct")}</SelectItem><SelectItem value="agency">{t("sa.acc_agency_child")}</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>{t("sa.acc_plan")}</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                   <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.acc_select_plan")} /></SelectTrigger>
                   <SelectContent><SelectItem value="starter">{t("sa.acc_starter")}</SelectItem><SelectItem value="growth">{t("sa.acc_growth")}</SelectItem><SelectItem value="pro">{t("sa.acc_pro")}</SelectItem><SelectItem value="agency">{t("sa.acc_agency")}</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <PlanDependentFields plan={selectedPlan} />
            <div><Label>{t("sa.acc_locations")}</Label><Input type="number" defaultValue={1} className="mt-1 bg-secondary border-border/50" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>{t("sa.acc_cancel")}</Button><Button>{t("sa.acc_create")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.acc_crop_logo")}</DialogTitle></DialogHeader>
          <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center overflow-hidden border border-border/50">
            {(logoPreview || editLogoPreview) && (
              <img src={editAccount ? editLogoPreview || "" : logoPreview || ""} alt="Crop preview" className="max-w-full max-h-full object-contain" />
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">{t("sa.acc_crop_hint")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropModal(false)}>{t("sa.acc_cancel")}</Button>
            <Button onClick={() => setShowCropModal(false)}>{t("sa.acc_apply_crop")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default Accounts;
