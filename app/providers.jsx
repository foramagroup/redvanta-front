"use client";

import { CartProvider } from "@/contexts/CartContext";
import { DesignsProvider } from "@/contexts/DesignsContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LiveTextEditorProvider } from "@/contexts/LiveTextEditorContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ children, initialCurrencyCode }) {
  return (
    <ThemeProvider>
      <CartProvider>
        <DesignsProvider>
          <LanguageProvider>
            <CurrencyProvider initialCurrencyCode={initialCurrencyCode}>
              <LiveTextEditorProvider>{children}</LiveTextEditorProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </DesignsProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
