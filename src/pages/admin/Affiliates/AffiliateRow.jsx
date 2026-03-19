export default function AffiliateRow({ affiliate }) {
  return (
    <tr>
      <td>{affiliate.name}</td>
      <td>{affiliate.email}</td>
      <td>{affiliate.totalClicks}</td>
      <td>{affiliate.totalConversions}</td>
      <td>{affiliate.pendingPayout.toFixed(2)} €</td>
      <td>
        <a href={`/admin/affiliates/${affiliate.id}`} className="btn-sm">
          View
        </a>
      </td>
    </tr>
  );
}
