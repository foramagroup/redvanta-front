"use client";

import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, Zap, MessageSquare, Activity, AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const revenueData = [
  { month: "Jul", revenue: 42000 }, { month: "Aug", revenue: 48000 }, { month: "Sep", revenue: 53000 },
  { month: "Oct", revenue: 58000 }, { month: "Nov", revenue: 64000 }, { month: "Dec", revenue: 71000 },
  { month: "Jan", revenue: 78000 }, { month: "Feb", revenue: 85000 },
];

const signupData = [
  { week: "W1", signups: 24 }, { week: "W2", signups: 31 }, { week: "W3", signups: 28 },
  { week: "W4", signups: 42 }, { week: "W5", signups: 38 }, { week: "W6", signups: 45 },
  { week: "W7", signups: 52 }, { week: "W8", signups: 48 },
];

const eventData = [
  { day: "Mon", events: 12400 }, { day: "Tue", events: 14200 }, { day: "Wed", events: 13800 },
  { day: "Thu", events: 15600 }, { day: "Fri", events: 14900 }, { day: "Sat", events: 9800 }, { day: "Sun", events: 8200 },
];

const SuperAdminDashboard = () => {
  const { t } = useLanguage();

  const metrics = [
    { labelKey: "sa.dash_total_accounts", value: "1,284", icon: Users, change: "+12%" },
    { labelKey: "sa.dash_active_subs", value: "1,047", icon: CreditCard, change: "+8%" },
    { labelKey: "sa.dash_mrr", value: "$85,420", icon: TrendingUp, change: "+14%" },
    { labelKey: "sa.dash_api_calls", value: "2.4M", icon: Zap, change: "+22%" },
    { labelKey: "sa.dash_sms_sent", value: "48,291", icon: MessageSquare, change: "+5%" },
    { labelKey: "sa.dash_events_processed", value: "1.2M", icon: Activity, change: "+18%" },
    { labelKey: "sa.dash_failed_webhooks", value: "47", icon: AlertTriangle, change: "-23%" },
  ];

  return (
    <SuperAdminLayout title={t("sa.dash_title")} subtitle={t("sa.dash_subtitle")}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        {metrics.map((m) => (
          <Card key={m.labelKey} className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">{t(m.labelKey)}</span>
              </div>
              <p className="text-xl font-bold font-display">{m.value}</p>
              <span className={`text-xs ${m.change.startsWith("+") ? "text-green-500" : "text-primary"}`}>{m.change}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.dash_revenue_growth")}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(1, 100%, 44%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(1, 100%, 44%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
                <XAxis dataKey="month" stroke="hsl(0,0%,40%)" fontSize={12} />
                <YAxis stroke="hsl(0,0%,40%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(1,100%,44%)" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.dash_new_signups")}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
                <XAxis dataKey="week" stroke="hsl(0,0%,40%)" fontSize={12} />
                <YAxis stroke="hsl(0,0%,40%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8 }} />
                <Bar dataKey="signups" fill="hsl(1,100%,44%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.dash_churn_rate")}</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold font-display">2.4%</p>
              <p className="text-sm text-muted-foreground mt-1">{t("sa.dash_monthly_churn")}</p>
              <p className="text-xs text-green-500 mt-2">↓ 0.3% {t("sa.dash_from_last_month")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">{t("sa.dash_event_volume")}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,16%)" />
                <XAxis dataKey="day" stroke="hsl(0,0%,40%)" fontSize={12} />
                <YAxis stroke="hsl(0,0%,40%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,16%)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="events" stroke="hsl(1,100%,44%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
