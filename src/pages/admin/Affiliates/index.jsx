import { useEffect, useState } from "react";
import api from "../../../../services/api";
import AffiliateRow from "./AffiliateRow";

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState([]);

  async function loadData() {
    const res = await api.get("/admin/affiliates");
    setAffiliates(res.data);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1 className="page-title">Affiliates</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>E-mail</th>
            <th>Total Clicks</th>
            <th>Conversions</th>
            <th>Pending Payout</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {affiliates.map((a) => (
            <AffiliateRow key={a.id} affiliate={a} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
