import { cookies } from "next/headers";
import { DashboardAccountProvider } from "@/contexts/DashboardAccountContext";

async function getInitialDashboardAccount() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token")?.value;

  if (!adminToken) return null;

  const apiBase =
    process.env.URL_DEV_BACKEND ||
    process.env.URL_PROD_BACKEND ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

  try {
    const response = await fetch(`${apiBase}/client/auth/me`, {
      headers: {
        Cookie: `admin_token=${adminToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = await response.json().catch(() => ({}));
    return payload?.success ? payload.user || null : null;
  } catch {
    return null;
  }
}

export default async function DashboardRouteLayout({ children }) {
  const initialAccount = await getInitialDashboardAccount();

  return (
    <DashboardAccountProvider initialAccount={initialAccount}>
      {children}
    </DashboardAccountProvider>
  );
}
