"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Building2, Link2, Shield, CreditCard, Upload, Eye, EyeOff, Copy, ExternalLink, Plus, Globe, CheckCircle, Smartphone, Mail, Key, ZoomIn, ZoomOut, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { get, post, put } from "@/lib/api";

const countries = [
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
];

const Settings = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoScale, setLogoScale] = useState(100);
  const fileInputRef = useRef(null);
  const [generalForm, setGeneralForm] = useState({
    fullName: "",
    businessName: "",
    vatNumber: "",
    tradeNumber: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(true);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [platformsForm, setPlatformsForm] = useState({
    googleLink: "",
    facebookLink: "",
    yelpLink: "",
    tripadvisorLink: "",
    customReviewLink: "",
  });
  const [isSavingPlatforms, setIsSavingPlatforms] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    twoFactorEnabled: false,
    twoFactorEmail: false,
    twoFactorPhone: false,
    twoFactorGoogle: false,
  });
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState(false);
  const [twoFactorPhone, setTwoFactorPhone] = useState(false);
  const [twoFactorGoogle, setTwoFactorGoogle] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState("select");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [annualBilling, setAnnualBilling] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [locationStep, setLocationStep] = useState("input");
  const [locationsToAdd, setLocationsToAdd] = useState(1);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );

  const handleCopy = (text) => { navigator.clipboard.writeText(text); toast({ title: t("sett.copied"), description: t("sett.copied_desc") }); };
  const updateGeneralField = (field, value) => {
    setGeneralForm((prev) => ({ ...prev, [field]: value }));
  };
  const updatePlatformField = (field, value) => {
    setPlatformsForm((prev) => ({ ...prev, [field]: value }));
  };
  const updatePasswordField = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (countryName) => { const country = countries.find((c) => c.name === countryName); if (country) setSelectedCountry(country); };

  useEffect(() => {
    let cancelled = false;

    const loadGeneralSettings = async () => {
      setIsLoadingGeneral(true);

      try {
        const settingsResponse = await get("/api/admin/general-settings");
        const company = settingsResponse?.data;

        if (!company || cancelled) return;

        setGeneralForm({
          fullName: company?.currentUser?.name || "",
          businessName: company.name || "",
          vatNumber: company.vatNumber || "",
          tradeNumber: company.tradeNumber || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
        });
        setPlatformsForm({
          googleLink: company.googleLink || "",
          facebookLink: company.facebookLink || "",
          yelpLink: company.yelpLink || "",
          tripadvisorLink: company.tripadvisorLink || "",
          customReviewLink: company.customReviewLink || "",
        });
        setSecurityForm({
          twoFactorEnabled: !!company?.settings?.twoFactorEnabled,
          twoFactorEmail: !!company?.settings?.twoFactorEmail,
          twoFactorPhone: !!company?.settings?.twoFactorPhone,
          twoFactorGoogle: !!company?.settings?.twoFactorGoogle,
        });
        setTwoFactor(!!company?.settings?.twoFactorEnabled);
        setTwoFactorEmail(!!company?.settings?.twoFactorEmail);
        setTwoFactorPhone(!!company?.settings?.twoFactorPhone);
        setTwoFactorGoogle(!!company?.settings?.twoFactorGoogle);

        setLogoScale(company.logoScale || 100);

        if (company.logo) {
          setLogoPreview(company.logo.startsWith("http") ? company.logo : `${apiBase}${company.logo}`);
        } else {
          setLogoPreview(null);
        }

        const matchedCountry = countries.find((country) => country.name === company.country);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
        } else if (company.country || company.countryCode) {
          setSelectedCountry({
            name: company.country || "Custom",
            code: company.countryCode || "",
            flag: "🌍",
          });
        }
      } catch (error) {
        toast({
          title: "General settings",
          description: error?.error || error?.message || "Failed to load settings.",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) {
          setIsLoadingGeneral(false);
        }
      }
    };

    loadGeneralSettings();

    return () => {
      cancelled = true;
    };
  }, [apiBase, t]);

  useEffect(() => {
    let cancelled = false;

    const loadSubscription = async () => {
      setIsLoadingSubscription(true);
      try {
        const [subRes, invRes] = await Promise.all([
          get("/api/admin/general-settings/subscription"),
          get("/api/admin/general-settings/invoices?limit=10"),
        ]);
        if (!cancelled) {
          setSubscription(subRes?.data || null);
          setInvoices(invRes?.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Subscription",
            description: error?.error || error?.message || "Failed to load subscription.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setIsLoadingSubscription(false);
      }
    };

    loadSubscription();

    return () => { cancelled = true; };
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setIsUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch(`${apiBase}/api/admin/general-settings/logo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Failed to upload logo.");
      }

      const uploadedLogo = payload?.data?.logo;
      if (uploadedLogo) {
        setLogoPreview(uploadedLogo.startsWith("http") ? uploadedLogo : `${apiBase}${uploadedLogo}`);
      }

      toast({
        title: "Logo updated",
        description: payload?.message || "Logo uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Logo upload",
        description: error?.message || "Failed to upload logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      URL.revokeObjectURL(previewUrl);
    }
  };

  const saveGeneralSettings = async () => {
    setIsSavingGeneral(true);

    try {
      const response = await put("/api/admin/general-settings/general", {
        fullName: generalForm.fullName,
        name: generalForm.businessName,
        email: generalForm.email,
        phone: generalForm.phone,
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        address: generalForm.address,
        vatNumber: generalForm.vatNumber,
        tradeNumber: generalForm.tradeNumber,
      });

      const updated = response?.data;
      if (updated) {
        updateGeneralField("fullName", updated?.currentUser?.name || generalForm.fullName);
        updateGeneralField("businessName", updated.name || "");
        updateGeneralField("email", updated.email || "");
        updateGeneralField("phone", updated.phone || "");
        updateGeneralField("address", updated.address || "");
        updateGeneralField("vatNumber", updated.vatNumber || "");
        updateGeneralField("tradeNumber", updated.tradeNumber || "");
        setLogoScale(updated.logoScale || logoScale);

        const matchedCountry = countries.find((country) => country.name === updated.country);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry);
        }
      }

      toast({
        title: "Settings updated",
        description: response?.message || "General settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: "General settings",
        description: error?.error || error?.message || "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const savePlatformsSettings = async () => {
    setIsSavingPlatforms(true);

    try {
      const response = await put("/api/admin/general-settings/platforms", {
        googleLink: platformsForm.googleLink,
        facebookLink: platformsForm.facebookLink,
        yelpLink: platformsForm.yelpLink,
        tripadvisorLink: platformsForm.tripadvisorLink,
        customReviewLink: platformsForm.customReviewLink,
      });

      const updated = response?.data;
      if (updated) {
        setPlatformsForm({
          googleLink: updated.googleLink || "",
          facebookLink: updated.facebookLink || "",
          yelpLink: updated.yelpLink || "",
          tripadvisorLink: updated.tripadvisorLink || "",
          customReviewLink: updated.customReviewLink || "",
        });
      }

      toast({
        title: "Platforms updated",
        description: response?.message || "Platform links updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Platforms settings",
        description: error?.error || error?.message || "Failed to save platform links.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPlatforms(false);
    }
  };

  const setSecurityToggle = (key, value) => {
    setSecurityForm((prev) => ({ ...prev, [key]: value }));
    if (key === "twoFactorEnabled") setTwoFactor(value);
    if (key === "twoFactorEmail") setTwoFactorEmail(value);
    if (key === "twoFactorPhone") setTwoFactorPhone(value);
    if (key === "twoFactorGoogle") setTwoFactorGoogle(value);
  };

  const saveSecuritySettings = async () => {
    setIsSavingSecurity(true);

    try {
      const response = await put("/api/admin/general-settings/security", {
        twoFactorEnabled: securityForm.twoFactorEnabled,
        twoFactorEmail: securityForm.twoFactorEmail,
        twoFactorPhone: securityForm.twoFactorPhone,
        twoFactorGoogle: securityForm.twoFactorGoogle,
      });

      const updated = response?.data;
      if (updated) {
        const nextSecurity = {
          twoFactorEnabled: !!updated.twoFactorEnabled,
          twoFactorEmail: !!updated.twoFactorEmail,
          twoFactorPhone: !!updated.twoFactorPhone,
          twoFactorGoogle: !!updated.twoFactorGoogle,
        };
        setSecurityForm(nextSecurity);
        setTwoFactor(nextSecurity.twoFactorEnabled);
        setTwoFactorEmail(nextSecurity.twoFactorEmail);
        setTwoFactorPhone(nextSecurity.twoFactorPhone);
        setTwoFactorGoogle(nextSecurity.twoFactorGoogle);
      }

      toast({
        title: "Security updated",
        description: response?.message || "Security settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Security settings",
        description: error?.error || error?.message || "Failed to save security settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Change password",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Change password",
        description: "The new password confirmation does not match.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await post("/api/admin/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password updated",
        description: response?.message || "Password changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Change password",
        description: error?.error || error?.message || "Failed to change password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <DashboardLayout title={t("sett.title")} subtitle={t("sett.subtitle")}>
      <div className="max-w-4xl">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-secondary/50 p-1">
            <TabsTrigger value="general" className="gap-2"><Building2 size={14} /> {t("sett.general")}</TabsTrigger>
            <TabsTrigger value="platforms" className="gap-2"><Link2 size={14} /> {t("sett.review_platforms")}</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield size={14} /> {t("sett.security")}</TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2"><CreditCard size={14} /> {t("sett.subscription")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("sett.business_info")}</h3><p className="text-xs text-muted-foreground">{t("sett.company_details")}</p></div></div>
              {isLoadingGeneral ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading general settings...</span>
                </div>
              ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.logo")}</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden">
                      {logoPreview ? <img src={logoPreview} alt="Logo" className="object-contain" style={{ transform: `scale(${logoScale / 100})` }} /> : <span className="font-display font-bold text-primary text-lg">R</span>}
                    </div>
                    <div className="space-y-2">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <Button variant="outline" size="sm" className="gap-2 border-border/50" disabled={isUploadingLogo} onClick={() => fileInputRef.current?.click()}>{isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {t("sett.upload_logo")}</Button>
                      {logoPreview && (<div className="flex items-center gap-2"><button onClick={() => setLogoScale(Math.max(50, logoScale - 10))} className="p-1 rounded hover:bg-secondary"><ZoomOut size={14} /></button><span className="text-xs text-muted-foreground w-10 text-center">{logoScale}%</span><button onClick={() => setLogoScale(Math.min(200, logoScale + 10))} className="p-1 rounded hover:bg-secondary"><ZoomIn size={14} /></button></div>)}
                    </div>
                  </div>
                </div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.full_name")}</label><Input className="bg-secondary/50 border-border/50" value={generalForm.fullName} onChange={(e) => updateGeneralField("fullName", e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.business_name")}</label><Input className="bg-secondary/50 border-border/50" value={generalForm.businessName} onChange={(e) => updateGeneralField("businessName", e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.vat")}</label><Input className="bg-secondary/50 border-border/50" placeholder="e.g. FR12345678901" value={generalForm.vatNumber} onChange={(e) => updateGeneralField("vatNumber", e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.trade")}</label><Input className="bg-secondary/50 border-border/50" placeholder="e.g. 123456789" value={generalForm.tradeNumber} onChange={(e) => updateGeneralField("tradeNumber", e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.contact_email")}</label><Input className="bg-secondary/50 border-border/50" value={generalForm.email} onChange={(e) => updateGeneralField("email", e.target.value)} type="email" /></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.country")}</label><select value={selectedCountry.name} onChange={(e) => handleCountryChange(e.target.value)} className="w-full h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm">{countries.map((c) => (<option key={c.name} value={c.name}>{c.flag} {c.name}</option>))}</select></div>
                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.phone")}</label><div className="flex gap-2"><div className="flex items-center gap-1 px-3 rounded-md border border-border/50 bg-secondary/50 text-sm min-w-[80px]"><span>{selectedCountry.flag}</span><span className="text-xs">{selectedCountry.code}</span></div><Input className="bg-secondary/50 border-border/50 flex-1" value={generalForm.phone} onChange={(e) => updateGeneralField("phone", e.target.value)} /></div></div>
                <div className="md:col-span-2"><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.address")}</label><Input className="bg-secondary/50 border-border/50" value={generalForm.address} onChange={(e) => updateGeneralField("address", e.target.value)} /></div>
              </div>
              )}
              <Button size="sm" disabled={isLoadingGeneral || isSavingGeneral} className="mt-6 glow-red-hover" onClick={saveGeneralSettings}>{isSavingGeneral && <Loader2 size={14} className="mr-2 animate-spin" />}{t("sett.save_changes")}</Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="platforms">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Link2 size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("sett.platforms_title")}</h3><p className="text-xs text-muted-foreground">{t("sett.platforms_desc")}</p></div></div>
              <div className="space-y-4">
                {[
                  { labelKey: "sett.google_link", field: "googleLink" },
                  { labelKey: "sett.facebook_link", field: "facebookLink" },
                  { labelKey: "sett.yelp_link", field: "yelpLink" },
                  { labelKey: "sett.tripadvisor_link", field: "tripadvisorLink" },
                  { labelKey: "sett.custom_link", field: "customReviewLink" },
                ].map((platform) => (
                  <div key={platform.labelKey}><label className="text-xs text-muted-foreground mb-1.5 block">{t(platform.labelKey)}</label><div className="flex gap-2"><Input className="bg-secondary/50 border-border/50 flex-1" value={platformsForm[platform.field]} onChange={(e) => updatePlatformField(platform.field, e.target.value)} placeholder="https://..." /><Button variant="outline" size="icon" className="border-border/50" disabled={!platformsForm[platform.field]} onClick={() => window.open(platformsForm[platform.field], "_blank", "noopener,noreferrer")}><ExternalLink size={14} /></Button></div></div>
                ))}
              </div>
              <Button size="sm" disabled={isLoadingGeneral || isSavingPlatforms} className="mt-6 glow-red-hover" onClick={savePlatformsSettings}>{isSavingPlatforms && <Loader2 size={14} className="mr-2 animate-spin" />}{t("sett.save_platforms")}</Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Shield size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("sett.security_title")}</h3><p className="text-xs text-muted-foreground">{t("sett.security_desc")}</p></div></div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.change_password")}</label>
                  <div className="grid gap-2">
                    <div className="relative">
                      <Input className="bg-secondary/50 border-border/50 pr-10" type={showPassword ? "text" : "password"} placeholder={t("sett.current_password") || "Current password"} value={passwordForm.currentPassword} onChange={(e) => updatePasswordField("currentPassword", e.target.value)} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    <Input className="bg-secondary/50 border-border/50" type={showPassword ? "text" : "password"} placeholder={t("sett.new_password")} value={passwordForm.newPassword} onChange={(e) => updatePasswordField("newPassword", e.target.value)} />
                    <Input className="bg-secondary/50 border-border/50" type={showPassword ? "text" : "password"} placeholder={t("sett.confirm_password") || "Confirm new password"} value={passwordForm.confirmPassword} onChange={(e) => updatePasswordField("confirmPassword", e.target.value)} />
                  </div>
                  <Button variant="outline" size="default" disabled={isChangingPassword} className="border-border/50" onClick={handleChangePassword}>{isChangingPassword && <Loader2 size={14} className="mr-2 animate-spin" />}{t("sett.update")}</Button>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4"><div><span className="text-sm font-medium block">{t("sett.two_factor")}</span><span className="text-xs text-muted-foreground">{t("sett.two_factor_desc")}</span></div><Toggle value={securityForm.twoFactorEnabled} onChange={(value) => setSecurityToggle("twoFactorEnabled", value)} /></div>

                {securityForm.twoFactorEnabled && (
                  <div className="space-y-3 ml-0 border-l-2 border-primary/30 pl-4">
                    <div className="rounded-lg bg-secondary/20 p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Mail size={16} className="text-primary" /></div><div><span className="text-sm font-medium block">{t("sett.setup_email")}</span><span className="text-[11px] text-muted-foreground">{t("sett.email_2fa_desc")}</span></div></div><Button size="sm" variant={securityForm.twoFactorEmail ? "default" : "outline"} className={securityForm.twoFactorEmail ? "glow-red-hover" : "border-border/50"} onClick={() => setSecurityToggle("twoFactorEmail", !securityForm.twoFactorEmail)}>{securityForm.twoFactorEmail ? t("sett.enabled") : t("sett.enable")}</Button></div></div>
                    <div className="rounded-lg bg-secondary/20 p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Smartphone size={16} className="text-primary" /></div><div><span className="text-sm font-medium block">{t("sett.setup_phone")}</span><span className="text-[11px] text-muted-foreground">{t("sett.phone_2fa_desc")}</span></div></div><Button size="sm" variant={securityForm.twoFactorPhone ? "default" : "outline"} className={securityForm.twoFactorPhone ? "glow-red-hover" : "border-border/50"} onClick={() => setSecurityToggle("twoFactorPhone", !securityForm.twoFactorPhone)}>{securityForm.twoFactorPhone ? t("sett.enabled") : t("sett.enable")}</Button></div></div>
                    <div className="rounded-lg bg-secondary/20 p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Key size={16} className="text-primary" /></div><div><span className="text-sm font-medium block">{t("sett.setup_google")}</span><span className="text-[11px] text-muted-foreground">{t("sett.google_2fa_desc")}</span></div></div><Button size="sm" variant={securityForm.twoFactorGoogle ? "default" : "outline"} className={securityForm.twoFactorGoogle ? "glow-red-hover" : "border-border/50"} onClick={() => setSecurityToggle("twoFactorGoogle", !securityForm.twoFactorGoogle)}>{securityForm.twoFactorGoogle ? t("sett.enabled") : t("sett.enable")}</Button></div></div>
                  </div>
                )}

                <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.api_key")}</label><div className="flex gap-2"><Input className="bg-secondary/50 border-border/50 flex-1 font-mono text-xs" value="rv_live_sk_xxxxxxxxxxxxxxxxxxxxxxxx" readOnly /><Button variant="outline" size="icon" className="border-border/50" onClick={() => handleCopy("rv_live_sk_xxxxxxxxxxxxxxxxxxxxxxxx")}><Copy size={14} /></Button></div></div>
                <Button size="sm" disabled={isLoadingGeneral || isSavingSecurity} className="glow-red-hover" onClick={saveSecuritySettings}>{isSavingSecurity && <Loader2 size={14} className="mr-2 animate-spin" />}{t("sett.save_changes")}</Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="subscription">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><CreditCard size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("sett.subscription_title")}</h3><p className="text-xs text-muted-foreground">{t("sett.subscription_desc")}</p></div></div>
              {isLoadingSubscription ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading subscription...</span>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{subscription?.planName || "Free"} Plan</span>
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary capitalize">{subscription?.status || "active"}</span>
                      </div>
                      <span className="font-display text-xl font-bold">
                        {subscription?.amount != null ? `$${subscription.amount}` : "—"}
                        <span className="text-sm text-muted-foreground font-normal">/{subscription?.interval === "yearly" ? "yr" : "mo"}</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {subscription?.locationCount ?? 0} / {subscription?.locationLimit ?? "∞"} Locations
                      {subscription?.nextBilling ? ` • Next billing: ${new Date(subscription.nextBilling).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="glow-red-hover" onClick={() => setShowUpgrade(true)}>{t("sett.upgrade_plan")}</Button>
                    <Button variant="outline" size="sm" className="border-border/50 gap-2" onClick={() => setShowLocations(true)}><Plus size={14} /> {t("sett.add_locations")}</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowBillingHistory(true)}>{t("sett.billing_history")}</Button>
                  </div>
                  <div className="mt-4 rounded-lg bg-secondary/30 p-4">
                    <span className="text-xs text-muted-foreground block mb-2">{t("sett.recent_invoices")}</span>
                    {invoices.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No invoices found.</p>
                    ) : invoices.slice(0, 3).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                        <span className="text-xs">{new Date(inv.invoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="text-xs font-medium">{inv.currency} {inv.total?.toFixed(2)}</span>
                        <span className="text-xs text-emerald-400 capitalize">{inv.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showUpgrade} onOpenChange={(open) => { setShowUpgrade(open); if (!open) { setUpgradeStep("select"); setSelectedPlan(null); setAnnualBilling(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{upgradeStep === "select" ? t("sett.upgrade_plan") : "Confirm Plan Change"}</DialogTitle></DialogHeader>
          {upgradeStep === "select" ? (
            <>
              <div className="flex items-center justify-center gap-3 rounded-lg bg-secondary/30 p-3 mb-1">
                <span className={`text-sm font-medium ${!annualBilling ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                <button onClick={() => setAnnualBilling(!annualBilling)} className={`relative w-11 h-6 rounded-full transition-colors ${annualBilling ? "bg-primary" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${annualBilling ? "left-[22px]" : "left-0.5"}`} />
                </button>
                <span className={`text-sm font-medium ${annualBilling ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
                {annualBilling && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">Save up to 20%</span>}
                <div className="relative group">
                  <Info size={14} className="text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg border border-border/50 bg-popover p-3 text-xs shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                    <p className="font-semibold mb-1.5">Annual billing includes:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary shrink-0" />Up to 20% off monthly price</li>
                      <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary shrink-0" />Locked-in rate for 12 months</li>
                      <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary shrink-0" />Priority support included</li>
                      <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary shrink-0" />Cancel anytime, prorated refund</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[{ name: "Starter", rawPrice: 129, yearlyPrice: 99, features: "5 Cards, 1 Location, Basic Analytics" }, { name: "Growth", rawPrice: 249, yearlyPrice: 199, features: "15 Cards, 3 Locations, Advanced Analytics", current: true }, { name: "Pro", rawPrice: 499, yearlyPrice: 399, features: "50 Cards, 10 Locations, API Access, Priority Support" }, { name: "Agency", rawPrice: 999, yearlyPrice: 799, features: "Unlimited Cards, White-Label, Dedicated Manager" }].map((plan) => {
                  const displayPrice = annualBilling ? plan.yearlyPrice : plan.rawPrice;
                  const priceLabel = `$${displayPrice}/mo`;
                  const yearlyTotal = annualBilling ? displayPrice * 12 : null;
                  return (
                    <div key={plan.name} onClick={() => !plan.current && setSelectedPlan({ ...plan, price: priceLabel, rawPrice: displayPrice })} className={`rounded-lg border p-4 cursor-pointer transition-all ${plan.current ? "border-primary bg-primary/5 opacity-60 cursor-default" : selectedPlan?.name === plan.name ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"}`}>
                      <div className="flex items-center justify-between">
                        <div><span className="text-sm font-semibold">{plan.name}</span>{plan.current && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">{t("sett.current")}</span>}{selectedPlan?.name === plan.name && !plan.current && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">Selected</span>}</div>
                        <div className="text-right">
                          <span className="font-display font-bold">{priceLabel}</span>
                          {annualBilling && <span className="block text-[10px] text-muted-foreground line-through">${plan.rawPrice}/mo</span>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{plan.features}</p>
                      {annualBilling && yearlyTotal && <p className="text-[11px] text-primary mt-1 font-medium">Billed ${yearlyTotal.toLocaleString()}/year — Save ${(plan.rawPrice - displayPrice) * 12}/yr</p>}
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUpgrade(false)}>{t("sett.cancel")}</Button>
                <Button className="glow-red-hover" disabled={!selectedPlan} onClick={() => setUpgradeStep("confirm")}>Continue</Button>
              </DialogFooter>
            </>
          ) : selectedPlan && (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Current plan</span><span>Growth — $249/mo</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">New plan</span><span className="font-semibold">{selectedPlan.name} — {selectedPlan.price}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Billing cycle</span><span className="font-medium">{annualBilling ? "Annual" : "Monthly"}</span></div>
                  {annualBilling && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Annual total</span><span className="font-semibold text-primary">${(selectedPlan.rawPrice * 12).toLocaleString()}/yr</span></div>}
                  <div className="border-t border-border/30 pt-2">
                    <p className="text-xs font-medium mb-1">Includes:</p>
                    <p className="text-xs text-muted-foreground">{selectedPlan.features}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Your plan will be updated immediately. Billing will be prorated for the current period.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUpgradeStep("select")}>Back</Button>
                <Button className="glow-red-hover" onClick={() => { setShowUpgrade(false); setUpgradeStep("select"); setSelectedPlan(null); setAnnualBilling(false); router.push("/dashboard/billing"); }}>{t("sett.confirm_upgrade")}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showLocations} onOpenChange={(open) => { setShowLocations(open); if (!open) setLocationStep("input"); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locationStep === "input" ? t("sett.add_locations") : "Confirm Your Selection"}</DialogTitle></DialogHeader>
          {locationStep === "input" ? (
            <>
              <div className="space-y-4">
                <div className="rounded-lg bg-secondary/30 p-4">
                  <p className="text-sm">Current: <strong>3 locations</strong></p>
                  <p className="text-xs text-muted-foreground">Each additional location costs $29/mo</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Number of Locations to Add</label>
                  <Input type="number" value={locationsToAdd} min={1} onChange={(e) => setLocationsToAdd(Math.max(1, parseInt(e.target.value) || 1))} className="bg-secondary/50 border-border/50" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLocations(false)}>{t("sett.cancel")}</Button>
                <Button className="glow-red-hover" onClick={() => setLocationStep("confirm")}>Continue</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Locations to add</span><span className="font-semibold">{locationsToAdd}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cost per location</span><span>$29/mo</span></div>
                  <div className="border-t border-border/30 pt-2 flex justify-between text-sm font-semibold"><span>Additional monthly cost</span><span className="text-primary">${locationsToAdd * 29}/mo</span></div>
                </div>
                <p className="text-xs text-muted-foreground">You'll be redirected to the Add-Ons page to finalize your subscription changes.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLocationStep("input")}>Back</Button>
                <Button className="glow-red-hover" onClick={() => { setShowLocations(false); setLocationStep("input"); router.push(`/dashboard/addons?activate=location&qty_location=${locationsToAdd}`); }}>Confirm & Continue</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBillingHistory} onOpenChange={setShowBillingHistory}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{t("sett.billing_history")}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No invoices found.</p>
            ) : invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                <div>
                  <span className="text-sm">{new Date(inv.invoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <p className="text-xs text-muted-foreground">{inv.items?.[0]?.service || inv.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{inv.currency} {inv.total?.toFixed(2)}</span>
                  <p className="text-xs text-emerald-400 capitalize">{inv.status}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
