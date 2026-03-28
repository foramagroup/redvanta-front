"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { LoadingState } from "@/components/review/LoadingState";
import { ErrorState } from "@/components/review/ErrorState";
import { WelcomeModal } from "@/components/review/WelcomeModal";
import { StarRating } from "@/components/review/StarRating";
import { PositiveResult } from "@/components/review/PositiveResult";
import { NegativeFeedback } from "@/components/review/NegativeFeedback";
import { fetchBusiness, submitFeedback, trackEvent } from "@/services/api";

const DEMO_BUSINESS = {
  name: "The Grand Bistro",
  slug: "the-grand-bistro",
  logoUrl: "",
  googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
  thankYouMessage: "Thank you for dining with us!",
};

export default function ReviewPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [phase, setPhase] = useState("loading");
  const [business, setBusiness] = useState(null);
  const [rating, setRating] = useState(0);

  const track = useCallback((event, metadata) => {
    if (slug) {
      trackEvent({ slug, event, metadata }).catch(() => {});
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setPhase("error");
      return;
    }

    let cancelled = false;

    const load = async () => {
      let biz;

      try {
        const data = await fetchBusiness(slug);
        if (!data || !data.name) throw new Error("Invalid response");
        biz = data;
      } catch {
        biz = { ...DEMO_BUSINESS, slug };
      }

      if (cancelled) return;

      setBusiness(biz);
      track("page_view");
      window.setTimeout(() => {
        if (!cancelled) setPhase("modal");
      }, 1500);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, track]);

  useEffect(() => {
    if (business) {
      document.title = `Review ${business.name} | REDVANTA`;
    }
  }, [business]);

  const handleRate = (value) => {
    setRating(value);
    track("rating_selected", { rating: value });
    window.setTimeout(() => {
      setPhase(value >= 4 ? "positive" : "negative");
    }, 400);
  };

  const handleFeedbackSubmit = async (message, email) => {
    if (!slug) return;

    try {
      await submitFeedback({ slug, rating, message, email });
    } catch {
      // keep UX non-blocking for review capture
    }

    track("negative_feedback_submitted");
  };

  const handleGoogleRedirect = () => {
    track("redirected_google");
  };

  if (phase === "loading") return <LoadingState />;
  if (phase === "error" || !business) return <ErrorState />;

  return (
    <>
      <div
        className={`flex min-h-screen items-center justify-center bg-background px-4 py-8 transition-all duration-300 ${
          phase === "modal" ? "invisible" : ""
        }`}
      >
        <div className="w-full max-w-[480px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 rounded-2xl bg-card p-8 shadow-card"
          >
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-primary">
                <span className="text-2xl font-display font-bold text-primary-foreground">
                  {business.name?.charAt(0) ?? "?"}
                </span>
              </div>
            )}

            <div className="text-center">
              <h1 className="text-xl font-display font-bold text-foreground">
                {business.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {business.thankYouMessage || "We value your feedback"}
              </p>
            </div>

            <div className="w-full pt-2">
              {phase === "rating" && <StarRating onRate={handleRate} />}
              {phase === "positive" && (
                <PositiveResult
                  googlePlaceId={business.googlePlaceId}
                  onRedirect={handleGoogleRedirect}
                />
              )}
              {phase === "negative" && (
                <NegativeFeedback onSubmit={handleFeedbackSubmit} />
              )}
            </div>

            <p className="mt-4 text-[11px] text-muted-foreground/60 font-body">
              Powered by <span className="font-semibold">REDVANTA</span>
            </p>
          </motion.div>
        </div>
      </div>

      <WelcomeModal
        businessName={business?.name ?? ""}
        open={phase === "modal"}
        onStart={() => setPhase("rating")}
      />
    </>
  );
}
