import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

/* pages */
import Home from "./pages/Public/Home";
import AdminAffiliates from "./pages/Admin/Affiliates";
import AdminPayouts from "./pages/Admin/Payouts";
import AffiliateDashboard from "./pages/Affiliate/Dashboard";
import AffiliateClicks from "./pages/Affiliate/Clicks";
import AffiliateConversions from "./pages/Affiliate/Conversions";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Admin area (protect in production with auth wrapper) */}
          <Route path="/admin/affiliates" element={<AdminAffiliates />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />

          {/* Affiliate area */}
          <Route path="/affiliate/dashboard" element={<AffiliateDashboard />} />
          <Route path="/affiliate/clicks" element={<AffiliateClicks />} />
          <Route path="/affiliate/conversions" element={<AffiliateConversions />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
