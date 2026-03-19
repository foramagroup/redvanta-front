"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Building2, CreditCard, Activity, Plug, MessageSquare, BarChart3,
  Settings, Sliders, DollarSign, Package, Shield, Flag, Lock, FileText, Server,
  Menu, X, ChevronDown, ChevronRight, Globe, Coins, Wallet, Smartphone,
  FileStack, HelpCircle, FolderOpen, Mail, Webhook, MessageCircle, ShoppingBag, ClipboardList, Palette
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SuperAdminNavbar from "@/components/admin/SuperAdminNavbar";
import { useLanguage } from "@/contexts/LanguageContext";

const mainItems = [
  { icon: LayoutDashboard, labelKey: "sa.sidebar_dashboard", path: "/superadmin/dashboard" },
  { icon: Users, labelKey: "sa.sidebar_accounts", path: "/superadmin/accounts" },
  { icon: Building2, labelKey: "sa.sidebar_agencies", path: "/superadmin/agencies" },
  { icon: ClipboardList, labelKey: "sa.sidebar_orders", path: "/superadmin/orders" },
  { icon: CreditCard, labelKey: "sa.sidebar_billing", path: "/superadmin/billing" },
  { icon: Activity, labelKey: "sa.sidebar_events", path: "/superadmin/events" },
  { icon: Plug, labelKey: "sa.sidebar_integrations", path: "/superadmin/integrations" },
  { icon: MessageSquare, labelKey: "sa.sidebar_sms", path: "/superadmin/sms" },
  { icon: BarChart3, labelKey: "sa.sidebar_analytics", path: "/superadmin/analytics" },
  { icon: ShoppingBag, labelKey: "sa.sidebar_products", path: "/superadmin/products" },
  { icon: Palette, labelKey: "sa.sidebar_all_designs", path: "/superadmin/designs" },
];

const settingsItems = [
  { icon: Sliders, labelKey: "sa.sidebar_platform", path: "/superadmin/settings/platform" },
  { icon: DollarSign, labelKey: "sa.sidebar_plans", path: "/superadmin/settings/plans" },
  { icon: Package, labelKey: "sa.sidebar_addons", path: "/superadmin/settings/addons" },
  { icon: Shield, labelKey: "sa.sidebar_roles", path: "/superadmin/settings/roles-permissions" },
  { icon: Flag, labelKey: "sa.sidebar_flags", path: "/superadmin/settings/flags" },
  { icon: Lock, labelKey: "sa.sidebar_security", path: "/superadmin/settings/security" },
  { icon: FileText, labelKey: "sa.sidebar_audit", path: "/superadmin/settings/audit" },
  { icon: Server, labelKey: "sa.sidebar_status", path: "/superadmin/settings/status" },
  { icon: Smartphone, labelKey: "sa.sidebar_sms_api", path: "/superadmin/settings/sms-api" },
    { icon: Smartphone, labelKey: "Email Server Config", path: "/superadmin/settings/email-server-config" },
  { icon: Globe, labelKey: "sa.sidebar_languages", path: "/superadmin/settings/languages" },
  { icon: Coins, labelKey: "sa.sidebar_currency", path: "/superadmin/settings/currency" },
  { icon: Wallet, labelKey: "sa.sidebar_payments", path: "/superadmin/settings/payments" },
  { icon: MessageCircle, labelKey: "sa.sidebar_sms_templates", path: "/superadmin/settings/sms-templates" },
  { icon: Mail, labelKey: "sa.sidebar_email_templates", path: "/superadmin/settings/email-templates" },
  { icon: Webhook, labelKey: "sa.sidebar_webhooks", path: "/superadmin/settings/webhooks" },
];

const pagesItems = [
  { icon: FolderOpen, labelKey: "sa.sidebar_all_pages", path: "/superadmin/pages/all" },
  { icon: HelpCircle, labelKey: "sa.sidebar_faq_pages", path: "/superadmin/pages/faq" },
  { icon: FileStack, labelKey: "sa.sidebar_faq_categories", path: "/superadmin/pages/faq-categories" },
];

const SuperAdminLayout = ({ children, title, subtitle, headerAction }) => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSettingsActive = settingsItems.some(item => pathname === item.path);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
  const isPagesActive = pagesItems.some(item => pathname === item.path);
  const [pagesOpen, setPagesOpen] = useState(isPagesActive);

  const NavItem = ({ item }) => {
    const isActive = pathname === item.path;
    return (
      <Link
        href={item.path}
        onClick={() => setMobileOpen(false)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-primary/10 text-primary border-glow"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <item.icon size={18} />
        {t(item.labelKey)}
      </Link>
    );
  };

  return (
    <>
      <SuperAdminNavbar />
      <div className=" overflow-hidden">
      <div className="flex h-full">
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} fixed top-16 bottom-0 left-0 z-50 lg:relative lg:top-0 lg:translate-x-0 w-64 flex-shrink-0 flex-col border-r border-border/50 bg-card p-4 flex transition-transform duration-300 overflow-y-auto`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>

          <div className="mb-6 px-3 pt-2">
            <span className="font-display text-lg font-bold text-primary">REDVANTA</span>
            <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
          </div>

          <div className="space-y-1">
            {mainItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <div className="flex items-center gap-3">
                  <Settings size={18} />
                  {t("sa.sidebar_settings")}
                </div>
                {settingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1 ml-2">
                {settingsItems.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="mt-2 pt-2 border-t border-border/50">
            <Collapsible open={pagesOpen} onOpenChange={setPagesOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <div className="flex items-center gap-3">
                  <FileStack size={18} />
                  {t("sa.sidebar_pages")}
                </div>
                {pagesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1 ml-2">
                {pagesItems.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto dashboard-scroll-area">
          <div className="p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileOpen(true)}
                    className="lg:hidden p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground"
                  >
                    <Menu size={20} />
                  </button>
                  <div>
                    <h1 className="font-display text-2xl font-bold">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                  </div>
                </div>
                {headerAction}
              </div>
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      </div>
    </>
  );
};

export default SuperAdminLayout;
