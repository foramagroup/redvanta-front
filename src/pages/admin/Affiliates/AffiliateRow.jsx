export default function AffiliateRow({ affiliate }) {
  return (
    <tr>
      <td>{affiliate?.name}</td>
      <td>{affiliate?.email}</td>
      <td>{affiliate?.totalClicks}</td>
      <p><strong>Conversions:</strong> {affiliate?.totalConversions || 0}</p>
      <td>{affiliate?.pendingPayout.toFixed(2)} €</td>
      <td>
        <a href="{/admin/affiliates/1}" className="btn-sm">
          View
        </a>
      </td>
    </tr>
  );
}