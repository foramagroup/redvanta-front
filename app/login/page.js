"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeUp } from "@/lib/animations";

const socialProviders = [
  {
    name: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    name: "Apple",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-foreground" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
  {
    name: "Microsoft",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!email || !password) {
      setErr("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBase}/api/admin/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Login failed");
      }

      if (data?.requiresSelection) {
        const firstCompany = Array.isArray(data?.companies) ? data.companies[0] : null;

        if (!data?.userId || !firstCompany?.id) {
          throw new Error("No active company available for this account");
        }

        const selectResponse = await fetch(`${apiBase}/api/admin/auth/select-company`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.userId,
            companyId: firstCompany.id,
          }),
        });
        const selectData = await selectResponse.json().catch(() => ({}));

        if (!selectResponse.ok || !selectData?.success) {
          throw new Error(selectData?.error || "Failed to select company");
        }
      } else if (!data?.success) {
        throw new Error(data?.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErr(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-dark px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <motion.div initial="hidden" animate="visible" className="relative w-full max-w-md">
        <motion.div variants={fadeUp} custom={0} className="text-center">
          <Link href="/" className="font-display text-3xl font-bold tracking-tight">
            RED<span className="text-gradient-red">VANTA</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold">{t("login.welcome_back")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="mt-8 rounded-2xl border border-border/50 bg-gradient-card p-8 shadow-2xl backdrop-blur">
          <div className="space-y-3">
            {socialProviders.map((provider) => (
              <Button
                key={provider.name}
                type="button"
                variant="outline"
                className="w-full justify-center gap-3 border-border/50 bg-secondary hover:bg-secondary/80"
              >
                {provider.icon}
                {t("login.continue_with")} {provider.name}
              </Button>
            ))}
          </div>

          <div className="relative my-6">
            <Separator className="bg-border/50" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              {t("login.or_email")}
            </span>
          </div>

          {err && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("login.email")}</label>
              <Input
                className="mt-2 border-border/50 bg-background text-foreground"
                placeholder="you@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("login.password")}</label>
              <Input
                className="mt-2 border-border/50 bg-background text-foreground"
                placeholder="********"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="accent-primary" /> {t("login.remember_me")}
              </label>
              <a href="#" className="text-sm text-primary hover:underline">{t("login.forgot_password")}</a>
            </div>
            <Button
              type="submit"
              className="glow-red-hover w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? `${t("login.log_in")}...` : t("login.log_in")}
            </Button>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} custom={2} className="mt-6 text-center text-sm text-muted-foreground">
          {t("login.no_account")}{" "}
          <Link href="/signup" className="text-primary hover:underline">
            {t("auth.start_free_trial")}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
