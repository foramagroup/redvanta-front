"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, CreditCard, User, Star, Lock, Sun, Moon, Search, X } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const closeAll = () => { setLangOpen(false); setNotifOpen(false); setUserOpen(false); };

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
            RED<span className="text-gradient-red">VANTA</span>
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
                  <User size={16} className="text-primary" />
                </div>
                <span className="hidden sm:inline text-xs font-medium">REDVANTA Inc.</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border/50 bg-card shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-[10px] text-muted-foreground">john@redvanta.com</p>
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
                    <Link href="/login" className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-secondary/50 transition-colors">
                      <LogOut size={14} /> Logout
                    </Link>
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



export default DashboardNavbar;
