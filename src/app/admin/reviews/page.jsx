"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get("/admin/reviews").then((res) => setReviews(res.data));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">All Reviews</h1>

      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Order</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Date</th>
            <th>PDF</th>
          </tr>
        </thead>

        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.user.email}</td>
              <td>{r.orderId}</td>
              <td>{r.rating}</td>
              <td>{r.comment}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                <a
                  className="btn-secondary"
                  href={`${process.env.NEXT_PUBLIC_API_URL}/reviews/${r.id}/pdf`}
                  target="_blank"
                >
                  Download PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
