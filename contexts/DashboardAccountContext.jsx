"use client";

import { createContext, useContext } from "react";

const DashboardAccountContext = createContext({
  initialAccount: null,
});

export function DashboardAccountProvider({ initialAccount, children }) {
  return (
    <DashboardAccountContext.Provider value={{ initialAccount: initialAccount || null }}>
      {children}
    </DashboardAccountContext.Provider>
  );
}

export function useDashboardAccount() {
  return useContext(DashboardAccountContext);
}
