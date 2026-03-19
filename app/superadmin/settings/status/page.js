"use client";

import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const statusColor = {
  Operational: "bg-green-500/10 text-green-500 border-green-500/20",
  Degraded: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Down: "bg-primary/10 text-primary border-primary/20",
};

const translateStatus = (status, t) => {
  if (status === "Operational") return t("sa.status_operational");
  if (status === "Degraded") return "Degraded";
  return "Down";
};

const SystemStatus = () => {
  const { t } = useLanguage();
  const [data, setData] = useState({ summary: null, services: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/api/superadmin/status-settings`, {
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load status");
      }

      setData({
        summary: payload?.summary || null,
        services: Array.isArray(payload?.services) ? payload.services : [],
      });
    } catch (err) {
      setError(err.message || "Failed to load status");
      setData({ summary: null, services: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const cards = useMemo(() => ([
    {
      labelKey: "sa.status_overall",
      value: data.summary ? translateStatus(data.summary.overall, t) : "--",
      icon: CheckCircle,
      color: data.summary?.overall === "Down" ? "text-primary" : data.summary?.overall === "Degraded" ? "text-yellow-500" : "text-green-500",
    },
    {
      labelKey: "sa.status_avg_latency",
      value: data.summary?.averageLatency || "--",
      icon: Clock,
      color: "text-foreground",
    },
    {
      labelKey: "sa.status_queue_depth",
      value: data.summary?.queueDepth ?? 0,
      icon: Activity,
      color: "text-foreground",
    },
    {
      labelKey: "sa.status_active_workers",
      value: data.summary?.activeWorkers || "--",
      icon: Server,
      color: "text-green-500",
    },
  ]), [data.summary, t]);

  return (
    <SuperAdminLayout title={t("sa.status_title")} subtitle={t("sa.status_subtitle")}>
      {error ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((metric) => (
          <Card key={metric.labelKey} className="bg-card border-border/50">
            <CardContent className="p-4">
              <metric.icon size={16} className={`${metric.color} mb-2`} />
              <p className="text-xs text-muted-foreground">{t(metric.labelKey)}</p>
              <p className="text-xl font-bold font-display mt-1">{loading ? "--" : metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 max-w-4xl">
        {loading ? (
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-sm text-muted-foreground">Loading system status...</CardContent>
          </Card>
        ) : data.services.length === 0 ? (
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-sm text-muted-foreground">No service status available.</CardContent>
          </Card>
        ) : data.services.map((service) => (
          <Card key={service.name} className="bg-card border-border/50">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-2 h-2 rounded-full ${service.status === "Operational" ? "bg-green-500" : service.status === "Degraded" ? "bg-yellow-500" : "bg-primary"}`} />
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{t("sa.status_latency")}: {service.latency}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:w-32">
                  <Progress value={service.uptime} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{service.uptime}% {t("sa.status_uptime")}</p>
                </div>
                <Badge className={statusColor[service.status] || statusColor.Operational}>{translateStatus(service.status, t)}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SuperAdminLayout>
  );
};

export default SystemStatus;
