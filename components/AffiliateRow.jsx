export default function AffiliateRow({ affiliate }) {
  return (
    <tr>
      <td className="p-2 border">{affiliate.name}</td>
      <td className="p-2 border">{affiliate.email}</td>
      <td className="p-2 border">{affiliate.clicks || 0}</td>
      <td className="p-2 border">{affiliate.conversions || 0}</td>
      <td className="p-2 border">{(affiliate.pending || 0) / 100} €</td>
    </tr>
  );
}
