"use client";
import React, { useEffect, useState } from "react";
import FabricEditorPro from "@/components/FabricEditorPro";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminEditDesign({ params }) {
  const id = params.id;
  const router = useRouter();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/designs/${id}`).then(r => setDesign(r.data.design)).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <div>Chargement…</div>;
  if (!design) return <div>Non trouvé</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Édition — {design.title || design.id}</h1>

      <div className="mb-4">
        <input defaultValue={design.title} className="border p-2" onBlur={async (e) => {
          await api.put(`/admin/designs/${id}`, { title: e.target.value });
        }} />
      </div>

      <FabricEditorPro
        orderId={design.id}
        initialFrontJson={design.jsonFront ? JSON.parse(design.jsonFront) : null}
        initialBackJson={design.jsonBack ? JSON.parse(design.jsonBack) : null}
        width={900}
        height={540}
      />

      <div className="mt-4 flex gap-2">
        <button className="btn" onClick={async () => {
          const res = await api.post(`/admin/designs/${id}/export-pdf`);
          if (res.data.filename) window.location.href = `${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/,'')}/download/${res.data.filename}`;
        }}>Exporter PDF</button>
        <button className="btn" onClick={() => router.push("/admin/designs")}>Retour</button>
      </div>
    </div>
  );
}
