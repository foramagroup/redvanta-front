// frontend/components/admin/AffiliateList.jsx
import Link from "next/link";

export default function AffiliateList({ items = [], onEdit = () => {}, onDelete = () => {} }) {
  if (!items || items.length === 0) return <div className="p-4 bg-white rounded shadow">Aucun affilié trouvé.</div>;

  return (
    <div className="space-y-3">
      {items.map(a => (
        <div key={a.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
          <div>
            <div className="font-semibold">{a.name || a.code}</div>
            <div className="text-sm text-gray-500">{a.email || "-"}</div>
            <div className="text-xs text-gray-400">Code: {a.code}</div>
            <div className="text-xs text-gray-600 mt-1">Clics: {a.clicksCount} • Conversions: {a.conversionsCount} • Revenue: {(a.revenueCents/100).toFixed(2)} €</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/affiliates/${a.id}`}><a className="px-3 py-1 border rounded text-sm">Détails</a></Link>
            <button className="px-3 py-1 border rounded" onClick={() => onEdit(a)}>Éditer</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(a.id)}>Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}
