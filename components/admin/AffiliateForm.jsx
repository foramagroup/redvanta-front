// frontend/components/admin/AffiliateForm.jsx
"use client";
import { useState, useEffect } from "react";

export default function AffiliateForm({ initial = null, onSubmit = async () => {}, onCancel = () => {} }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setEmail(initial.email || "");
    } else {
      setName(""); setEmail("");
    }
  }, [initial]);

  const submit = async (e) => {
    e.preventDefault();
    await onSubmit({ name, email });
    setName(""); setEmail("");
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="Nom du partenaire" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" required />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 border rounded" type="email" />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Créer</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Annuler</button>
      </div>
    </form>
  );
}
