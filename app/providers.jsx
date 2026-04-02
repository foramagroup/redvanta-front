"use client";

import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LiveTextEditorProvider } from "@/contexts/LiveTextEditorContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ children, initialCurrencyCode }) {
  return (
    <ThemeProvider>
      <CartProvider>
        <LanguageProvider>
          <CurrencyProvider initialCurrencyCode={initialCurrencyCode}>
            <LiveTextEditorProvider>{children}</LiveTextEditorProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
