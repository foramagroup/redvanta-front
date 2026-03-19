export default function OrderList({ orders = [] }) {
  if (!orders.length) return <div className="p-4 bg-white rounded shadow">Aucune commande.</div>;

  return (
    <div className="space-y-3">
      {orders.map(o => (
        <div key={o.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
          <div>
            <div className="font-semibold">#{o.orderNumber}</div>
            <div className="text-sm text-gray-600">Client: {o.customerEmail || (o.customer && o.customer.email) || "—"}</div>
            <div className="text-sm text-gray-700">Montant: {((o.totalCents||0)/100).toFixed(2)} {o.currency || 'EUR'}</div>
            <div className="text-sm text-gray-500">Statut: {o.status}</div>
          </div>
          <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
