"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const CODE_LENGTH = 6;

function VerifyCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email      = searchParams.get("email")    || "";
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const inputsRef = useRef([]);

  // Focus le premier champ au montage
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const focusAt = (index) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index, value) => {
    // Accepter uniquement les chiffres
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError("");

    if (digit && index < CODE_LENGTH - 1) {
      focusAt(index + 1);
    }

    // Soumission automatique quand toutes les cases sont remplies
    if (digit && newDigits.every((d) => d !== "")) {
      submitCode(newDigits.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      focusAt(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const newDigits = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    setError("");
    const nextEmpty = newDigits.findIndex((d) => d === "");
    focusAt(nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty);
    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted);
    }
  };

  const submitCode = useCallback(async (code) => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/client/auth/verify-code`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setSuccess(true);
      window.dispatchEvent(new Event("app:login"));
      setTimeout(() => router.push(redirectTo), 800);
    } catch (err) {
      setError(err.message || "Invalid code");
      // Vider les cases en cas d'erreur
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => focusAt(0), 50);
    } finally {
      setLoading(false);
    }
  }, [loading, email, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    submitCode(code);
  };

  const handleResend = async () => {
    if (resending || !email) return;
    setResending(true);
    setResendMsg("");
    setError("");
    try {
      const res = await fetch(`${apiBase}/client/auth/resend-code`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to resend");
      setResendMsg("A new code has been sent to your email.");
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => focusAt(0), 50);
    } catch (err) {
      setResendMsg(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-dark px-6 py-16">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <motion.div initial="hidden" animate="visible" className="relative w-full max-w-md">
        {/* Logo */}
        <motion.div variants={fadeUp} custom={0} className="text-center">
          <Link href="/" className="font-display text-3xl font-bold tracking-tight">
            OPI<span className="text-gradient-red">NOOR</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className="mt-8 rounded-2xl border border-border/50 bg-gradient-card p-8 shadow-2xl backdrop-blur text-center"
        >
          {success ? (
            <div className="py-4">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 border border-green-500/30">
                <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">Email verified!</h2>
              <p className="mt-2 text-sm text-muted-foreground">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold leading-snug">
                Enter the validation code<br />sent to your email address
              </h1>

              {email && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{email}</span>
                  <Link href="/signup" className="text-primary hover:underline">
                    Change email address
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8">
                {/* 6 input boxes */}
                <div className="flex justify-center gap-3">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputsRef.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      onFocus={(e) => e.target.select()}
                      disabled={loading || success}
                      className={[
                        "h-14 w-12 rounded-xl border text-center text-xl font-bold",
                        "bg-background text-foreground outline-none",
                        "transition-all duration-150",
                        "focus:border-primary focus:ring-2 focus:ring-primary/30",
                        error
                          ? "border-destructive/60 ring-1 ring-destructive/30"
                          : digit
                          ? "border-primary/60"
                          : "border-border/50",
                        (loading || success) ? "opacity-50 cursor-not-allowed" : "",
                      ].join(" ")}
                    />
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <p className="mt-4 text-sm text-destructive">{error}</p>
                )}

                {/* Resend message */}
                {resendMsg && !error && (
                  <p className="mt-4 text-sm text-green-400">{resendMsg}</p>
                )}

                {/* Submit button (fallback si auto-submit ne se déclenche pas) */}
                <button
                  type="submit"
                  disabled={loading || success || digits.some((d) => d === "")}
                  className={[
                    "mt-6 w-full rounded-xl py-3 text-sm font-semibold transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "glow-red-hover",
                  ].join(" ")}
                >
                  {loading ? "Verifying…" : "Verify"}
                </button>
              </form>

              {/* Resend hint */}
              <p className="mt-6 text-xs text-muted-foreground">
                You did not receive the code? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary hover:underline disabled:opacity-50 font-medium"
                >
                  {resending ? "sending…" : "click here to receive again the code"}
                </button>
                .
              </p>
            </>
          )}
        </motion.div>

        <motion.p variants={fadeUp} custom={2} className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyCodeForm />
    </Suspense>
  );
}
