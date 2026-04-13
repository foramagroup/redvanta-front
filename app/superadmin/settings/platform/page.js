"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const PlatformSettings = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [smsSettings, setSmsSettings] = useState([]);
  const [form, setForm] = useState({
    platform_name: "",
    default_email_sender: "",
    sms_setting_id: "",
    rate_limit: "60",
    is_maintenance: false,
  });

  const loadSettings = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/platform-settings`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load platform settings");
      }

      const platformSetting = payload?.platformSetting || {};
      setSmsSettings(Array.isArray(payload?.smsSettings) ? payload.smsSettings : []);
      setForm({
        platform_name: platformSetting.platform_name || "",
        default_email_sender: platformSetting.default_email_sender || "",
        sms_setting_id: platformSetting.sms_setting_id ? String(platformSetting.sms_setting_id) : "",
        rate_limit: platformSetting.rate_limit != null ? String(platformSetting.rate_limit) : "60",
        is_maintenance: Boolean(
          platformSetting.is_maintenance ?? platformSetting.is_maIntenance
        ),
      });
    } catch (err) {
      setError(err.message || "Failed to load platform settings");
      setSmsSettings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setError("");

    if (!form.platform_name || !form.default_email_sender || !form.rate_limit) {
      setError("Please fill in platform name, sender email and API rate limit.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${apiBase}/superadmin/platform-settings`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform_name: form.platform_name,
          default_email_sender: form.default_email_sender,
          sms_setting_id: form.sms_setting_id ? Number(form.sms_setting_id) : null,
          rate_limit: Number(form.rate_limit),
          is_maintenance: form.is_maintenance,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to save platform settings");
      }

      await loadSettings();
      toast({ title: "Platform settings updated" });
    } catch (err) {
      setError(err.message || "Failed to save platform settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout title={t("sa.plat_title")} subtitle={t("sa.plat_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.plat_general")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("sa.plat_name")}</Label>
              <Input
                value={form.platform_name}
                disabled={loading || saving}
                className="mt-1 bg-secondary border-border/50"
                onChange={(e) => setForm((current) => ({ ...current, platform_name: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t("sa.plat_email_sender")}</Label>
              <Input
                type="email"
                value={form.default_email_sender}
                disabled={loading || saving}
                className="mt-1 bg-secondary border-border/50"
                onChange={(e) => setForm((current) => ({ ...current, default_email_sender: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t("sa.plat_sms_provider")}</Label>
              <Select
                value={form.sms_setting_id || undefined}
                disabled={loading || saving || smsSettings.length === 0}
                onValueChange={(value) => setForm((current) => ({ ...current, sms_setting_id: value }))}
              >
                <SelectTrigger className="mt-1 bg-secondary border-border/50">
                  <SelectValue placeholder={loading ? "Loading..." : t("sa.plat_sms_provider")} />
                </SelectTrigger>
                <SelectContent>
                  {smsSettings.map((setting) => (
                    <SelectItem key={setting.id} value={String(setting.id)}>
                      {setting.supplier?.name || `#${setting.supplier_id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.plat_rate_limits")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t("sa.plat_api_rate")}</Label>
              <Input
                type="number"
                min="1"
                value={form.rate_limit}
                disabled={loading || saving}
                className="mt-1 bg-secondary border-border/50"
                onChange={(e) => setForm((current) => ({ ...current, rate_limit: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("sa.plat_maintenance")}</Label>
                <p className="text-xs text-muted-foreground">{t("sa.plat_maintenance_desc")}</p>
              </div>
              <Switch
                checked={form.is_maintenance}
                disabled={loading || saving}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, is_maintenance: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <Button className="mt-6" disabled={loading || saving} onClick={handleSave}>
        {saving ? "Saving..." : t("sa.plat_save")}
      </Button>
    </SuperAdminLayout>
  );
};

export default PlatformSettings;
