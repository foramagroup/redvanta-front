"use client";

import { useState } from "react";
import UserInviteModal from "./UserInviteModal";
import api from "@/lib/api";

export default function UsersToolbar({ onSearch }) {
  const [q, setQ] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (typeof onSearch === "function") onSearch(q);
    // else full reload client side
  };

  const exportCsv = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/users/export?q=${encodeURIComponent(q)}`, {
        headers: { accept: "text/csv" },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Export CSV failed");
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher nom ou email..."
          className="px-3 py-2 border rounded w-64"
        />
        <button type="submit" className="px-3 py-2 bg-sky-600 text-white rounded">Rechercher</button>
      </form>

      <button onClick={() => setInviteOpen(true)} className="px-3 py-2 bg-green-600 text-white rounded">Inviter</button>

      <button onClick={exportCsv} className="px-3 py-2 bg-gray-800 text-white rounded">Export CSV</button>

      {inviteOpen && <UserInviteModal onClose={() => setInviteOpen(false)} />}
    </div>
  );
}
