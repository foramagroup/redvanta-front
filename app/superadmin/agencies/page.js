"use client";

import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Ban, Check, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const agencies = [
  { name: "ReputationPro Agency", subAccounts: 24, mrr: "$23,976", whiteLabel: true, status: "Active", owner: "Jessica Lane", email: "jess@reputationpro.com", created: "2024-08-10", accounts: ["Urban Bites NYC", "CloudDine Group", "FreshFit Gym"] },
  { name: "LocalBoost Media", subAccounts: 12, mrr: "$11,988", whiteLabel: true, status: "Active", owner: "David Park", email: "david@localboost.io", created: "2025-01-15", accounts: ["Glow Beauty Co", "PetPals Clinic"] },
  { name: "StarReview Partners", subAccounts: 8, mrr: "$7,992", whiteLabel: false, status: "Active", owner: "Maria Santos", email: "maria@starreview.com", created: "2025-04-22", accounts: ["Metro Auto Care"] },
  { name: "GrowthStack Digital", subAccounts: 3, mrr: "$2,997", whiteLabel: false, status: "Trial", owner: "Tom Reed", email: "tom@growthstack.co", created: "2026-01-30", accounts: [] },
  { name: "BrandLift Co", subAccounts: 0, mrr: "$0", whiteLabel: false, status: "Suspended", owner: "Amy Walsh", email: "amy@brandlift.com", created: "2025-09-08", accounts: [] },
];

const statusColor = {
  Active: "bg-green-500/10 text-green-500 border-green-500/20",
  Trial: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Suspended: "bg-primary/10 text-primary border-primary/20",
};

const Agencies = () => {
  const [viewAgency, setViewAgency] = useState(null);
  const { t } = useLanguage();

  return (
    <SuperAdminLayout title={t("sa.ag_title")} subtitle={t("sa.ag_subtitle")}>
      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>{t("sa.ag_name")}</TableHead><TableHead>{t("sa.ag_sub_accounts")}</TableHead><TableHead>{t("sa.ag_total_mrr")}</TableHead>
                <TableHead>{t("sa.ag_white_label")}</TableHead><TableHead>{t("sa.ag_status")}</TableHead><TableHead>{t("sa.ag_actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencies.map(a => (
                <TableRow key={a.name} className="border-border/50">
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.subAccounts}</TableCell>
                  <TableCell>{a.mrr}</TableCell>
                  <TableCell>{a.whiteLabel ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-muted-foreground" />}</TableCell>
                  <TableCell><Badge className={statusColor[a.status]}>{t(`sa.ag_st_${a.status.toLowerCase()}`)}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical size={16} /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewAgency(a)}><Eye size={14} className="mr-2" />{t("sa.ag_view_details")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-primary"><Ban size={14} className="mr-2" />{t("sa.ag_suspend")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!viewAgency} onOpenChange={() => setViewAgency(null)}>
        <SheetContent className="bg-card border-border/50 sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{t("sa.ag_details")}</SheetTitle></SheetHeader>
          {viewAgency && (
            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                {[
                  { labelKey: "sa.ag_name", value: viewAgency.name },
                  { labelKey: "sa.ag_owner", value: viewAgency.owner },
                  { labelKey: "sa.ag_email", value: viewAgency.email },
                  { labelKey: "sa.ag_created", value: viewAgency.created },
                  { labelKey: "sa.ag_sub_accounts", value: String(viewAgency.subAccounts) },
                  { labelKey: "sa.ag_total_mrr", value: viewAgency.mrr },
                  { labelKey: "sa.ag_white_label", value: viewAgency.whiteLabel ? t("sa.ag_enabled") : t("sa.ag_disabled") },
                ].map(item => (
                  <div key={item.labelKey} className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-sm text-muted-foreground">{t(item.labelKey)}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("sa.ag_status")}</span>
                  <Badge className={statusColor[viewAgency.status]}>{t(`sa.ag_st_${viewAgency.status.toLowerCase()}`)}</Badge>
                </div>
              </div>

              {viewAgency.accounts.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">{t("sa.ag_sub_accounts")}</p>
                  <div className="space-y-2">
                    {viewAgency.accounts.map(acc => (
                      <div key={acc} className="bg-secondary rounded-lg px-3 py-2 text-sm">{acc}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </SuperAdminLayout>
  );
};

export default Agencies;
