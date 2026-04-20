const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function generateMetadata({ params, searchParams }) {
  try {
    const uid = searchParams?.uid ?? params.slug;
    const res = await fetch(`${API_BASE}/api/review/${uid}`, {
      cache: "no-store",
    });
    const json = await res.json();
    const data = json?.data ?? json;
    const name = data?.locationName ?? data?.business?.name ?? "Opinoor";
    return {
      title: `${name} — Donnez votre avis`,
      description: `Partagez votre expérience chez ${name}.`,
    };
  } catch {
    return { title: "Donnez votre avis | Opinoor" };
  }
}

export default function ReviewLayout({ children }) {
  return children;
}
