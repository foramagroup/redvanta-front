"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";

export default function ReviewPage() {
  const { orderId } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = async () => {
    await api.post("/reviews/submit", {
      orderId,
      rating,
      comment
    });
    alert("Review submitted!");
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Leave a Review</h1>

      <label className="block mt-4">Rating</label>
      <select
        className="input"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      <label className="block mt-4">Comment</label>
      <textarea
        className="input"
        rows={5}
        onChange={(e) => setComment(e.target.value)}
      />

      <button className="btn-primary mt-5" onClick={submit}>
        Submit Review
      </button>
    </div>
  );
}
