"use client";

import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const planDist = [
  { name: "Starter", value: 420, color: "hsl(0,0%,40%)" },
  { name: "Growth", value: 380, color: "hsl(0,0%,60%)" },
  { name: "Pro", value: 310, color: "hsl(1,100%,44%)" },
  { name: "Agency", value: 174, color: "hsl(1,100%,60%)" },
];

const revenueBySegment = [
  { segment: "Direct", revenue: 52000 },
  { segment: "Agency", revenue: 33420 },
];

const SuperAdminAnalytics = () => {
  const { t } = useLanguage();

  return (
    <SuperAdminLayout title={t("sa.anal_title")} subtitle={t("sa.anal_subtitle")}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { labelKey: "sa.anal_ltv", value: "$2,840" },
          { labelKey: "sa.anal_attach_rate", value: "34%" },
          { labelKey: "sa.anal_trial_paid", value: "28.4%" },
          { labelKey: "sa.anal_avg_revenue", value: "$81.60" },
        ].map(m => (
          <Card key={m.labelKey} className="bg-card border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t(m.labelKey)}</p>
              <p className="text-xl font-bold font-display mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.anal_plan_dist")}</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={planDist} dataKey="value" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {planDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.anal_revenue_segment")}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueBySegment}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
                <XAxis dataKey="segment" stroke="hsl(0,0%,40%)" fontSize={12} />
                <YAxis stroke="hsl(0,0%,40%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="hsl(1,100%,44%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalytics;
