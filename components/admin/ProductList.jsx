import Link from "next/link";

export default function ProductList({ items = [], onEdit = () => {}, onDelete = () => {} }) {
  if (!items.length) return <div className="p-4 bg-white rounded shadow">Aucun produit.</div>;

  return (
    <div className="space-y-4">
      {items.map((p) => (
        <div key={p.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
          <div>
            <div className="font-semibold">{p.title || p.name}</div>
            <div className="text-sm text-gray-500">{p.slug || ""}</div>
            <div className="text-sm text-gray-700">{((p.priceCents||0)/100).toFixed(2)} {p.currency||'EUR'}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded" onClick={() => onEdit(p)}>Edit</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(p.id)}>Delete</button>
            <Link href={`/product/${p.slug || '#'}`}><a className="px-3 py-1 border rounded">Voir</a></Link>
          </div>
        </div>
      ))}
    </div>
  );
}
