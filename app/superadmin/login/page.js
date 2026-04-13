"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/animations";

export default function SuperadminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultNextPath = "/superadmin/dashboard";
  const rawNextPath = searchParams.get("next") || defaultNextPath;
  const nextPath = rawNextPath === "/superadmin" ? defaultNextPath : rawNextPath;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiBase}/superadmin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push(nextPath.startsWith("/superadmin") ? nextPath : defaultNextPath);
    } catch {
      setError("Unable to connect to backend.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-6">
      <motion.div initial="hidden" animate="visible" className="w-full max-w-md">
        <motion.div variants={fadeUp} custom={0} className="text-center">
          <Link href="/" className="font-display text-3xl font-bold tracking-tight">
            OPI<span className="text-gradient-red">NOOR</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold">Super Admin Access</h1>
          <p className="mt-2 text-sm text-muted-foreground">This area is restricted to platform administrators only.</p>
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="mt-8 rounded-xl border border-border/50 bg-gradient-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Admin Email</label>
              <Input
                className="mt-2 bg-background border-border/50 text-foreground"
                placeholder="admin@reventa.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <Input
                className="mt-2 bg-background border-border/50 text-foreground"
                placeholder="********"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-red-hover">
              {loading ? "Connecting..." : "Access admin panel"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
