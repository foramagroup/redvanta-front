"use client";

import React, { useEffect, useState } from "react";
import FabricEditorAdvanced from "@/components/FabricEditorAdvanced";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminEditDesign({ params }) {
  const { id } = params; // provided by Next.js route params
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get(`/admin/designs/${id}`).then(r => {
      setDesign(r.data.design);
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (!design) return <div>Design non trouvé</div>;

  const initialFrontJson = design.jsonFront || null;
  const initialBackJson = design.jsonBack || null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Édition Admin — {design.title || design.id}</h1>
      <FabricEditorAdvanced
        orderId={design.id} // admin save will upsert by "orderId" field in customization; backend admin handler will adapt
        initialFrontJson={initialFrontJson}
        initialBackJson={initialBackJson}
        onSaved={(f,b,files) => {
          alert("Modifications enregistrées côté admin.");
        }}
      />
    </div>
  );
}
