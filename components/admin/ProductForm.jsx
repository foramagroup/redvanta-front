"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductForm({
  productId = null,
  initial = null,
  onSaved = () => {},
  onCancel = () => {}
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    visible: true,
    image: null
  });

  const [loading, setLoading] = useState(false);

  /* Load product if editing */
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        slug: initial.slug || "",
        description: initial.description || "",
        price: initial.price || "",
        category: initial.category || "",
        stock: initial.stock ?? "",
        visible: Boolean(initial.visible),
        image: null
      });
    } else if (productId) {
      fetch(`/api/products/${productId}`)
        .then(r => r.json())
        .then(p => {
          setForm({
            name: p.name || "",
            slug: p.slug || "",
            description: p.description || "",
            price: p.price || "",
            category: p.category || "",
            stock: p.stock ?? "",
            visible: Boolean(p.visible),
            image: null
          });
        });
    }
  }, [initial, productId]);

  /* Submit */
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("slug", form.slug);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("category", form.category);
      fd.append("stock", form.stock);
      fd.append("visible", form.visible ? "true" : "false");

      if (form.image) fd.append("image", form.image);

      const id = productId || initial?.id || "";
      const method = id ? "PUT" : "POST";

      const res = await fetch(`/api/products/${id}`, { method, body: fd });

      if (!res.ok) throw new Error(await res.text());

      const saved = await res.json();
      onSaved(saved);
      router.push("/dashboard/products");
    } catch (err) {
      console.error(err);
      alert("Error saving product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="input" placeholder="Product Name"
          required value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input className="input" placeholder="Slug" required
          value={form.slug}
          onChange={e => setForm({ ...form, slug: e.target.value })}
        />
      </div>

      <textarea
        className="input"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <input className="input" type="number" step="0.01" placeholder="Price (€)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />

      <input className="input" placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

      <input className="input" type="number" placeholder="Stock"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />

      <label className="flex items-center gap-2">
        <input type="checkbox"
          checked={form.visible}
          onChange={(e) => setForm({ ...form, visible: e.target.checked })}
        />
        Visible
      </label>

      <input type="file"
        onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
      />

      <div className="flex gap-2">
        <button className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>

        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
