"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, CreditCard, User, Star, Lock, Sun, Moon, Search, X, Building2 } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useDashboardAccount } from "@/contexts/DashboardAccountContext";
import CompanySwitchDialog from "@/components/CompanySwitchDialog";

const notifications = [
  { id: 1, text: "New 5-star review from Sarah M.", time: "2 min ago", read: false },
  { id: 2, text: "Automation workflow completed", time: "15 min ago", read: false },
  { id: 3, text: "Monthly report is ready", time: "1 hr ago", read: true },
];

const searchableItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Reviews", path: "/dashboard/reviews" },
  { label: "Requests", path: "/dashboard/requests" },
  { label: "Analytics", path: "/dashboard/analytics" },
  { label: "Locations", path: "/dashboard/locations" },
  { label: "Automation", path: "/dashboard/automation" },
  { label: "Team", path: "/dashboard/team" },
  { label: "Alerts", path: "/dashboard/alerts" },
  { label: "Connected Integrations", path: "/dashboard/integrations" },
  { label: "Marketplace", path: "/dashboard/marketplace" },
  { label: "API & Webhooks", path: "/dashboard/api" },
  { label: "Usage & Billing", path: "/dashboard/billing" },
  { label: "Event Logs", path: "/dashboard/events" },
  { label: "Add-Ons", path: "/dashboard/addons" },
  { label: "Settings", path: "/dashboard/settings" },
];

const DashboardNavbar = () => {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { initialAccount } = useDashboardAccount();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [account, setAccount] = useState(initialAccount || null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isSwitchingCompany, setIsSwitchingCompany] = useState(false);
  const [companyError, setCompanyError] = useState("");

  const selectedLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const closeAll = () => { setLangOpen(false); setNotifOpen(false); setUserOpen(false); };
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const loadAccount = async () => {
    try {
      const res = await fetch(`${apiBase}/client/auth/me`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok || !payload?.success) {
        setAccount(null);
        return;
      }

      setAccount(payload.user || null);
    } catch {
      setAccount(null);
    }
  };

  useEffect(() => {
    setAccount(initialAccount || null);
  }, [initialAccount]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialAccount = async () => {
      try {
        const res = await fetch(`${apiBase}/client/auth/me`, {
          credentials: "include",
        });
        const payload = await res.json().catch(() => ({}));

        if (!res.ok || !payload?.success || cancelled) return;
        const nextAccount = payload.user || null;
        setAccount(nextAccount);
      } catch {
        if (!cancelled) setAccount(null);
      }
    };

    loadInitialAccount();
    return () => { cancelled = true; };
  }, [apiBase]);

  useEffect(() => {
    const handleAccountRefresh = () => {
      loadAccount();
    };

    window.addEventListener("app:login", handleAccountRefresh);
    window.addEventListener("app:company-switched", handleAccountRefresh);

    return () => {
      window.removeEventListener("app:login", handleAccountRefresh);
      window.removeEventListener("app:company-switched", handleAccountRefresh);
    };
  }, []);

  const displayCompanyName = account?.activeCompany?.name || "Opinoor Inc.";
  const displayUserName = account?.name || "John Doe";
  const displayUserEmail = account?.email || "john@opinoor.com";
  const companyOptions = Array.isArray(account?.companies)
    ? account.companies
        .filter((entry) => entry?.company?.id)
        .map((entry) => ({
          id: entry.company.id,
          name: entry.company.name || "Company",
          email: entry.company.email || "",
          status: entry.company.status || "",
          isOwner: !!entry.isOwner,
        }))
    : [];
  const activeCompanyId = account?.activeCompany?.id ?? null;
  const avatarLetter = useMemo(() => {
    const source = account?.name || account?.activeCompany?.name || "R";
    return String(source).trim().charAt(0).toUpperCase() || "R";
  }, [account]);

  const openCompanySwitcher = () => {
    setUserOpen(false);
    setCompanyError("");

    if (companyOptions.length <= 1) {
      setCompanyError("No other company is available for switching.");
      setShowCompanyModal(true);
      setSelectedCompanyId(activeCompanyId);
      return;
    }

    setSelectedCompanyId(activeCompanyId ? String(activeCompanyId) : String(companyOptions[0]?.id || ""));
    setShowCompanyModal(true);
  };

  const handleCompanySwitch = async () => {
    if (!selectedCompanyId) {
      setCompanyError("Please select a company");
      return;
    }

    setCompanyError("");
    setIsSwitchingCompany(true);

    try {
      if (String(selectedCompanyId) !== String(activeCompanyId)) {
        const response = await fetch(`${apiBase}/client/auth/switch-company`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId: selectedCompanyId }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Failed to switch company");
        }
      }

      window.dispatchEvent(new Event("app:company-switched"));
      setShowCompanyModal(false);
      await loadAccount();
      router.refresh();
      window.location.reload();
    } catch (error) {
      setCompanyError(error?.message || "Failed to switch company");
    } finally {
      setIsSwitchingCompany(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch(`${apiBase}/client/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAccount(null);
      window.dispatchEvent(new Event("app:logout"));
      setUserOpen(false);
      router.push("/login");
      router.refresh();
      setLoggingOut(false);
    }
  };

  const filteredSearch = searchQuery.length > 0
    ? searchableItems.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <>
      {(langOpen || notifOpen || userOpen || searchOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { closeAll(); setSearchOpen(false); setSearchQuery(""); }} />
      )}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="font-display text-xl font-bold tracking-tight">
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
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search dashboard..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
                    <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}><X size={14} className="text-muted-foreground" /></button>
                  </div>
                  {filteredSearch.length > 0 && (
                    <div className="max-h-64 overflow-y-auto">
                      {filteredSearch.map(item => (
                        <Link key={item.path} href={item.path} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors">{item.label}</Link>
                      ))}
                    </div>
                  )}
                  {searchQuery && filteredSearch.length === 0 && <p className="px-4 py-3 text-xs text-muted-foreground">No results found</p>}
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
                  <div className="px-4 py-3 border-b border-border/50"><span className="text-xs font-semibold">Notifications</span></div>
                  {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                      <p className="text-xs">{n.text}</p>
                      <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-border/50">
                    <button className="text-xs text-primary hover:underline w-full text-center">View all</button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => { closeAll(); setUserOpen(!userOpen); }}
                className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{avatarLetter}</span>
                </div>
                <span className="hidden sm:inline text-xs font-medium">{displayCompanyName}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border/50 bg-card shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-sm font-medium">{displayUserName}</p>
                    <p className="text-[10px] text-muted-foreground">{displayUserEmail}</p>
                  </div>
                  <Link href="/dashboard/settings" onClick={() => setUserOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <CreditCard size={14} /> My Cards
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setUserOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <User size={14} /> My Profile
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setUserOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <Star size={14} /> Review Platforms
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setUserOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <Lock size={14} /> Change Password
                  </Link>
                  <button
                    onClick={openCompanySwitcher}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <Building2 size={14} /> Switch Company
                  </button>
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
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-secondary/50 transition-colors disabled:opacity-60"
                    >
                      <LogOut size={14} /> {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          
        </div>
      </nav>
      <CompanySwitchDialog
        open={showCompanyModal}
        onOpenChange={setShowCompanyModal}
        title="Switch company"
        description="Select the company you want to use in the dashboard."
        companies={companyOptions}
        selectedCompanyId={selectedCompanyId}
        onSelectedCompanyIdChange={setSelectedCompanyId}
        onConfirm={handleCompanySwitch}
        isSubmitting={isSwitchingCompany}
        errorMessage={companyError}
        confirmLabel="Switch"
      />
    </>
  );
};



export default DashboardNavbar;
