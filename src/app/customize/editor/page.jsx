"use client";

import React, { useEffect, useState } from "react";
import FabricEditorPro from "@/components/FabricEditorPro";
import TemplateGallery from "@/components/panels/TemplateGallery";
import customizationService from "@/services/customizationService";
import templateService from "@/services/templateService";
import { useSearchParams } from "next/navigation";

export default function EditorPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || params.get("order") || null;
  const [frontJson, setFrontJson] = useState(null);
  const [backJson, setBackJson] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (!orderId) return;
    customizationService.get(orderId).then(r => {
      const c = r.customization || r;
      if (c) {
        try { setFrontJson(c.frontData ? JSON.parse(c.frontData) : null); } catch(e){}
        try { setBackJson(c.backData ? JSON.parse(c.backData) : null); } catch(e){}
      }
    }).catch(()=>{});
    templateService.list().then(r => setTemplates(r.templates || [])).catch(()=>{});
  }, [orderId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Éditeur (Recto / Verso)</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <FabricEditorPro
            orderId={orderId}
            initialFrontJson={frontJson}
            initialBackJson={backJson}
            width={900}
            height={540}
          />
        </div>

        <aside className="col-span-1 space-y-4">
          <TemplateGallery templates={templates} onUploaded={() => templateService.list().then(r=>setTemplates(r.templates))} />
        </aside>
      </div>
    </div>
  );
}
