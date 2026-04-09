"use client";

import React, { useEffect, useState } from "react";
// 1. Importer 'dynamic' de Next.js
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// 2. Charger l'éditeur dynamiquement en désactivant le SSR (Server Side Rendering)
// C'est cette étape qui empêche Webpack de lire le fichier 'canvas.node' pendant le build.
const FabricEditorAdvanced = dynamic(
  () => import("@/components/FabricEditorAdvanced"),
  { 
    ssr: false, 
    loading: () => <div className="p-10 text-center">Chargement de l'éditeur...</div> 
  }
);

export default function AdminEditDesign({ params }) {
  const { id } = params;
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
      
      {/* 3. L'utilisation du composant ne change pas */}
      <FabricEditorAdvanced
        orderId={design.id}
        initialFrontJson={initialFrontJson}
        initialBackJson={initialBackJson}
        onSaved={(f, b, files) => {
          alert("Modifications enregistrées côté admin.");
        }}
      />
    </div>
  );
}