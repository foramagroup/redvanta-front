"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import LiveTextEditorBar from "./LiveTextEditorBar";
import LiveTextEditorRoot from "./LiveTextEditorRoot";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isSuperadmin = pathname?.startsWith("/superadmin");
  const isDashboard = pathname?.startsWith("/dashboard");
  const [canEditPages, setCanEditPages] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSuperadminSession = async () => {
      try {
        const res = await fetch(`${apiBase}/api/superadmin/auth/me`, {
          credentials: "include",
        });

        if (!active) return;
        setCanEditPages(res.ok);
      } catch {
        if (active) {
          setCanEditPages(false);
        }
      }
    };

    loadSuperadminSession();

    return () => {
      active = false;
    };
  }, [pathname]);

  if (isSuperadmin) {
    return children;
  }

  return (
    <>
      {!isDashboard && canEditPages && <LiveTextEditorBar />}
      {!isDashboard && <Header showEditBar={canEditPages} />}
      <LiveTextEditorRoot>
        <main className={isDashboard ? undefined : "container"} style={isDashboard ? undefined : { paddingTop: 20, paddingBottom: 40 }}>
          {children}
        </main>
      </LiveTextEditorRoot>
      {!isDashboard && <Footer />}
    </>
  );
}
