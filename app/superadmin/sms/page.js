"use client";

import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, CheckCircle, XCircle, DollarSign, Globe } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const countries = [
  { country: "United States", sent: 32400, delivered: 31700, rate: "97.8%", cost: "$972.00" },
  { country: "Canada", sent: 8200, delivered: 7950, rate: "96.9%", cost: "$287.00" },
  { country: "United Kingdom", sent: 4800, delivered: 4680, rate: "97.5%", cost: "$144.00" },
  { country: "Australia", sent: 2891, delivered: 2800, rate: "96.8%", cost: "$45.73" },
];

const blacklist = [
  { number: "+1-555-0123", reason: "User opt-out", added: "2026-01-15" },
  { number: "+1-555-0456", reason: "Spam complaint", added: "2026-02-02" },
  { number: "+44-7911-123456", reason: "Invalid number", added: "2026-02-20" },
];

const SmsControl = () => {
  const [showAddNumber, setShowAddNumber] = useState(false);
  const { t } = useLanguage();

  const metrics = [
    { labelKey: "sa.sms_total", value: "48,291", icon: MessageSquare },
    { labelKey: "sa.sms_delivery", value: "97.2%", icon: CheckCircle },
    { labelKey: "sa.sms_failed", value: "2.8%", icon: XCircle },
    { labelKey: "sa.sms_cost", value: "$1,448.73", icon: DollarSign },
  ];

  return (
    <SuperAdminLayout title={t("sa.sms_title")} subtitle={t("sa.sms_subtitle")}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe size={16} />{t("sa.sms_country_breakdown")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>{t("sa.sms_country")}</TableHead><TableHead>{t("sa.sms_sent")}</TableHead><TableHead>{t("sa.sms_rate")}</TableHead><TableHead>{t("sa.sms_cost_col")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map(c => (
                  <TableRow key={c.country} className="border-border/50">
                    <TableCell className="font-medium">{c.country}</TableCell>
                    <TableCell>{c.sent.toLocaleString()}</TableCell>
                    <TableCell>{c.rate}</TableCell>
                    <TableCell>{c.cost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("sa.sms_blacklist")}</CardTitle>
            <Button size="sm" variant="outline" className="border-border/50" onClick={() => setShowAddNumber(true)}>{t("sa.sms_add_number")}</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>{t("sa.sms_number")}</TableHead><TableHead>{t("sa.sms_reason")}</TableHead><TableHead>{t("sa.sms_added")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blacklist.map(b => (
                  <TableRow key={b.number} className="border-border/50">
                    <TableCell className="font-mono text-sm">{b.number}</TableCell>
                    <TableCell>{b.reason}</TableCell>
                    <TableCell>{b.added}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddNumber} onOpenChange={setShowAddNumber}>
        <DialogContent className="bg-card border-border/50 sm:max-w-md">
          <DialogHeader><DialogTitle>{t("sa.sms_add_to_blacklist")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("sa.sms_phone")}</Label><Input placeholder="+1-555-000-0000" className="mt-1 bg-secondary border-border/50" /></div>
            <div>
              <Label>{t("sa.sms_reason")}</Label>
              <Select><SelectTrigger className="mt-1 bg-secondary border-border/50"><SelectValue placeholder={t("sa.sms_select_reason")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="opt-out">{t("sa.sms_opt_out")}</SelectItem>
                  <SelectItem value="spam">{t("sa.sms_spam")}</SelectItem>
                  <SelectItem value="invalid">{t("sa.sms_invalid")}</SelectItem>
                  <SelectItem value="abuse">{t("sa.sms_abuse")}</SelectItem>
                  <SelectItem value="other">{t("sa.sms_other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t("sa.sms_notes")}</Label><Input placeholder="Additional context..." className="mt-1 bg-secondary border-border/50" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddNumber(false)}>{t("sa.sms_cancel")}</Button><Button>{t("sa.sms_add_to_blacklist")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default SmsControl;

