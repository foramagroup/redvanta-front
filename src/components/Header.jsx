import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-krootal">Krootal</Link>
        <nav className="flex gap-3 items-center">
          <Link to="/affiliate/dashboard" className="text-sm">Affiliate</Link>
          <Link to="/admin/affiliates" className="text-sm">Admin</Link>
          <a href="https://krootal-review.com" className="text-sm">Site</a>
        </nav>
      </div>
    </header>
  );
}
