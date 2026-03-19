import "./globals.css";
import Providers from "./providers";
import AppShell from "../components/AppShell";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Krootal Review",
  description: "Collecte d'avis & vente de cartes NFC"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
