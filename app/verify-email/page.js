"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const statusParam = searchParams.get("status");
  const messageParam = searchParams.get("message");
  const verifiedTokenRef = useRef(null);

  const [loading, setLoading] = useState(Boolean(token) && !statusParam);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState(statusParam || (token ? "verifying" : "pending"));
  const [message, setMessage] = useState(
    messageParam || (token
      ? "Verification in progress..."
      : "Check your inbox and click the verification link to activate your account.")
  );
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (statusParam) {
      setLoading(false);
      setStatus(statusParam);
      setMessage(messageParam || "Verification failed.");
      return;
    }

    if (!token) return;
    if (verifiedTokenRef.current === token) return;
    verifiedTokenRef.current = token;

    let active = true;

    const verify = async () => {
      try {
        const response = await fetch(`${apiBase}/api/client/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: "GET",
          credentials: "include",
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Failed to verify email");
        }

        if (!active) return;
        setStatus("success");
        setMessage(payload.message || "Email verified successfully.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error.message || "Failed to verify email");
      } finally {
        if (active) setLoading(false);
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [token, router, statusParam, messageParam]);

  const resendHint = useMemo(() => {
    if (!email) return null;
    return `Verification email sent to ${email}.`;
  }, [email]);

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setResendMessage("");

    try {
      const response = await fetch(`${apiBase}/api/client/auth/resend-verification`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to resend verification email");
      }

      setResendMessage(payload.message || `Verification email resent to ${email}.`);
    } catch (error) {
      setResendMessage(error.message || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-gradient-card p-8 shadow-2xl backdrop-blur text-center">
        <Link href="/" className="font-display text-3xl font-bold tracking-tight">
          RED<span className="text-gradient-red">VANTA</span>
        </Link>

        <h1 className="mt-6 text-2xl font-bold">
          {status === "success" ? "Email Verified" : status === "error" ? "Verification Failed" : "Verify Your Email"}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        {!token && resendHint && <p className="mt-2 text-sm text-muted-foreground">{resendHint}</p>}
        {!token && resendMessage && <p className="mt-2 text-sm text-muted-foreground">{resendMessage}</p>}

        <div className="mt-8 space-y-3">
          {status === "success" && (
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Continue to Dashboard
            </Button>
          )}

          {status === "error" && (
            <Button className="w-full" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          )}

          {!token && (
            <>
              {email && (
                <Button className="w-full" variant="outline" onClick={handleResend} disabled={resending}>
                  {resending ? "Sending..." : "Resend Verification Email"}
                </Button>
              )}
              <Button className="w-full" onClick={() => router.push("/login")}>
                Back to Login
              </Button>
            </>
          )}

          {loading && (
            <Button className="w-full" disabled>
              Verifying...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
