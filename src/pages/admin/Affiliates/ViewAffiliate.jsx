import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../../services/api";

export default function ViewAffiliate() {
  const { id } = useParams();
  const [affiliate, setAffiliate] = useState(null);

  async function load() {
    const res = await api.get(`/admin/affiliates/${id}`);
    setAffiliate(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  if (!affiliate) return "Loading...";

  return (
    <div>
      <h1 className="page-title">Affiliate details</h1>

      <div className="card">
        <p><strong>Name:</strong> {affiliate?.name}</p>
        <p><strong>Email:</strong> {affiliate?.email}</p>
        <p><strong>Clicks:</strong> {affiliate?.totalClicks}</p>
        <p><strong>Conversions:</strong> {affiliate?.totalConversions}</p>
        <p>
          <strong>Pending payout:</strong>{" "}
          {affiliate?.pendingPayout.toFixed(2)} €
        </p>

        <button
          className="btn"
          onClick={async () => {
            await api.post(`/admin/affiliates/${id}/payout`);
            load();
          }}
        >
          Send Payout
        </button>
      </div>
    </div>
  );
}