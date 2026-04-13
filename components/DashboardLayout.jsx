"use client";

import { motion } from "framer-motion";
import { Star, TrendingUp, MapPin, MessageSquare, BarChart3, Bell, Settings, Users, Home, Zap, Filter, Menu, X, Plug, Plug2, Code2, Terminal, CreditCard, Activity, Package, Crown, PanelLeftClose, PanelLeft, ShoppingBag, ClipboardList, Truck, ChevronDown, ChevronRight, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const sidebarItems = [
  { icon: Home, labelKey: "dash.dashboard", path: "/dashboard" },
  { icon: Palette, labelKey: "dash.my_designs", path: "/dashboard/designs" },
  { icon: Star, labelKey: "dash.reviews", path: "/dashboard/reviews" },
  { icon: MessageSquare, labelKey: "dash.my_cards", path: "/dashboard/my-cards" },
  { icon: MessageSquare, labelKey: "dash.requests", path: "/dashboard/requests" },
  { icon: Filter, labelKey: "dash.filtering", path: "/dashboard/filtering" },
  { icon: BarChart3, labelKey: "dash.analytics", path: "/dashboard/analytics" },
  { icon: MapPin, labelKey: "dash.locations", path: "/dashboard/locations" },
  { icon: Zap, labelKey: "dash.automation", path: "/dashboard/automation" },
  { icon: Users, labelKey: "dash.team", path: "/dashboard/team" },
  { icon: Bell, labelKey: "dash.alerts", path: "/dashboard/alerts" },
  { icon: Plug, labelKey: "dash.connected", path: "/dashboard/integrations" },
  { icon: Plug2, labelKey: "dash.marketplace", path: "/dashboard/marketplace" },
  { icon: Code2, labelKey: "dash.api", path: "/dashboard/api" },
  { icon: Terminal, labelKey: "dash.developer", path: "/dashboard/developer" },
  { icon: CreditCard, labelKey: "dash.billing", path: "/dashboard/billing" },
  { icon: Activity, labelKey: "dash.events", path: "/dashboard/events" },
  { icon: Package, labelKey: "dash.addons", path: "/dashboard/addons" },
  { icon: Crown, labelKey: "dash.upgrade", path: "/dashboard/upgrade" },
  { icon: Settings, labelKey: "dash.settings", path: "/dashboard/settings" },
];

const ordersSubItems = [
  { icon: ClipboardList, label: "My Orders", path: "/dashboard/orders" },
  { icon: Truck, label: "Track Orders", path: "/dashboard/orders/track" },
];

const DashboardLayout = ({ children, title, subtitle, headerAction }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();
  const isOrdersActive = ordersSubItems.some(item => pathname === item.path);
  const [ordersOpen, setOrdersOpen] = useState(isOrdersActive);

  const renderOrdersMenu = () => {
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Link
                href="/dashboard/orders"
                onClick={() => setMobileOpen(false)}
                className={`flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isOrdersActive ? "bg-primary/10 text-primary border-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <ShoppingBag size={18} className="shrink-0" />
              </Link>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Orders</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Collapsible open={ordersOpen} onOpenChange={setOrdersOpen}>
        <CollapsibleTrigger className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isOrdersActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}>
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="shrink-0" />
            <span>Orders</span>
          </div>
          {ordersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1 ml-2">
          {ordersSubItems.map((sub) => {
            const subActive = pathname === sub.path;
            return (
              <Link
                key={sub.path}
                href={sub.path}
                onClick={() => setMobileOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  subActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <sub.icon size={16} className="shrink-0" />
                <span>{sub.label}</span>
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <>
      <DashboardNavbar />
      <div className="h-screen bg-background pt-16 overflow-hidden">
        <div className="flex h-full">
          {mobileOpen && (
            <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
          )}

          <aside
            className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} fixed top-16 bottom-0 left-0 z-50 lg:relative lg:top-0 lg:translate-x-0 ${collapsed ? "w-[68px]" : "w-64"} flex-shrink-0 flex-col border-r border-border/50 bg-card flex transition-all duration-300 overflow-visible`}
          >
            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X size={20} />
            </button>

            {/* Nav items */}
            <div className="space-y-1 p-3 pt-2 overflow-y-auto overflow-x-visible flex-1">
              <TooltipProvider delayDuration={0}>
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.path;
                  const linkContent = (
                    <Link
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex w-full items-center ${collapsed ? "justify-center" : ""} gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary border-glow"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <div key={item.labelKey}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              {linkContent}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            {t(item.labelKey)}
                          </TooltipContent>
                        </Tooltip>
                        {item.path === "/dashboard/designs" && renderOrdersMenu()}
                      </div>
                    );
                  }

                  return (
                    <div key={item.labelKey}>
                      {linkContent}
                      {item.path === "/dashboard/designs" && renderOrdersMenu()}
                    </div>
                  );
                })}
              </TooltipProvider>
            </div>

            {/* Collapse toggle - bottom right */}
            <div className={`hidden lg:flex ${collapsed ? "justify-center" : "justify-end"} p-3 pt-0 border-t border-border/50`}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
              </button>
            </div>
          </aside>

          <main className="flex-1 min-w-0 overflow-y-auto dashboard-scroll-area">
            <div className="p-4 sm:p-6 lg:p-8">
              <motion.div initial="hidden" animate="visible">
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

export default DashboardLayout;
