// frontend/components/AdminGuard.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }) {
  const [ok, setOk] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("krootal_token") : null;
    if (!token) {
      router.push("/login");
    } else {
      setOk(true);
    }
  }, [router]);

  if (!ok) return <div className="p-6">Redirection vers la page de connexion…</div>;
  return <>{children}</>;
}
