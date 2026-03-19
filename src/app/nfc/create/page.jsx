"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateNFCTag() {
  const router = useRouter();
  const [designs, setDesigns] = useState([]);

  useEffect(() => {
    api.get("/customization/mine").then(res => setDesigns(res.data));
  }, []);

  const handleCreate = async (designId) => {
    const res = await api.post("/nfc/create", { designId });
    router.push(`/nfc/${res.data.tagId}`);
  };

  return (
    <div className="p-6">
      <h1 className="font-bold text-2xl mb-4">Associer un design</h1>

      <div className="grid grid-cols-4 gap-4">
        {designs.map(d => (
          <div key={d.id} className="border p-3 rounded">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL.replace("/api","")}/uploads/customizations/${d.thumbnail}`}
              className="w-full h-32 object-cover"
            />
            <button className="btn mt-2 w-full" onClick={() => handleCreate(d.id)}>
              Associer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
