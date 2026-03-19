"use client";

import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plug, AlertTriangle, Activity, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const integrations = [
  { account: "Urban Bites NYC", type: "POS", status: "Active", events: "2,841", errors: "0" },
  { account: "CloudDine Group", type: "CRM", status: "Active", events: "12,402", errors: "3" },
  { account: "Glow Beauty Co", type: "Webhook", status: "Error", events: "1,204", errors: "47" },
  { account: "FreshFit Gym", type: "API", status: "Active", events: "820", errors: "0" },
  { account: "PetPals Clinic", type: "Webhook", status: "Disconnected", events: "0", errors: "0" },
];

const statusColor = {
  Active: "bg-green-500/10 text-green-500 border-green-500/20",
  Error: "bg-primary/10 text-primary border-primary/20",
  Disconnected: "bg-muted text-muted-foreground border-border",
};

const SuperAdminIntegrations = () => {
  const { t } = useLanguage();

  const metrics = [
    { labelKey: "sa.int_active_webhooks", value: "342", icon: Plug },
    { labelKey: "sa.int_failed_24h", value: "12", icon: AlertTriangle },
    { labelKey: "sa.int_api_traffic", value: "184K", icon: Activity },
    { labelKey: "sa.int_rate_alerts", value: "3", icon: Zap },
  ];

  return (
    <SuperAdminLayout title={t("sa.int_title")} subtitle={t("sa.int_subtitle")}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(m => (
          <Card key={m.labelKey} className="bg-card border-border/50">
            <CardContent className="p-4">
              <m.icon size={16} className="text-primary mb-2" />
              <p className="text-xs text-muted-foreground">{t(m.labelKey)}</p>
              <p className="text-xl font-bold font-display mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader><CardTitle className="text-base">{t("sa.int_status")}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.int_account")}</TableHead><TableHead>{t("sa.int_type")}</TableHead><TableHead>{t("sa.ev_status")}</TableHead>
                <TableHead>{t("sa.int_events_24h")}</TableHead><TableHead>{t("sa.int_errors")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((ig, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell className="font-medium">{ig.account}</TableCell>
                  <TableCell>{ig.type}</TableCell>
                  <TableCell><Badge className={statusColor[ig.status]}>{t(`sa.int_st_${ig.status.toLowerCase()}`)}</Badge></TableCell>
                  <TableCell>{ig.events}</TableCell>
                  <TableCell className={Number(ig.errors) > 0 ? "text-primary font-medium" : ""}>{ig.errors}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SuperAdminLayout>
  );
};

export default SuperAdminIntegrations;
