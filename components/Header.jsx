"use client";


import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLiveTextEditor } from "@/contexts/LiveTextEditorContext";
import { Globe, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "nav.product", path: "/product" },
  { label: "nav.features", path: "/features" },
  { label: "nav.pricing", path: "/pricing" },
  { label: "nav.agency", path: "/agency" },
  { label: "nav.dashboard", path: "/dashboard" },
  { label: "nav.contact", path: "/contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrencyCode, currencies } = useCurrency();
  const { isEditing } = useLiveTextEditor();

  const selectedLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const editBarHeight = isEditing ? "top-10" : "top-8";

  return (
    <nav className={`fixed ${editBarHeight} left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all`}>
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight">
          RED<span className="text-gradient-red">VANTA</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t(link.label)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <span className="text-sm">{selectedLang.flag}</span>
              <span>{selectedLang.label}</span>
              <ChevronDown size={12} />
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border/50 bg-card shadow-xl z-50 hidden group-hover:block">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-secondary/50 transition-colors ${lang === l.code ? "text-primary" : "text-muted-foreground"}`}>
                  <span className="text-sm">{l.flag}</span>{l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <span>{currency.symbol}</span>
              <span>{currency.code}</span>
              <ChevronDown size={12} />
            </button>
            <div className="absolute right-0 top-full mt-1 w-28 rounded-lg border border-border/50 bg-card shadow-xl z-50 hidden group-hover:block">
              {currencies.map(c => (
                <button key={c.code} onClick={() => setCurrencyCode(c.code)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-secondary/50 transition-colors ${currency.code === c.code ? "text-primary" : "text-muted-foreground"}`}>
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>

          <Link href="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              {t("auth.login")}
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90">
              {t("auth.start_free_trial")}
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/cart" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <button className="text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-border/50 bg-background lg:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {t(link.label)}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-muted-foreground">{t("auth.login")}</Button>
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground">{t("auth.start_free_trial")}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
