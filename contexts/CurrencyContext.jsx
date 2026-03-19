"use client";

import { createContext, useContext, useState, useCallback } from "react";

const CURRENCIES = [
  { code: "EUR", symbol: "€", rate: 0.92, position: "right_space" },
  { code: "USD", symbol: "$", rate: 1, position: "left_no_space" },
  { code: "GBP", symbol: "£", rate: 0.79, position: "left_no_space" },
  { code: "RON", symbol: "lei", rate: 4.57, position: "right_space" },
  { code: "MDL", symbol: "L", rate: 17.7, position: "right_space" },
  { code: "CAD", symbol: "CA$", rate: 1.36, position: "left_no_space" },
  { code: "AUD", symbol: "A$", rate: 1.53, position: "left_no_space" },
  { code: "CHF", symbol: "CHF", rate: 0.88, position: "right_space" },
];

const CurrencyContext = createContext(null);

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be within CurrencyProvider");
  return ctx;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  const setCurrencyCode = useCallback((code) => {
    const c = CURRENCIES.find((item) => item.code === code);
    if (c) setCurrency(c);
  }, []);

  const formatPrice = useCallback(
    (usdAmount) => {
      const converted = usdAmount * currency.rate;
      const num = converted.toFixed(2);
      switch (currency.position) {
        case "left_space":
          return `${currency.symbol} ${num}`;
        case "left_no_space":
          return `${currency.symbol}${num}`;
        case "right_space":
          return `${num} ${currency.symbol}`;
        case "right_no_space":
          return `${num}${currency.symbol}`;
        default:
          return `${currency.symbol}${num}`;
      }
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrencyCode, formatPrice, currencies: CURRENCIES }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
