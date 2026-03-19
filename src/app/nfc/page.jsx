"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function NFCDashboard() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    api.get("/nfc/mine").then(res => setTags(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="font-bold text-2xl mb-4">Mes Tags NFC & QR</h1>

      <Link href="/nfc/create" className="btn mb-4 block w-48">
        + Nouveau Tag
      </Link>

      <div className="grid grid-cols-3 gap-4">
        {tags.map(t => (
          <div key={t.id} className="border p-3 rounded shadow">
            <h3 className="font-semibold">{t.id.slice(0, 8)}</h3>
            <p className="text-sm text-gray-600">{t.design?.title}</p>

            <img
              src={`${process.env.NEXT_PUBLIC_API_URL.replace("/api","")}/uploads/qrcodes/${t.qrCodeFile}`}
              className="w-full h-40 object-contain mt-2"
            />

            <Link href={`/nfc/${t.id}`} className="text-blue-600 underline text-sm mt-2 block">
              Gérer
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
