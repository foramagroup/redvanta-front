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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const emptyCurrencyForm = {
  code: "",
  name: "",
  symbol: "",
  rate: "1",
  gateway: "stripe",
  position: "left_no_space",
  status: "Active",
  isDefault: false,
};

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
};

const CurrencySettings = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState([]);
  const [settings, setSettings] = useState({
    conversionMethod: "manual",
    rateProvider: "",
    apiKey: "",
    showSelector: true,
    showBoth: false,
    rounding: 2,
    lastRateUpdate: null,
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [form, setForm] = useState(emptyCurrencyForm);

  const positionOptions = [
    { value: "left_space", label: t("sa.cur_pos_left_space") },
    { value: "left_no_space", label: t("sa.cur_pos_left_no_space") },
    { value: "right_space", label: t("sa.cur_pos_right_space") },
    { value: "right_no_space", label: t("sa.cur_pos_right_no_space") },
  ];

  const gatewayOptions = [
    { value: "stripe", label: "Stripe" },
    { value: "mollie", label: "Mollie" },
    { value: "paypal", label: "PayPal" },
    { value: "manual", label: t("sa.cur_manual") },
  ];

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [currenciesRes, settingsRes] = await Promise.all([
        fetch(`${apiBase}/superadmin/currency-settings/global-currencies?page=1&limit=100`, {
          credentials: "include",
        }),
        fetch(`${apiBase}/superadmin/currency-settings/global-currency-settings`, {
          credentials: "include",
        }),
      ]);

      const currenciesPayload = await currenciesRes.json().catch(() => ({}));
      const settingsPayload = await settingsRes.json().catch(() => ({}));

      if (!currenciesRes.ok) {
        throw new Error(currenciesPayload?.message || "Failed to load currencies");
      }

      if (!settingsRes.ok) {
        throw new Error(settingsPayload?.message || "Failed to load currency settings");
      }

      setCurrencies(Array.isArray(currenciesPayload?.data) ? currenciesPayload.data : []);
      setSettings({
        conversionMethod: settingsPayload?.conversionMethod || "manual",
        rateProvider: settingsPayload?.rateProvider || "",
        apiKey: settingsPayload?.apiKey || "",
        showSelector: Boolean(settingsPayload?.showSelector),
        showBoth: Boolean(settingsPayload?.showBoth),
        rounding: settingsPayload?.rounding ?? 2,
        lastRateUpdate: settingsPayload?.lastRateUpdate || null,
      });
    } catch (err) {
      setError(err.message || "Failed to load currency data");
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCurrencies = useMemo(
    () => currencies.filter((currency) => currency.status === "Active"),
    [currencies]
  );

  const defaultCurrency = currencies.find((currency) => currency.isDefault);

  const openAdd = () => {
    setEditingCurrency(null);
    setForm(emptyCurrencyForm);
    setShowAdd(true);
  };

  const openEdit = (currency) => {
    setEditingCurrency(currency);
    setForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      rate: String(currency.rate),
      gateway: currency.gateway || "stripe",
      position: currency.symbolPosition,
      status: currency.status,
      isDefault: Boolean(currency.isDefault),
    });
    setShowEdit(true);
  };

  const handleSaveCurrency = async () => {
    setError("");

    if (!form.code || !form.name || !form.symbol || !form.rate) {
      setError("Please fill in currency code, name, symbol and rate.");
      return;
    }

    setSavingCurrency(true);

    try {
      const isEditing = Boolean(editingCurrency?.id);
      const res = await fetch(`${apiBase}/superadmin/currency-settings/global-currencies${isEditing ? `/${editingCurrency.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} currency`);
      }

      setShowAdd(false);
      setShowEdit(false);
      setEditingCurrency(null);
      setForm(emptyCurrencyForm);
      await loadData();
      toast({ title: isEditing ? t("sa.cur_updated") : t("sa.cur_added") });
    } catch (err) {
      setError(err.message || `Failed to ${editingCurrency ? "update" : "create"} currency`);
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleDeleteCurrency = async (currency) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/currency-settings/global-currencies/${currency.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete currency");
      }

      setCurrencies((current) => current.filter((item) => item.id !== currency.id));
      toast({ title: t("sa.cur_deleted") });
    } catch (err) {
      setError(err.message || "Failed to delete currency");
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/currency-settings/global-currency-settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to save currency settings");
      }

      setSettings({
        conversionMethod: payload?.conversionMethod || "manual",
        rateProvider: payload?.rateProvider || "",
        apiKey: payload?.apiKey || "",
        showSelector: Boolean(payload?.showSelector),
        showBoth: Boolean(payload?.showBoth),
        rounding: payload?.rounding ?? 2,
        lastRateUpdate: payload?.lastRateUpdate || null,
      });
      toast({ title: t("sa.cur_settings_saved") });
    } catch (err) {
      setError(err.message || "Failed to save currency settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const CurrencyFormFields = () => (
    <div className="space-y-4">
      <div><Label>{t("sa.cur_code")}</Label><Input className="mt-1 bg-secondary border-border/50" value={form.code} onChange={(e) => setForm((current) => ({ ...current, code: e.target.value }))} placeholder="e.g., CHF" disabled={savingCurrency || Boolean(editingCurrency)} /></div>
      <div><Label>{t("sa.cur_name")}</Label><Input className="mt-1 bg-secondary border-border/50" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="e.g., Swiss Franc" disabled={savingCurrency} /></div>
      <div><Label>{t("sa.cur_symbol")}</Label><Input className="mt-1 bg-secondary border-border/50" value={form.symbol} onChange={(e) => setForm((current) => ({ ...current, symbol: e.target.value }))} placeholder="e.g., CHF" disabled={savingCurrency} /></div>
      <div><Label>{t("sa.cur_exchange_rate")}</Label><Input type="number" step="0.01" className="mt-1 bg-secondary border-border/50" value={form.rate} onChange={(e) => setForm((current) => ({ ...current, rate: e.target.value }))} disabled={savingCurrency} /></div>
      <div>
        <Label>{t("sa.cur_symbol_position")}</Label>
        <Select value={form.position} onValueChange={(value) => setForm((current) => ({ ...current, position: value }))} disabled={savingCurrency}>
          <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent>{positionOptions.map((position) => <SelectItem key={position.value} value={position.value}>{position.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>{t("sa.cur_default_gateway")}</Label>
        <Select value={form.gateway} onValueChange={(value) => setForm((current) => ({ ...current, gateway: value }))} disabled={savingCurrency}>
          <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent>{gatewayOptions.map((gateway) => <SelectItem key={gateway.value} value={gateway.value}>{gateway.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>{t("sa.cur_status")}</Label>
        <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))} disabled={savingCurrency}>
          <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="Active">{t("sa.cur_st_active")}</SelectItem><SelectItem value="Draft">{t("sa.cur_st_draft")}</SelectItem><SelectItem value="Inactive">{t("sa.cur_st_inactive")}</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label>{t("sa.cur_default")}</Label>
        <Switch checked={form.isDefault} disabled={savingCurrency} onCheckedChange={(checked) => setForm((current) => ({ ...current, isDefault: checked }))} />
      </div>
    </div>
  );

  return (
    <SuperAdminLayout title={t("sa.cur_title")} subtitle={t("sa.cur_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{t("sa.cur_default_currency")}</p><p className="text-2xl font-bold mt-1">{defaultCurrency ? `${defaultCurrency.code} (${defaultCurrency.symbol})` : "-"}</p></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{t("sa.cur_active_currencies")}</p><p className="text-2xl font-bold mt-1">{activeCurrencies.length}</p></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{t("sa.cur_conversion_method")}</p><p className="text-2xl font-bold mt-1 capitalize">{settings.conversionMethod}</p></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{t("sa.cur_last_rate_update")}</p><p className="text-2xl font-bold mt-1 text-sm">{formatDate(settings.lastRateUpdate)}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-card border-border/50 lg:col-span-1">
          <CardHeader><CardTitle className="text-base">{t("sa.cur_conversion_method")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={settings.conversionMethod} onValueChange={(value) => setSettings((current) => ({ ...current, conversionMethod: value }))} className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/50">
                <RadioGroupItem value="manual" id="manual" className="mt-0.5" />
                <div><Label htmlFor="manual" className="font-medium cursor-pointer">{t("sa.cur_manual_setup")}</Label><p className="text-xs text-muted-foreground mt-1">{t("sa.cur_manual_desc")}</p></div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/50">
                <RadioGroupItem value="online" id="online" className="mt-0.5" />
                <div><Label htmlFor="online" className="font-medium cursor-pointer">{t("sa.cur_online_rate")}</Label><p className="text-xs text-muted-foreground mt-1">{t("sa.cur_online_desc")}</p></div>
              </div>
            </RadioGroup>
            {settings.conversionMethod === "online" && (
              <div className="space-y-3 pt-2">
                <div><Label>{t("sa.cur_rate_provider")}</Label><Input className="mt-1 bg-secondary border-border/50" value={settings.rateProvider} onChange={(e) => setSettings((current) => ({ ...current, rateProvider: e.target.value }))} placeholder="Open Exchange Rates" /></div>
                <div><Label>{t("sa.cur_api_key")}</Label><Input type="password" className="mt-1 bg-secondary border-border/50" value={settings.apiKey} onChange={(e) => setSettings((current) => ({ ...current, apiKey: e.target.value }))} placeholder={t("sa.cur_enter_api_key")} /></div>
                <Button variant="outline" size="sm" className="w-full" onClick={handleSaveSettings} disabled={savingSettings}><RefreshCw size={14} className="mr-2" />{savingSettings ? t("sa.cur_save") : t("sa.cur_fetch_rates")}</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 lg:col-span-1">
          <CardHeader><CardTitle className="text-base">{t("sa.cur_gateway_per_currency")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {activeCurrencies.map((currency) => (
              <div key={currency.id}><Label>{currency.code} - {currency.name}</Label><div className="mt-1 rounded-md border border-border/50 bg-secondary px-3 py-2 text-sm">{gatewayOptions.find((option) => option.value === currency.gateway)?.label || currency.gateway}</div></div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 lg:col-span-1">
          <CardHeader><CardTitle className="text-base">{t("sa.cur_display_settings")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><Label>{t("sa.cur_show_selector")}</Label><p className="text-xs text-muted-foreground">{t("sa.cur_show_selector_desc")}</p></div><Switch checked={settings.showSelector} onCheckedChange={(checked) => setSettings((current) => ({ ...current, showSelector: checked }))} /></div>
            <div><Label>{t("sa.cur_price_rounding")}</Label><Select value={String(settings.rounding)} onValueChange={(value) => setSettings((current) => ({ ...current, rounding: Number(value) }))}><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">{t("sa.cur_no_decimals")}</SelectItem><SelectItem value="2">{t("sa.cur_2_decimals")}</SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between"><div><Label>{t("sa.cur_show_both")}</Label><p className="text-xs text-muted-foreground">{t("sa.cur_show_both_desc")}</p></div><Switch checked={settings.showBoth} onCheckedChange={(checked) => setSettings((current) => ({ ...current, showBoth: checked }))} /></div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("sa.cur_currencies_rates")}</CardTitle>
          <Button size="sm" onClick={openAdd} disabled={loading}><Plus size={14} className="mr-2" />{t("sa.cur_add")}</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.cur_code")}</TableHead><TableHead>{t("sa.cur_currency")}</TableHead><TableHead>{t("sa.cur_symbol")}</TableHead>
                <TableHead>{t("sa.cur_rate_vs_usd")}</TableHead><TableHead>{t("sa.cur_position")}</TableHead><TableHead>{t("sa.cur_status")}</TableHead><TableHead>{t("sa.cur_default")}</TableHead><TableHead>{t("sa.cur_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">Loading currencies...</TableCell>
                </TableRow>
              ) : currencies.length === 0 ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">No currencies found.</TableCell>
                </TableRow>
              ) : currencies.map((currency) => (
                <TableRow key={currency.id} className="border-border/50">
                  <TableCell className="font-mono font-medium">{currency.code}</TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>{currency.rate}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{positionOptions.find((position) => position.value === currency.symbolPosition)?.label || currency.symbolPosition}</TableCell>
                  <TableCell><Badge variant={currency.status === "Active" ? "default" : "secondary"}>{t(`sa.cur_st_${currency.status.toLowerCase()}`)}</Badge></TableCell>
                  <TableCell>{currency.isDefault ? <Badge className="bg-primary/20 text-primary">{t("sa.cur_default")}</Badge> : "-"}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(currency)}><Pencil size={14} /></Button>
                    {!currency.isDefault ? <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCurrency(currency)}><Trash2 size={14} /></Button> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button className="mt-6" onClick={handleSaveSettings} disabled={savingSettings || loading}>{savingSettings ? "Saving..." : t("sa.cur_save")}</Button>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.cur_add")}</DialogTitle></DialogHeader>
          <CurrencyFormFields />
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)} disabled={savingCurrency}>{t("sa.cur_cancel")}</Button><Button onClick={handleSaveCurrency} disabled={savingCurrency}>{savingCurrency ? "Saving..." : t("sa.cur_add")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.cur_edit")} - {editingCurrency?.code}</DialogTitle></DialogHeader>
          <CurrencyFormFields />
          <DialogFooter><Button variant="outline" onClick={() => setShowEdit(false)} disabled={savingCurrency}>{t("sa.cur_cancel")}</Button><Button onClick={handleSaveCurrency} disabled={savingCurrency}>{savingCurrency ? "Saving..." : t("sa.cur_save_changes")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default CurrencySettings;
