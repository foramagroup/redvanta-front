import { useEffect, useState } from "react";
import api from "../../../../services/api";

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);

  async function load() {
    const res = await api.get("/admin/payouts");
    setPayouts(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="page-title">Payouts History</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Affiliate</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {payouts.map((p) => (
            <tr key={p.id}>
              <td>{p.affiliate.name}</td>
              <td>{p.amount.toFixed(2)} €</td>
              <td>{new Date(p.createdAt).toLocaleString()}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
