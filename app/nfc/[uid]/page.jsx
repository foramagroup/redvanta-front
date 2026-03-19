import { redirect } from "next/navigation";

export default async function NfcPage({ params }) {
  const { uid } = params;
  // simply redirect to review or product page (optionally fetch backend to find target)
  const target = `/review/${uid}`;
  return redirect(target);
}
