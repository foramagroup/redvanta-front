"use client";

import React, { useState } from "react";
import templateService from "@/services/templateService";

export default function TemplateGallery({ templates = [], onUploaded = () => {} }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLoading(true);
    try {
      await templateService.upload(f);
      onUploaded();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally { setLoading(false); }
  };

  const importLocal = async () => {
    // Example: import the uploaded file on server path
    // You can change the path to the actual uploaded path on server.
    const localPath = "/mnt/data/generate_krootal.ps1";
    try {
      await templateService.importLocal(localPath, "krootal_import");
      onUploaded();
      alert("Import local requested (server) — vérifie logs backend");
    } catch (err) {
      console.error(err);
      alert("Import local failed");
    }
  };

  return (
    <div className="card p-3">
      <h3 className="font-semibold mb-2">Galerie Templates</h3>

      <div className="space-y-2">
        <input type="file" accept="image/*" onChange={handleUpload} />
        <button onClick={importLocal} className="btn mt-2">Importer fichier local serveur</button>
      </div>

      <div className="mt-4 space-y-2 max-h-96 overflow-auto">
        {templates.map(t => (
          <div key={t.id} className="flex items-center gap-2 border p-2 rounded">
            <img src={`${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/,'')}/uploads/templates/${t.filename}`} className="w-16 h-16 object-cover" />
            <div>
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-muted">{t.description}</div>
              <button
                className="btn mt-1"
                onClick={() => {
                  // insert in editor by dispatching event; editor listens to window event
                  window.dispatchEvent(new CustomEvent("insert-template", { detail: { url: `${process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/,'')}/uploads/templates/${t.filename}` } }));
                }}
              >Insérer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
