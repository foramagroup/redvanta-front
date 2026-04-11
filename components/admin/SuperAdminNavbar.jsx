"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, CreditCard, User, FileText, Lock, Sun, Moon, Search, X } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const notifications = [
  { id: 1, text: "New account registered: Bella's Kitchen", time: "5 min ago", read: false },
  { id: 2, text: "Invoice #INV-2026-042 paid", time: "20 min ago", read: false },
  { id: 3, text: "System update completed", time: "2 hrs ago", read: true },
];

const searchableItems = [
  { labelKey: "sa.sidebar_accounts", path: "/superadmin/accounts" },
  { labelKey: "sa.sidebar_agencies", path: "/superadmin/agencies" },
  { labelKey: "sa.sidebar_billing", path: "/superadmin/billing" },
  { labelKey: "sa.sidebar_events", path: "/superadmin/events" },
  { labelKey: "sa.sidebar_products", path: "/superadmin/products" },
  { labelKey: "sa.sidebar_analytics", path: "/superadmin/analytics" },
  { labelKey: "sa.sidebar_platform", path: "/superadmin/settings/platform" },
  { labelKey: "sa.sidebar_plans", path: "/superadmin/settings/plans" },
  { labelKey: "sa.sidebar_languages", path: "/superadmin/settings/languages" },
  { labelKey: "sa.sidebar_currency", path: "/superadmin/settings/currency" },
  { labelKey: "sa.sidebar_roles", path: "/superadmin/settings/roles" },
  { labelKey: "sa.sidebar_flags", path: "/superadmin/settings/flags" },
  { labelKey: "sa.sidebar_security", path: "/superadmin/settings/security" },
  { labelKey: "sa.sidebar_audit", path: "/superadmin/settings/audit" },
  { labelKey: "sa.sidebar_sms", path: "/superadmin/sms" },
  { labelKey: "sa.sidebar_all_pages", path: "/superadmin/pages/all" },
  { labelKey: "sa.sidebar_faq_pages", path: "/superadmin/pages/faq" },
];

const SuperAdminNavbar = () => {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [account, setAccount] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const selectedLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const closeAll = () => { setLangOpen(false); setNotifOpen(false); setUserOpen(false); };

  useEffect(() => {
    let isMounted = true;

    const loadAccount = async () => {
      try {
        const res = await fetch(`${apiBase}/api/superadmin/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (isMounted) {
          setAccount(data?.user || null);
        }
      } catch {
        // Keep the navbar usable even if the auth ping fails.
      }
    };

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = account?.name || "Super Admin";
  const displayEmail = account?.email || "admin@opinoor.com";
  const displayRole = account?.role?.name || "Super Admin";
  const avatarLabel = useMemo(() => {
    const source = displayName?.trim() || displayEmail?.trim() || "S";
    return source.charAt(0).toUpperCase();
  }, [displayEmail, displayName]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setUserOpen(false);

    try {
      await fetch(`${apiBase}/api/superadmin/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.replace("/superadmin/login");
      router.refresh();
    }
  };

  const filteredSearch = searchQuery.length > 0
    ? searchableItems.filter(i => t(i.labelKey).toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <>
      {(langOpen || notifOpen || userOpen || searchOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { closeAll(); setSearchOpen(false); setSearchQuery(""); }} />
      )}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/superadmin" className="font-display text-xl font-bold tracking-tight">
            OPI<span className="text-gradient-red">NOOR</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Global Search */}
            <div className="relative">
              <button onClick={() => { closeAll(); setSearchOpen(!searchOpen); }} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <Search size={18} />
              </button>
              {searchOpen && (
                <div className="fixed left-4 right-4 top-[4.25rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-1 sm:w-80 rounded-lg border border-border/50 bg-card shadow-xl z-50">
                  <div className="flex items-center gap-2 p-3 border-b border-border/50">
                    <Search size={14} className="text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={t("sa.navbar_search")}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      autoFocus
                    />
                    <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}><X size={14} className="text-muted-foreground" /></button>
                  </div>
                  {filteredSearch.length > 0 && (
                    <div className="max-h-64 overflow-y-auto">
                      {filteredSearch.map(item => (
                        <Link key={item.path} href={item.path} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors">
                          {t(item.labelKey)}
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchQuery && filteredSearch.length === 0 && (
                    <p className="px-4 py-3 text-xs text-muted-foreground">{t("sa.navbar_no_results")}</p>
                  )}
                </div>
              )}
            </div>

            {/* Language */}
            <div className="relative">
              <button onClick={() => { closeAll(); setLangOpen(!langOpen); }}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <span className="text-base">{selectedLang.flag}</span>
                <span className="hidden sm:inline text-xs">{selectedLang.label}</span>
                <ChevronDown size={14} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border/50 bg-card shadow-xl z-50">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-xs hover:bg-secondary/50 transition-colors ${lang === l.code ? "text-primary" : "text-muted-foreground"}`}>
                      <span className="text-base">{l.flag}</span>{l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { closeAll(); setNotifOpen(!notifOpen); }}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <Bell size={18} />
                {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-border/50 bg-card shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-border/50"><span className="text-xs font-semibold">{t("sa.navbar_notifications")}</span></div>
                  {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                      <p className="text-xs">{n.text}</p>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-border/50">
                    <button className="text-xs text-primary hover:underline w-full text-center">{t("sa.navbar_view_all")}</button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => { closeAll(); setUserOpen(!userOpen); }}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">{avatarLabel}</span>
                </div>
                <span className="hidden sm:inline text-xs font-medium">{displayRole}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border/50 bg-card shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground">{displayEmail}</p>
                  </div>
                  <Link href="/superadmin/billing" onClick={() => setUserOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <CreditCard size={14} /> {t("sa.navbar_all_orders")}
                  </Link>
                  <Link href="/superadmin/accounts" onClick={() => setUserOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <User size={14} /> {t("sa.navbar_my_profile")}
                  </Link>
                  <Link href="/superadmin/billing" onClick={() => setUserOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <FileText size={14} /> {t("sa.navbar_invoices")}
                  </Link>
                  <Link href="/superadmin/settings/security" onClick={() => setUserOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <Lock size={14} /> {t("sa.navbar_change_password")}
                  </Link>
                  <div className="border-t border-border/50">
                    <button
                      onClick={() => { toggleTheme(); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>
                  <div className="border-t border-border/50">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-secondary/50 transition-colors disabled:opacity-60"
                    >
                      <LogOut size={14} /> {t("sa.navbar_logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SuperAdminNavbar;
