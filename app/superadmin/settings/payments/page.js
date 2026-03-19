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
import { Plus, Pencil, Trash2, CreditCard, Building, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const emptyGatewayForm = {
  provider: "",
  apiKey: "",
  secretKey: "",
  webhookSecret: "",
  mode: "test",
  status: "Active",
  isDefault: false,
  currencies: "all",
  fees: "",
};

const emptyManualForm = {
  name: "",
  instructions: "",
  verificationRequired: true,
  supportedCurrencies: "all",
  status: "Active",
};

const emptySettings = {
  allowMultiple: true,
  autoRetry: true,
  timeout: 300,
  autoInvoices: true,
  receiptEmails: true,
  invoicePrefix: "INV-",
};

const providerIcons = {
  stripe: "💳",
  paypal: "🅿️",
  mollie: "🔷",
  square: "⬛",
  adyen: "🧾",
  razorpay: "💠",
  braintree: "🏦",
  "2checkout": "2️⃣",
};

const PaymentGateways = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [gateways, setGateways] = useState([]);
  const [manualMethods, setManualMethods] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [savingGateway, setSavingGateway] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState("");
  const [showAddGateway, setShowAddGateway] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [editGateway, setEditGateway] = useState(null);
  const [editManualMethod, setEditManualMethod] = useState(null);
  const [gatewayForm, setGatewayForm] = useState(emptyGatewayForm);
  const [manualForm, setManualForm] = useState(emptyManualForm);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [gatewaysRes, manualRes, settingsRes] = await Promise.all([
        fetch(`${apiBase}/api/superadmin/payment-settings/payment-gateways`, {
          credentials: "include",
        }),
        fetch(`${apiBase}/api/superadmin/payment-settings/manual-payment-methods`, {
          credentials: "include",
        }),
        fetch(`${apiBase}/api/superadmin/payment-settings/payment-settings`, {
          credentials: "include",
        }),
      ]);

      const gatewaysPayload = await gatewaysRes.json().catch(() => []);
      const manualPayload = await manualRes.json().catch(() => []);
      const settingsPayload = await settingsRes.json().catch(() => ({}));

      if (!gatewaysRes.ok) {
        throw new Error(gatewaysPayload?.message || "Failed to load payment gateways");
      }

      if (!manualRes.ok) {
        throw new Error(manualPayload?.message || "Failed to load manual payment methods");
      }

      if (!settingsRes.ok) {
        throw new Error(settingsPayload?.message || "Failed to load payment settings");
      }

      setGateways(Array.isArray(gatewaysPayload) ? gatewaysPayload : []);
      setManualMethods(Array.isArray(manualPayload) ? manualPayload : []);
      setPaymentSettings({
        allowMultiple: Boolean(settingsPayload?.allowMultiple),
        autoRetry: Boolean(settingsPayload?.autoRetry),
        timeout: settingsPayload?.timeout ?? 300,
        autoInvoices: Boolean(settingsPayload?.autoInvoices),
        receiptEmails: Boolean(settingsPayload?.receiptEmails),
        invoicePrefix: settingsPayload?.invoicePrefix || "INV-",
      });
    } catch (err) {
      setError(err.message || "Failed to load payment data");
      setGateways([]);
      setManualMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeGateways = useMemo(
    () => gateways.filter((gateway) => gateway.status === "Active"),
    [gateways]
  );
  const activeManualMethods = useMemo(
    () => manualMethods.filter((method) => method.status === "Active"),
    [manualMethods]
  );
  const defaultGateway = gateways.find((gateway) => gateway.isDefault);

  const openAddGateway = () => {
    setEditGateway(null);
    setGatewayForm(emptyGatewayForm);
    setShowAddGateway(true);
  };

  const openEditGateway = (gateway) => {
    setEditGateway(gateway);
    setGatewayForm({
      provider: gateway.provider || "",
      apiKey: gateway.apiKey || "",
      secretKey: gateway.secretKey || "",
      webhookSecret: gateway.webhookSecret || "",
      mode: gateway.mode || "test",
      status: gateway.status || "Active",
      isDefault: Boolean(gateway.isDefault),
      currencies: gateway.currencies || "all",
      fees: gateway.fees || "",
    });
  };

  const openAddManual = () => {
    setEditManualMethod(null);
    setManualForm(emptyManualForm);
    setShowAddManual(true);
  };

  const openEditManual = (method) => {
    setEditManualMethod(method);
    setManualForm({
      name: method.name || "",
      instructions: method.instructions || "",
      verificationRequired: Boolean(method.verificationRequired),
      supportedCurrencies: method.supportedCurrencies || "all",
      status: method.status || "Active",
    });
  };

  const handleSaveGateway = async () => {
    setError("");

    if (!gatewayForm.provider) {
      setError("Please select a gateway provider.");
      return;
    }

    setSavingGateway(true);

    try {
      const isEditing = Boolean(editGateway?.id);
      const res = await fetch(`${apiBase}/api/superadmin/payment-settings/payment-gateways${isEditing ? `/${editGateway.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gatewayForm),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} gateway`);
      }

      setShowAddGateway(false);
      setEditGateway(null);
      setGatewayForm(emptyGatewayForm);
      await loadData();
      toast({ title: isEditing ? "Gateway updated" : "Gateway added" });
    } catch (err) {
      setError(err.message || `Failed to ${editGateway ? "update" : "create"} gateway`);
    } finally {
      setSavingGateway(false);
    }
  };

  const handleDeleteGateway = async (gateway) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/payment-settings/payment-gateways/${gateway.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete gateway");
      }

      setGateways((current) => current.filter((item) => item.id !== gateway.id));
      toast({ title: "Gateway deleted" });
    } catch (err) {
      setError(err.message || "Failed to delete gateway");
    }
  };

  const handleSaveManualMethod = async () => {
    setError("");

    if (!manualForm.name) {
      setError("Please enter a payment method name.");
      return;
    }

    setSavingManual(true);

    try {
      const isEditing = Boolean(editManualMethod?.id);
      const res = await fetch(`${apiBase}/api/superadmin/payment-settings/manual-payment-methods${isEditing ? `/${editManualMethod.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(manualForm),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || `Failed to ${isEditing ? "update" : "create"} payment method`);
      }

      setShowAddManual(false);
      setEditManualMethod(null);
      setManualForm(emptyManualForm);
      await loadData();
      toast({ title: isEditing ? "Manual method updated" : "Manual method added" });
    } catch (err) {
      setError(err.message || `Failed to ${editManualMethod ? "update" : "create"} payment method`);
    } finally {
      setSavingManual(false);
    }
  };

  const handleDeleteManualMethod = async (method) => {
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/payment-settings/manual-payment-methods/${method.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to delete payment method");
      }

      setManualMethods((current) => current.filter((item) => item.id !== method.id));
      toast({ title: "Manual method deleted" });
    } catch (err) {
      setError(err.message || "Failed to delete payment method");
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/api/superadmin/payment-settings/payment-settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentSettings),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to save payment settings");
      }

      setPaymentSettings({
        allowMultiple: Boolean(payload?.allowMultiple),
        autoRetry: Boolean(payload?.autoRetry),
        timeout: payload?.timeout ?? 300,
        autoInvoices: Boolean(payload?.autoInvoices),
        receiptEmails: Boolean(payload?.receiptEmails),
        invoicePrefix: payload?.invoicePrefix || "INV-",
      });
      toast({ title: t("sa.pay_save") });
    } catch (err) {
      setError(err.message || "Failed to save payment settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <SuperAdminLayout title={t("sa.pay_title")} subtitle={t("sa.pay_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{t("sa.pay_active_gateways")}</p><p className="text-2xl font-bold mt-1">{activeGateways.length}</p></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{t("sa.pay_manual_methods")}</p><p className="text-2xl font-bold mt-1">{activeManualMethods.length}</p></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{t("sa.pay_default_gateway")}</p><p className="text-2xl font-bold mt-1">{defaultGateway?.provider || "-"}</p></CardContent></Card>
        <Card className="bg-card border-border/50"><CardContent className="pt-6"><p className="text-xs text-muted-foreground">{t("sa.pay_total_transactions")}</p><p className="text-2xl font-bold mt-1">-</p></CardContent></Card>
      </div>

      <Tabs defaultValue="online">
        <TabsList className="bg-secondary border border-border/50 mb-6">
          <TabsTrigger value="online"><CreditCard size={14} className="mr-2" />{t("sa.pay_online_gateways")}</TabsTrigger>
          <TabsTrigger value="manual"><Banknote size={14} className="mr-2" />{t("sa.pay_manual_methods")}</TabsTrigger>
          <TabsTrigger value="settings"><Building size={14} className="mr-2" />{t("sa.pay_general_settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="online">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("sa.pay_online_gateways")}</CardTitle>
              <Button size="sm" onClick={openAddGateway} disabled={loading}><Plus size={14} className="mr-2" />{t("sa.pay_add_gateway")}</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>{t("sa.pay_gateway")}</TableHead><TableHead>{t("sa.pay_type")}</TableHead><TableHead>{t("sa.pay_status")}</TableHead>
                    <TableHead>{t("sa.pay_currencies")}</TableHead><TableHead>{t("sa.pay_fees")}</TableHead><TableHead>{t("sa.pay_default")}</TableHead><TableHead>{t("sa.pay_actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-border/50"><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">Loading gateways...</TableCell></TableRow>
                  ) : gateways.length === 0 ? (
                    <TableRow className="border-border/50"><TableCell colSpan={7} className="py-6 text-center text-muted-foreground">No gateways found.</TableCell></TableRow>
                  ) : gateways.map((gateway) => (
                    <TableRow key={gateway.id} className="border-border/50">
                      <TableCell className="font-medium"><span className="mr-2">{providerIcons[gateway.provider] || "💳"}</span>{gateway.provider}</TableCell>
                      <TableCell>Online</TableCell>
                      <TableCell><Badge variant={gateway.status === "Active" ? "default" : "secondary"}>{t(`sa.pay_st_${gateway.status.toLowerCase()}`)}</Badge></TableCell>
                      <TableCell>{gateway.currencies || "all"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{gateway.fees || "-"}</TableCell>
                      <TableCell>{gateway.isDefault ? <Badge className="bg-primary/20 text-primary">{t("sa.pay_default")}</Badge> : "-"}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditGateway(gateway)}><Pencil size={14} /></Button>
                        {!gateway.isDefault ? <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteGateway(gateway)}><Trash2 size={14} /></Button> : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t("sa.pay_manual_methods")}</CardTitle>
              <Button size="sm" onClick={openAddManual} disabled={loading}><Plus size={14} className="mr-2" />{t("sa.pay_add_method")}</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>{t("sa.pay_method")}</TableHead><TableHead>{t("sa.pay_instructions")}</TableHead><TableHead>{t("sa.pay_status")}</TableHead>
                    <TableHead>{t("sa.pay_verification_required")}</TableHead><TableHead>{t("sa.pay_actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-border/50"><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">Loading manual methods...</TableCell></TableRow>
                  ) : manualMethods.length === 0 ? (
                    <TableRow className="border-border/50"><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">No manual payment methods found.</TableCell></TableRow>
                  ) : manualMethods.map((method) => (
                    <TableRow key={method.id} className="border-border/50">
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{method.instructions || "-"}</TableCell>
                      <TableCell><Badge variant={method.status === "Active" ? "default" : "secondary"}>{t(`sa.pay_st_${method.status.toLowerCase()}`)}</Badge></TableCell>
                      <TableCell>{method.verificationRequired ? t("sa.pay_yes") : t("sa.pay_no")}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditManual(method)}><Pencil size={14} /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteManualMethod(method)}><Trash2 size={14} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            <Card className="bg-card border-border/50">
              <CardHeader><CardTitle className="text-base">{t("sa.pay_checkout_settings")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><Label>{t("sa.pay_allow_multiple")}</Label><p className="text-xs text-muted-foreground">{t("sa.pay_allow_multiple_desc")}</p></div>
                  <Switch checked={paymentSettings.allowMultiple} onCheckedChange={(checked) => setPaymentSettings((current) => ({ ...current, allowMultiple: checked }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>{t("sa.pay_auto_retry")}</Label><p className="text-xs text-muted-foreground">{t("sa.pay_auto_retry_desc")}</p></div>
                  <Switch checked={paymentSettings.autoRetry} onCheckedChange={(checked) => setPaymentSettings((current) => ({ ...current, autoRetry: checked }))} />
                </div>
                <div>
                  <Label>{t("sa.pay_timeout")}</Label>
                  <Input type="number" value={paymentSettings.timeout} onChange={(e) => setPaymentSettings((current) => ({ ...current, timeout: Number(e.target.value) }))} className="mt-1 bg-secondary border-border/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardHeader><CardTitle className="text-base">{t("sa.pay_invoice_receipt")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><Label>{t("sa.pay_auto_invoices")}</Label></div>
                  <Switch checked={paymentSettings.autoInvoices} onCheckedChange={(checked) => setPaymentSettings((current) => ({ ...current, autoInvoices: checked }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>{t("sa.pay_receipt_emails")}</Label></div>
                  <Switch checked={paymentSettings.receiptEmails} onCheckedChange={(checked) => setPaymentSettings((current) => ({ ...current, receiptEmails: checked }))} />
                </div>
                <div>
                  <Label>{t("sa.pay_invoice_prefix")}</Label>
                  <Input value={paymentSettings.invoicePrefix} onChange={(e) => setPaymentSettings((current) => ({ ...current, invoicePrefix: e.target.value }))} className="mt-1 bg-secondary border-border/50" />
                </div>
              </CardContent>
            </Card>
          </div>
          <Button className="mt-6" onClick={handleSaveSettings} disabled={savingSettings}>{savingSettings ? "Saving..." : t("sa.pay_save")}</Button>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddGateway || !!editGateway} onOpenChange={() => { setShowAddGateway(false); setEditGateway(null); setGatewayForm(emptyGatewayForm); }}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg">
          <DialogHeader><DialogTitle>{editGateway ? `${t("sa.pay_edit")} ${editGateway.provider}` : t("sa.pay_add_gateway")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("sa.pay_gateway_provider")}</Label>
              <Select value={gatewayForm.provider} onValueChange={(value) => setGatewayForm((current) => ({ ...current, provider: value }))} disabled={savingGateway || Boolean(editGateway)}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.pay_select_provider")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem><SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="mollie">Mollie</SelectItem><SelectItem value="square">Square</SelectItem>
                  <SelectItem value="adyen">Adyen</SelectItem><SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="braintree">Braintree</SelectItem><SelectItem value="2checkout">2Checkout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t("sa.pay_api_key")}</Label><Input className="mt-1 bg-secondary border-border/50" value={gatewayForm.apiKey} onChange={(e) => setGatewayForm((current) => ({ ...current, apiKey: e.target.value }))} placeholder="pk_live_..." /></div>
            <div><Label>{t("sa.pay_secret_key")}</Label><Input type="password" className="mt-1 bg-secondary border-border/50" value={gatewayForm.secretKey} onChange={(e) => setGatewayForm((current) => ({ ...current, secretKey: e.target.value }))} placeholder="sk_live_..." /></div>
            <div><Label>{t("sa.pay_webhook_secret")}</Label><Input type="password" className="mt-1 bg-secondary border-border/50" value={gatewayForm.webhookSecret} onChange={(e) => setGatewayForm((current) => ({ ...current, webhookSecret: e.target.value }))} placeholder="whsec_..." /></div>
            <div>
              <Label>{t("sa.pay_mode")}</Label>
              <Select value={gatewayForm.mode} onValueChange={(value) => setGatewayForm((current) => ({ ...current, mode: value }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="test">{t("sa.pay_test")}</SelectItem><SelectItem value="live">{t("sa.pay_live")}</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("sa.pay_status")}</Label>
              <Select value={gatewayForm.status} onValueChange={(value) => setGatewayForm((current) => ({ ...current, status: value }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">{t("sa.pay_st_active")}</SelectItem><SelectItem value="Inactive">{t("sa.pay_st_inactive")}</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>{t("sa.pay_currencies")}</Label><Input className="mt-1 bg-secondary border-border/50" value={gatewayForm.currencies} onChange={(e) => setGatewayForm((current) => ({ ...current, currencies: e.target.value }))} placeholder="all / USD,EUR" /></div>
            <div><Label>{t("sa.pay_fees")}</Label><Input className="mt-1 bg-secondary border-border/50" value={gatewayForm.fees} onChange={(e) => setGatewayForm((current) => ({ ...current, fees: e.target.value }))} placeholder="2.9% + $0.30" /></div>
            <div className="flex items-center justify-between"><Label>{t("sa.pay_set_default")}</Label><Switch checked={gatewayForm.isDefault} onCheckedChange={(checked) => setGatewayForm((current) => ({ ...current, isDefault: checked }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowAddGateway(false); setEditGateway(null); setGatewayForm(emptyGatewayForm); }}>{t("sa.pay_cancel")}</Button><Button onClick={handleSaveGateway} disabled={savingGateway}>{savingGateway ? "Saving..." : editGateway ? t("sa.pay_save_changes") : t("sa.pay_add_gateway")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddManual || !!editManualMethod} onOpenChange={() => { setShowAddManual(false); setEditManualMethod(null); setManualForm(emptyManualForm); }}>
        <DialogContent className="bg-card border-border/50 sm:max-w-lg">
          <DialogHeader><DialogTitle>{editManualMethod ? t("sa.pay_edit") : t("sa.pay_add_manual")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("sa.pay_method_name")}</Label><Input className="mt-1 bg-secondary border-border/50" value={manualForm.name} onChange={(e) => setManualForm((current) => ({ ...current, name: e.target.value }))} placeholder="e.g., Wire Transfer" /></div>
            <div><Label>{t("sa.pay_payment_instructions")}</Label><Textarea className="mt-1 bg-secondary border-border/50" value={manualForm.instructions} onChange={(e) => setManualForm((current) => ({ ...current, instructions: e.target.value }))} placeholder={t("sa.pay_instructions_placeholder")} rows={4} /></div>
            <div className="flex items-center justify-between">
              <div><Label>{t("sa.pay_require_verification")}</Label><p className="text-xs text-muted-foreground">{t("sa.pay_require_verification_desc")}</p></div>
              <Switch checked={manualForm.verificationRequired} onCheckedChange={(checked) => setManualForm((current) => ({ ...current, verificationRequired: checked }))} />
            </div>
            <div>
              <Label>{t("sa.pay_supported_currencies")}</Label>
              <Input className="mt-1 bg-secondary border-border/50" value={manualForm.supportedCurrencies} onChange={(e) => setManualForm((current) => ({ ...current, supportedCurrencies: e.target.value }))} placeholder={t("sa.pay_all_currencies")} />
            </div>
            <div>
              <Label>{t("sa.pay_status")}</Label>
              <Select value={manualForm.status} onValueChange={(value) => setManualForm((current) => ({ ...current, status: value }))}>
                <SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">{t("sa.pay_st_active")}</SelectItem><SelectItem value="Inactive">{t("sa.pay_st_inactive")}</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setShowAddManual(false); setEditManualMethod(null); setManualForm(emptyManualForm); }}>{t("sa.pay_cancel")}</Button><Button onClick={handleSaveManualMethod} disabled={savingManual}>{savingManual ? "Saving..." : editManualMethod ? t("sa.pay_save_changes") : t("sa.pay_add_method")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default PaymentGateways;
