"use client";
import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function ManageTag({ params }) {
  const tagId = params.tagId;
  const [tag, setTag] = useState(null);
  const [designs, setDesigns] = useState([]);

  useEffect(() => {
    api.get("/nfc/mine").then(r => setTag(r.data.find(t => t.id === tagId)));
    api.get("/customization/mine").then(r => setDesigns(r.data));
  }, []);

  const update = async (designId) => {
    await api.put(`/nfc/${tagId}`, { designId });
    location.reload();
  };

  if (!tag) return <div className="p-6">Chargement…</div>;

  return (
    <div className="p-6">
      <h1 className="font-bold text-xl">Gestion du Tag {tag.id.slice(0,8)}</h1>

      <img
        src={`${process.env.NEXT_PUBLIC_API_URL.replace("/api","")}/uploads/qrcodes/${tag.qrCodeFile}`}
        className="w-64 mt-4"
      />

      <h2 className="font-semibold mt-6">Changer le design associé</h2>

      <div className="grid grid-cols-4 gap-4 mt-4">
        {designs.map(d => (
          <div
            key={d.id}
            className={`border p-2 rounded cursor-pointer ${d.id === tag.designId ? "ring-2 ring-blue-600" : ""}`}
            onClick={() => update(d.id)}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL.replace("/api","")}/uploads/customizations/${d.thumbnail}`}
              className="w-full h-32 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
