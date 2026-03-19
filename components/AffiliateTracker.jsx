"use client";
import { useEffect } from "react";

export default function AffiliateTracker({ code }) {
  useEffect(() => {
    if (!code) return;
    // set cookie (client-side) for 30 days
    document.cookie = `krootal_aff=${code}; path=/; max-age=${60*60*24*30}`;
    // optionally ping backend track endpoint (not necessary)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/affiliate/track?code=${code}&redirect=${encodeURIComponent(window.location.pathname)}`).catch(()=>{});
  }, [code]);

  return null;
}
