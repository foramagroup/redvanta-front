import Link from "next/link";

export default function ProductCard({ product = null }) {
  // mock product if none
  const p = product || { title: "Pack NFC 10", description: "Cartes NFC", priceCents: 19900, slug: "nfc-pack-10" };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">{p.title}</h3>
      <p className="text-sm text-gray-600">{p.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-lg font-bold">{(p.priceCents/100).toFixed(2)} €</div>
        <Link href={`/product/${p.slug || "#"}`}><a className="px-3 py-1 bg-blue-600 text-white rounded">Voir</a></Link>
      </div>
    </div>
  );
}
