// frontend/app/r/page.jsx

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // Always fresh

export default async function RedirectByUid({ searchParams }) {
  const uid = searchParams.uid;

  if (!uid) {
    return (
      <div className="p-10 text-center text-red-600">
        <h1 className="text-2xl font-bold">Missing UID</h1>
        <p>A UID parameter is required, e.g.: /r?uid=XXXXX</p>
      </div>
    );
  }

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  try {
    const res = await fetch(`${API}/api/nfc/resolve/${uid}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return (
        <div className="p-10 text-center text-red-600">
          <h1 className="text-2xl font-bold">UID Not Found</h1>
          <p>No NFC record exists for UID: {uid}</p>
        </div>
      );
    }

    const data = await res.json();

    // data must contain an ID to redirect
    if (data?.id) {
      redirect(`/dashboard/nfc/${data.id}`);
    }

    return (
      <div className="p-10 text-center text-red-600">
        <h1 className="text-2xl font-bold">Invalid NFC Record</h1>
        <p>Record exists but is missing a valid internal ID.</p>
      </div>
    );
  } catch (err) {
    console.error(err);
    return (
      <div className="p-10 text-center text-red-600">
        <h1 className="text-2xl font-bold">Server Error</h1>
        <p>Unable to resolve UID due to a backend issue.</p>
      </div>
    );
  }
}
