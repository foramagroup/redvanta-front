"use client";

import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const FeatureFlags = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const loadFlags = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/feature-flags-settings`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to load feature flags");
      }

      setFlags(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err.message || "Failed to load feature flags");
      setFlags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggle = async (flag) => {
    setError("");
    setTogglingId(flag.id);

    try {
      const res = await fetch(`${apiBase}/superadmin/feature-flags-settings/${flag.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: !flag.enabled,
        }),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || "Failed to update feature flag");
      }

      setFlags((current) =>
        current.map((item) => (item.id === flag.id ? payload : item))
      );
      toast({
        title: payload.enabled ? "Feature flag enabled" : "Feature flag disabled",
      });
    } catch (err) {
      setError(err.message || "Failed to update feature flag");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <SuperAdminLayout title={t("sa.flags_title")} subtitle={t("sa.flags_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 max-w-3xl">
        {loading ? (
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-sm text-muted-foreground">Loading feature flags...</CardContent>
          </Card>
        ) : flags.length === 0 ? (
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-sm text-muted-foreground">No feature flags found.</CardContent>
          </Card>
        ) : flags.map((flag) => (
          <Card key={flag.id || flag.name} className="bg-card border-border/50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">{flag.name}</code>
                  <Badge variant="outline" className="border-border/50 text-xs">{flag.scope || "Global"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{flag.description || "-"}</p>
              </div>
              <Switch
                checked={Boolean(flag.enabled)}
                disabled={togglingId === flag.id}
                onCheckedChange={() => handleToggle(flag)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </SuperAdminLayout>
  );
};

export default FeatureFlags;
