"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Building2, Palette, Link2, Shield, Upload, ZoomIn, ZoomOut, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

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
  const fileInputRef = useRef(null);
  
  // Hook API
  const {
    settings,
    loading,
    saving,
    updateGeneral,
    updateBranding,
    uploadLogo,
    updateRecaptcha,
    updateMaps,
    updatePlatforms,
    updateSecurity,
  } = usePlatformSettings();

  // États locaux
  const [formData, setFormData] = useState({
    // General
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyCountry: '',
    countryCode: '',
    companyAddress: '',
    vatNumber: '',
    tradeNumber: '',
    
    // Branding
    logoScale: 100,
    primaryColor: '#E10600',
    secondaryColor: '#1A1A1A',
    
    // reCAPTCHA
    captchaEnabled: false,
    captchaSiteKey: '',
    captchaSecret: '',
    
    // Maps
    mapsEnabled: false,
    mapsApiKey: '',
    mapsCloudSecret: '',
    
    // Platforms
    googleLink: '',
    facebookLink: '',
    yelpLink: '',
    tripadvisorLink: '',
    customReviewLink: '',
    
    // Security
    twoFactorEnabled: false,
    twoFactorEmail: false,
    twoFactorPhone: false,
    twoFactorGoogle: false,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // Synchroniser les données de l'API avec le formulaire
  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || '',
        companyEmail: settings.companyEmail || '',
        companyPhone: settings.companyPhone || '',
        companyCountry: settings.companyCountry || 'United States',
        countryCode: settings.countryCode || '+1',
        companyAddress: settings.companyAddress || '',
        vatNumber: settings.vatNumber || '',
        tradeNumber: settings.tradeNumber || '',
        
        logoScale: settings.logoScale || 100,
        primaryColor: settings.primaryColor || '#E10600',
        secondaryColor: settings.secondaryColor || '#1A1A1A',
        
        captchaEnabled: settings.captchaEnabled || false,
        captchaSiteKey: settings.captchaSiteKey || '',
        captchaSecret: settings.captchaSecret || '',
        
        mapsEnabled: settings.mapsEnabled || false,
        mapsApiKey: settings.mapsApiKey || '',
        mapsCloudSecret: settings.mapsCloudSecret || '',
        
        googleLink: settings.googleLink || '',
        facebookLink: settings.facebookLink || '',
        yelpLink: settings.yelpLink || '',
        tripadvisorLink: settings.tripadvisorLink || '',
        customReviewLink: settings.customReviewLink || '',
        
        twoFactorEnabled: settings.twoFactorEnabled || false,
        twoFactorEmail: settings.twoFactorEmail || false,
        twoFactorPhone: settings.twoFactorPhone || false,
        twoFactorGoogle: settings.twoFactorGoogle || false,
      });

      // Logo preview
      if (settings.logoUrl) {
        setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${settings.logoUrl}`);
      }

      // Pays sélectionné
      const country = countries.find(c => c.name === settings.companyCountry);
      if (country) setSelectedCountry(country);
    }
  }, [settings]);

  const Toggle = ({ value, onChange }) => (
    <button 
      onClick={() => onChange(!value)} 
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload vers le serveur
    try {
      await uploadLogo(file);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleCountryChange = (countryName) => {
    const country = countries.find(c => c.name === countryName);
    if (country) {
      setSelectedCountry(country);
      handleChange('companyCountry', countryName);
      handleChange('countryCode', country.code);
    }
  };

  // Handlers de sauvegarde
  const handleSaveGeneral = async () => {
    await updateGeneral({
      companyName: formData.companyName,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      companyCountry: formData.companyCountry,
      countryCode: formData.countryCode,
      companyAddress: formData.companyAddress,
      vatNumber: formData.vatNumber,
      tradeNumber: formData.tradeNumber,
    });
  };

  const handleSaveBranding = async () => {
    await updateBranding({
      logoScale: formData.logoScale,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
    });
  };

  const handleSaveRecaptcha = async () => {
    await updateRecaptcha({
      captchaEnabled: formData.captchaEnabled,
      captchaSiteKey: formData.captchaSiteKey,
      captchaSecret: formData.captchaSecret,
    });
  };

  const handleSaveMaps = async () => {
    await updateMaps({
      mapsEnabled: formData.mapsEnabled,
      mapsApiKey: formData.mapsApiKey,
      mapsCloudSecret: formData.mapsCloudSecret,
    });
  };

  const handleSavePlatforms = async () => {
    await updatePlatforms({
      googleLink: formData.googleLink,
      facebookLink: formData.facebookLink,
      yelpLink: formData.yelpLink,
      tripadvisorLink: formData.tripadvisorLink,
      customReviewLink: formData.customReviewLink,
    });
  };

  const handleSaveSecurity = async () => {
    await updateSecurity({
      twoFactorEnabled: formData.twoFactorEnabled,
      twoFactorEmail: formData.twoFactorEmail,
      twoFactorPhone: formData.twoFactorPhone,
      twoFactorGoogle: formData.twoFactorGoogle,
    });
  };

  if (loading) {
    return (
      <SuperAdminLayout title={t("sett.title")} subtitle={t("sett.subtitle")}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title={t("sett.title")} subtitle={t("sett.subtitle")}>
      <div className="max-w-4xl">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-secondary/50 p-1">
            <TabsTrigger value="general" className="gap-2">
              <Building2 size={14} /> {t("sett.general")}
            </TabsTrigger>
            <TabsTrigger value="platforms" className="gap-2">
              <Link2 size={14} /> {t("sett.review_platforms")}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield size={14} /> {t("sett.security")}
            </TabsTrigger>
          </TabsList>

          {/* TAB GENERAL */}
          <TabsContent value="general" className="space-y-6">
            {/* Business Info */}
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{t("sett.business_info")}</h3>
                  <p className="text-xs text-muted-foreground">{t("sett.company_details")}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Logo */}
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.logo")}</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="object-contain" 
                          style={{ transform: `scale(${formData.logoScale / 100})` }} 
                        />
                      ) : (
                        <span className="font-display font-bold text-primary text-lg">R</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload} 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 border-border/50" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                      >
                        <Upload size={14} /> {t("sett.upload_logo")}
                      </Button>
                      {logoPreview && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleChange('logoScale', Math.max(50, formData.logoScale - 10))} 
                            className="p-1 rounded hover:bg-secondary"
                          >
                            <ZoomOut size={14} />
                          </button>
                          <span className="text-xs text-muted-foreground w-10 text-center">
                            {formData.logoScale}%
                          </span>
                          <button 
                            onClick={() => handleChange('logoScale', Math.min(200, formData.logoScale + 10))} 
                            className="p-1 rounded hover:bg-secondary"
                          >
                            <ZoomIn size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Name */}
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.business_name")}</label>
                  <Input 
                    className="bg-secondary/50 border-border/50" 
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                  />
                </div>

                {/* VAT */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.vat")}</label>
                  <Input 
                    className="bg-secondary/50 border-border/50" 
                    placeholder="e.g. FR12345678901"
                    value={formData.vatNumber}
                    onChange={(e) => handleChange('vatNumber', e.target.value)}
                  />
                </div>

                {/* Trade Number */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.trade")}</label>
                  <Input 
                    className="bg-secondary/50 border-border/50" 
                    placeholder="e.g. 123456789"
                    value={formData.tradeNumber}
                    onChange={(e) => handleChange('tradeNumber', e.target.value)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.contact_email")}</label>
                  <Input 
                    className="bg-secondary/50 border-border/50" 
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => handleChange('companyEmail', e.target.value)}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.country")}</label>
                  <select 
                    value={selectedCountry.name} 
                    onChange={(e) => handleCountryChange(e.target.value)} 
                    className="w-full h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm"
                  >
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.phone")}</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 px-3 rounded-md border border-border/50 bg-secondary/50 text-sm min-w-[80px]">
                      <span>{selectedCountry.flag}</span>
                      <span className="text-xs">{selectedCountry.code}</span>
                    </div>
                    <Input 
                      className="bg-secondary/50 border-border/50 flex-1"
                      value={formData.companyPhone}
                      onChange={(e) => handleChange('companyPhone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.address")}</label>
                  <Input 
                    className="bg-secondary/50 border-border/50"
                    value={formData.companyAddress}
                    onChange={(e) => handleChange('companyAddress', e.target.value)}
                  />
                </div>
              </div>

              <Button 
                size="sm" 
                className="mt-6 glow-red-hover"
                onClick={handleSaveGeneral}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {t("sett.save_changes")}
              </Button>
            </motion.div>

            {/* Branding */}
            <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{t("sett.branding")}</h3>
                  <p className="text-xs text-muted-foreground">{t("sett.branding_desc")}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Primary Color */}
                <div className="flex items-center gap-4">
                  <label className="text-xs text-muted-foreground">{t("sett.primary_color")}</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={formData.primaryColor} 
                      onChange={(e) => handleChange('primaryColor', e.target.value)} 
                      className="w-10 h-10 rounded-lg border border-border/50 cursor-pointer bg-transparent" 
                    />
                    <Input 
                      className="w-28 bg-secondary/50 border-border/50" 
                      value={formData.primaryColor} 
                      onChange={(e) => handleChange('primaryColor', e.target.value)} 
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="flex items-center gap-4">
                  <label className="text-xs text-muted-foreground">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={formData.secondaryColor} 
                      onChange={(e) => handleChange('secondaryColor', e.target.value)} 
                      className="w-10 h-10 rounded-lg border border-border/50 cursor-pointer bg-transparent" 
                    />
                    <Input 
                      className="w-28 bg-secondary/50 border-border/50" 
                      value={formData.secondaryColor} 
                      onChange={(e) => handleChange('secondaryColor', e.target.value)} 
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-lg bg-secondary/30 p-4">
                  <p className="text-xs text-muted-foreground mb-2">{t("sett.preview")}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: formData.primaryColor }} />
                    <span className="text-sm font-medium">{t("sett.your_brand")}</span>
                    <button 
                      className="ml-auto px-4 py-1.5 rounded-lg text-xs font-medium text-foreground" 
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      {t("sett.leave_review")}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                size="sm" 
                className="mt-6 glow-red-hover"
                onClick={handleSaveBranding}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Branding
              </Button>
            </motion.div>

            {/* reCAPTCHA */}
            <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold">{t("sett.recaptcha")}</h3>
                  <p className="text-xs text-muted-foreground">{t("sett.recaptcha_desc")}</p>
                </div>
                <Toggle 
                  value={formData.captchaEnabled} 
                  onChange={(val) => handleChange('captchaEnabled', val)} 
                />
              </div>

              {formData.captchaEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.site_key")}</label>
                    <Input 
                      className="bg-secondary/50 border-border/50 font-mono text-xs" 
                      placeholder="6Lc..."
                      value={formData.captchaSiteKey}
                      onChange={(e) => handleChange('captchaSiteKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.secret_key")}</label>
                    <Input 
                      className="bg-secondary/50 border-border/50 font-mono text-xs" 
                      type="password" 
                      placeholder="6Lc..."
                      value={formData.captchaSecret}
                      onChange={(e) => handleChange('captchaSecret', e.target.value)}
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="glow-red-hover"
                    onClick={handleSaveRecaptcha}
                    disabled={saving}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {t("sett.save_recaptcha")}
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Google Maps */}
            <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold">{t("sett.maps_api")}</h3>
                  <p className="text-xs text-muted-foreground">{t("sett.maps_desc")}</p>
                </div>
                <Toggle 
                  value={formData.mapsEnabled} 
                  onChange={(val) => handleChange('mapsEnabled', val)} 
                />
              </div>

              {formData.mapsEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.cloud_api_key")}</label>
                    <Input 
                      className="bg-secondary/50 border-border/50 font-mono text-xs" 
                      placeholder="AIza..."
                      value={formData.mapsApiKey}
                      onChange={(e) => handleChange('mapsApiKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">{t("sett.cloud_secret")}</label>
                    <Input 
                      className="bg-secondary/50 border-border/50 font-mono text-xs" 
                      type="password" 
                      placeholder="Enter secret..."
                      value={formData.mapsCloudSecret}
                      onChange={(e) => handleChange('mapsCloudSecret', e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t("sett.maps_note")}</p>
                  <Button 
                    size="sm" 
                    className="glow-red-hover"
                    onClick={handleSaveMaps}
                    disabled={saving}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {t("sett.save_maps")}
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* TAB PLATFORMS */}
          <TabsContent value="platforms">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Link2 size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{t("sett.platforms_title")}</h3>
                  <p className="text-xs text-muted-foreground">{t("sett.platforms_desc")}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { labelKey: "sett.google_link", key: "googleLink" },
                  { labelKey: "sett.facebook_link", key: "facebookLink" },
                  { labelKey: "sett.yelp_link", key: "yelpLink" },
                  { labelKey: "sett.tripadvisor_link", key: "tripadvisorLink" },
                  { labelKey: "sett.custom_link", key: "customReviewLink" },
                ].map((platform) => (
                  <div key={platform.key}>
                    <label className="text-xs text-muted-foreground mb-1.5 block">
                      {t(platform.labelKey)}
                    </label>
                    <Input 
                      className="bg-secondary/50 border-border/50" 
                      placeholder="https://..."
                      value={formData[platform.key]}
                      onChange={(e) => handleChange(platform.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <Button 
                size="sm" 
                className="mt-6 glow-red-hover"
                onClick={handleSavePlatforms}
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {t("sett.save_platforms")}
              </Button>
            </motion.div>
          </TabsContent>

          {/* TAB SECURITY */}
          <TabsContent value="security">
            <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{t("sett.security_title")}</h3>
                  <p className="text-xs text-muted-foreground">{t("sett.security_desc")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
                  <div>
                    <span className="text-sm font-medium block">{t("sett.two_factor")}</span>
                    <span className="text-xs text-muted-foreground">{t("sett.two_factor_desc")}</span>
                  </div>
                  <Toggle 
                    value={formData.twoFactorEnabled} 
                    onChange={(val) => handleChange('twoFactorEnabled', val)} 
                  />
                </div>

                {formData.twoFactorEnabled && (
                  <div className="space-y-3 border-l-2 border-primary/30 pl-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <span className="text-sm">Email 2FA</span>
                      <Toggle 
                        value={formData.twoFactorEmail} 
                        onChange={(val) => handleChange('twoFactorEmail', val)} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <span className="text-sm">Phone 2FA</span>
                      <Toggle 
                        value={formData.twoFactorPhone} 
                        onChange={(val) => handleChange('twoFactorPhone', val)} 
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                      <span className="text-sm">Google 2FA</span>
                      <Toggle 
                        value={formData.twoFactorGoogle} 
                        onChange={(val) => handleChange('twoFactorGoogle', val)} 
                      />
                    </div>
                  </div>
                )}

                <Button 
                  size="sm" 
                  className="glow-red-hover"
                  onClick={handleSaveSecurity}
                  disabled={saving}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Security Settings
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
};

export default Settings;