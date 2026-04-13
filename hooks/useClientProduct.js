"use client";

import { useEffect, useMemo, useState } from "react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const fallbackImage = "/placeholder.svg";

const pickLocalizedValue = (value, lang) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return "";
  return value[lang] || value.en || Object.values(value).find(Boolean) || "";
};

const normalizeGallery = (product, fallbackGallery = []) => {
  const gallery = Array.isArray(product?.gallery)
    ? product.gallery
        .map((item) => {
          if (typeof item === "string") return item;
          if (!item?.url) return null;
          return {
            url: item.url,
            type: item.type || "image",
            poster: item.poster || null,
          };
        })
        .filter(Boolean)
    : [];

  if (product?.image) {
    gallery.unshift(product.image);
  }

  return gallery.length ? gallery : fallbackGallery.length ? fallbackGallery : [fallbackImage];
};

const normalizePackageTiers = (tiers = [], fallbackPrice = 0) =>
  Array.isArray(tiers)
    ? tiers
        .map((tier) => {
          const qty = Number(tier?.qty ?? 0);
          const price = Number(tier?.price ?? fallbackPrice ?? 0);
          const lineTotal = Number(tier?.lineTotal ?? price * qty);

          if (!qty || !price) return null;

          return {
            id: tier?.id ?? null,
            qty,
            price,
            lineTotal,
            label: qty === 1 ? "1 Card" : `${qty} Cards`,
          };
        })
        .filter(Boolean)
    : [];

export const normalizeClientProduct = (product, lang, fallback) => {
  const packageTiers = normalizePackageTiers(product?.packageTiers, product?.price ?? fallback.price);
  const defaultTier = packageTiers[0] || null;

  return {
    id: product?.id ?? null,
    slug: pickLocalizedValue(product?.slug, lang) || fallback.slug,
    title: pickLocalizedValue(product?.title, lang) || fallback.title,
    description:
      pickLocalizedValue(product?.metaDescription, lang) ||
      pickLocalizedValue(product?.seoTitle, lang) ||
      fallback.description,
    price: Number(defaultTier?.price ?? product?.price ?? fallback.price ?? 0),
    image: product?.image || fallback.image || fallbackImage,
    gallery: normalizeGallery(product, fallback.gallery || []),
    packageTiers,
    packageTierId: defaultTier?.id ?? null,
  };
};

export function useClientProduct(slug, lang, fallback) {
  const [rawProduct, setRawProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${apiBase}/client/by-slug/${encodeURIComponent(slug)}`);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.error || payload?.message || "Failed to load product");
        }

        const product = payload?.data || null;

        if (product?.id) {
          const tiersResponse = await fetch(`${apiBase}/client/${product.id}/package-tiers`);

          if (tiersResponse.ok) {
            const tiersPayload = await tiersResponse.json().catch(() => ({}));
            product.packageTiers = Array.isArray(tiersPayload?.data) ? tiersPayload.data : product.packageTiers;
          }
        }

        if (active) {
          setRawProduct(product);
        }
      } catch (requestError) {
        if (active) {
          setRawProduct(null);
          setError(requestError.message || "Failed to load product");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  const product = useMemo(
    () => normalizeClientProduct(rawProduct, lang, fallback),
    [fallback, lang, rawProduct]
  );

  return { product, loading, error };
}
