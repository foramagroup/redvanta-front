"use client";
import { useEffect, useState } from "react";

export default function NFCScanPage() {
  const [msg, setMsg] = useState("Approchez un tag NFC…");

  const start = async () => {
    if (!("NDEFReader" in window)) {
      setMsg("Web NFC non supporté");
      return;
    }

    try {
      const reader = new NDEFReader();
      await reader.scan();
      reader.onreading = (e) => {
        const text = e.message.records[0].data;
        window.location.href = text;
      };
      setMsg("Lecture NFC active…");
    } catch (e) {
      setMsg("Erreur NFC");
    }
  };

  return (
    <div className="p-6">
      <h1 className="font-bold">Scanner un tag NFC</h1>
      <p className="mt-4">{msg}</p>
      <button className="btn mt-4" onClick={start}>Démarrer scan</button>
    </div>
  );
}
