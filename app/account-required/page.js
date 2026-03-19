"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { fadeUp } from "@/lib/animations";

const AccountRequired = () => {
  const { user, setUser, items } = useCart();
  const router = useRouter();
  const [mode, setMode] = useState(user ? "login" : "signup");

  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    phone: "",
    address: "",
  });

  const hasUnvalidatedDesign = items.some((i) => i.design?.status === "draft" || !i.design);

  const handleSubmit = (e) => {
    e.preventDefault();
    const account = {
      email: form.email,
      companyName: form.companyName,
      phone: form.phone,
      address: form.address,
      isLoggedIn: true,
    };
    setUser(account);

    if (hasUnvalidatedDesign) {
      const firstUnvalidated = items.find((i) => i.design?.status === "draft" || !i.design);
      router.push(`/customize/${firstUnvalidated?.id}`);
    } else {
      router.push("/checkout");
    }
  };

  useEffect(() => {
    if (!user?.isLoggedIn) return;
    if (hasUnvalidatedDesign) {
      const firstUnvalidated = items.find((i) => i.design?.status === "draft" || !i.design);
      router.push(`/customize/${firstUnvalidated?.id}`);
    } else {
      router.push("/checkout");
    }
  }, [user?.isLoggedIn, hasUnvalidatedDesign, items, router]);

  if (user?.isLoggedIn) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-6 pt-20">
      <motion.div initial="hidden" animate="visible" className="w-full max-w-md">
        <motion.div variants={fadeUp} custom={0} className="text-center">
          <Link href="/" className="font-display text-3xl font-bold tracking-tight">
            RED<span className="text-gradient-red">VANTA</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold">
            {mode === "signup" ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup" ? "An account is required before checkout." : "Log in to continue to checkout."}
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          custom={1}
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border border-border/50 bg-gradient-card p-8 space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 bg-background border-border/50"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <Input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-2 bg-background border-border/50"
              placeholder="Create a strong password"
            />
          </div>

          {mode === "signup" && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <Input
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="mt-2 bg-background border-border/50"
                  placeholder="Your Business"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-2 bg-background border-border/50"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-2 bg-background border-border/50"
                  placeholder="123 Main Street, City, State"
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90">
            {mode === "signup" ? "Create Account & Continue" : "Log In & Continue"}
          </Button>
        </motion.form>

        <motion.p variants={fadeUp} custom={2} className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline">Log In</button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline">Sign Up</button>
            </>
          )}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AccountRequired;
