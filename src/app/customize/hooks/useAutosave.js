import { useEffect, useRef } from "react";
import api from "@/lib/api";

export default function useAutosave(canvasFront, canvasBack, designId) {
  const saving = useRef(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (saving.current) return;

      saving.current = true;

      const payload = {
        front: canvasFront.toJSON(),
        back: canvasBack.toJSON(),
        updatedAt: Date.now()
      };

      try {
        await api.post(`/customization/save/${designId}`, payload);
      } catch (err) {
        if (err?.response?.status === 409) {
          alert("⚠ Conflit détecté : quelqu'un modifie déjà ce design.");
        }
      }

      saving.current = false;
    }, 3000);

    return () => clearInterval(interval);
  }, []);
}
