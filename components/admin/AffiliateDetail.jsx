// frontend/components/admin/AffiliateDetail.jsx
export default function AffiliateDetail({ detail }) {
  const { affiliate, clicks = [], conversions = [], metrics = {} } = detail;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{affiliate.name || affiliate.code}</h3>
            <div className="text-sm text-gray-600">{affiliate.email || "-"}</div>
            <div className="text-xs text-gray-500 mt-1">Code: {affiliate.code}</div>
            <div className="mt-2 text-sm">Clicks: {metrics.clicksCount} • Conversions: {metrics.conversionsCount} • Revenue: {(metrics.revenueCents/100).toFixed(2)} €</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow overflow-auto">
          <h4 className="font-semibold mb-3">Derniers clics</h4>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="p-2 text-left">IP</th><th className="p-2 text-left">Referer</th><th className="p-2">Date</th></tr></thead>
            <tbody>
              {clicks.map(c => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">{c.ip}</td>
                  <td className="p-2">{c.referer || "-"}</td>
                  <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded shadow overflow-auto">
          <h4 className="font-semibold mb-3">Conversions</h4>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="p-2">Order</th><th className="p-2">Montant</th><th className="p-2">Date</th></tr></thead>
            <tbody>
              {conversions.map(c => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">{c.orderId || "-"}</td>
                  <td className="p-2">{(c.amountCents/100).toFixed(2)} €</td>
                  <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
