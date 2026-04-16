import api from "../lib/api";

// ─── Public — flux scan (sans auth) ──────────────────────────

// GET /review/:uid
export async function fetchBusiness(uid) {
  const res = await api.get(`/review/${uid}`);
  const data = res?.data ?? res;
  return {
    name:            data?.locationName ?? data?.business?.name ?? "",
    logoUrl:         data?.business?.logo ?? "",
    googlePlaceId:   data?.googlePlaceId ?? "",
    thankYouMessage: data?.business?.thankYouMessage ?? "",
    primaryColor:    data?.business?.primaryColor ?? "#E10600",
    uid:             data?.uid ?? uid,
    active:          data?.active ?? true,
  };
}

// POST /review/:uid/rate — retourne { action, googleReviewUrl? }
export async function submitRating(uid, stars) {
  return api.post(`/review/${uid}/rate`, { stars });

}

// POST /review/:uid/feedback
export async function submitFeedback({ slug, rating, message, email }) {
  return api.post(`/review/${slug}/feedback`, { stars: rating, message, email });
}

// PAGE_VIEW auto-enregistré par GET /review/:uid
export async function trackEvent(_payload) {
  return Promise.resolve();
}

// ─── Admin (authentifié) ─────────────────────────────────────
export default {
  post: (payload) => api.post("/reviews", payload).then((r) => r.data),
  listByLocation: (slug) =>
    api.get(`/reviews?location=${encodeURIComponent(slug)}`).then((r) => r.data),
};
