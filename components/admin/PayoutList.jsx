export default function PayoutList({ items = [], onApprove = () => {}, onDecline = () => {} }) {
  if (!items || items.length === 0) return <div className="p-4 bg-white rounded shadow">Aucune demande.</div>;

  return (
    <div className="space-y-3">
      {items.map(p => (
        <div key={p.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
          <div>
            <div className="font-semibold">#{p.id} — {p.affiliate ? (p.affiliate.name || p.affiliate.code) : p.affiliateId}</div>
            <div className="text-sm text-gray-600">Montant: {(p.amountCents/100).toFixed(2)} {p.currency} • Statut: {p.status}</div>
            <div className="text-xs text-gray-500">Demande: {new Date(p.requestedAt).toLocaleString()}</div>
            {p.note && <div className="text-sm mt-1">Note: {p.note}</div>}
          </div>
          <div className="flex gap-2">
            {p.status === "pending" && <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => onApprove(p.id)}>Approuver & Payer</button>}
            {p.status === "pending" && <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => onDecline(p.id)}>Refuser</button>}
            <a className="px-3 py-1 border rounded" href={`${process.env.NEXT_PUBLIC_API_URL}/admin/payouts/${p.id}`}>Détails</a>
          </div>
        </div>
      ))}
    </div>
  );
}
