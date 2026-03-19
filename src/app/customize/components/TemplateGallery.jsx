"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TemplateGallery({ onInsert }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    api.get("/templates").then(res => setTemplates(res.data));
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-bold mb-2">Templates</h3>
      <div className="grid grid-cols-3 gap-3">
        {templates.map(tpl => (
          <img
            key={tpl.name}
            src={process.env.NEXT_PUBLIC_API_URL + tpl.url}
            className="border rounded cursor-pointer hover:opacity-60 transition"
            onClick={() => onInsert(tpl.url)}
          />
        ))}
      </div>
    </div>
  );
}
