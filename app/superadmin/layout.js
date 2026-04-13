"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SuperadminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verify = async () => {
      if (pathname === "/superadmin/login") {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`${apiBase}/superadmin/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace(`/superadmin/login?next=${encodeURIComponent(pathname || "/superadmin/dashboard")}`);
          return;
        }

        const data = await res.json();
        setUser(data.user || null);
      } catch {
        router.replace(`/superadmin/login?next=${encodeURIComponent(pathname || "/superadmin/dashboard")}`);
        return;
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [pathname, router]);

  const onLogout = async () => {
    await fetch(`${apiBase}/superadmin/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.replace("/superadmin/login");
  };

  if (checking) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (pathname === "/superadmin/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link href="/superadmin/dashboard" className="font-display text-xl font-bold">
            Superadmin
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.email || "admin"}
            </span>
            <Button size="sm" variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="">{children}</main>
    </div>
  );
}
