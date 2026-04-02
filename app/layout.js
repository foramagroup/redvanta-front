import "./globals.css";
import { cookies } from "next/headers";
import Providers from "./providers";
import AppShell from "../components/AppShell";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Krootal Review",
  description: "Collecte d'avis & vente de cartes NFC"
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const initialCurrencyCode = cookieStore.get("krootal_currency")?.value || "EUR";

  return (
    <html lang="fr">
      <body>
        <Providers initialCurrencyCode={initialCurrencyCode}>
          <AppShell>{children}</AppShell>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
