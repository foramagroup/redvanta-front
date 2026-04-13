"use client";

import { useEffect, useState } from "react";
import { getUsers, inviteUser, exportUsersCsv } from "@/lib/users";
import { nfcApi } from "@/lib/nfc";
import { Dialog } from "@headlessui/react";

export default function DashboardListPage({ type = "users" }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loadingInvite, setLoadingInvite] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      if (type === "users") {
        const res = await getUsers(page, 20);
        setItems(res.items || []);
        setMeta({ page, pages: res.pages || 1 });
      } else if (type === "nfc") {
        const res = await nfcApi.list(page, 20, q);
        setItems(res.data || res.items || []);
        setMeta(res.meta || { page: 1, pages: 1 });
      }
    } catch (e) {
      console.error(e);
      alert("Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [q]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return alert("Email required");
    setLoadingInvite(true);
    try {
      const r = await inviteUser(inviteEmail);
      if (r.ok) {
        alert("Invitation envoyée !");
        setInviteEmail("");
        setInviteOpen(false);
        load();
      } else alert("Erreur envoi invitation");
    } catch (e) {
      console.error(e);
      alert("Erreur serveur");
    } finally {
      setLoadingInvite(false);
    }
  };

  return (
    <div className="ml-64 p-6 space-y-6">
      …
    </div>
  );
}
