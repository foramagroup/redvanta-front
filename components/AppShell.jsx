"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import LiveTextEditorBar from "./LiveTextEditorBar";
import LiveTextEditorRoot from "./LiveTextEditorRoot";





export default function AppShell({ children }) {
  const pathname = usePathname();
  const isSuperadmin = pathname?.startsWith("/superadmin");
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isSuperadmin) {
    return children;
  }

  return (
    <>
      {!isDashboard && <LiveTextEditorBar />}
      {!isDashboard && <Header />}
      <LiveTextEditorRoot>
        <main className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
          {children}
        </main>
      </LiveTextEditorRoot>
      <Footer />
    </>
  );
}
