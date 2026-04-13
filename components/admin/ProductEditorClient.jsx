"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Helpers for drag & drop
function DragItem({ item, index, onRemove }) {
  return (
    <div
      draggable
      className="flex items-center justify-between p-2 border rounded mb-1 bg-gray-50"
    >
      <span>{item.name || item.title || item.slug}</span>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-red-500 font-bold"
      >
        ✕
      </button>
    </div>
  );
}

export default function ProductEditor({ productId = null }) {
  const router = useRouter();
  const [data, setData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    category: "",
    upsell: [],
    crossSell: [],
    designs: [],
    bundles: [],
    image: null
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch product if editing
  useEffect(() => {
    if (productId) {
      fetch(`/products/${productId}`)
        .then(r => r.json())
        .then(j => setData(j));
    }
  }, [productId]);

  // Preview image
  useEffect(() => {
    if (file) setPreview(URL.createObjectURL(file));
  }, [file]);

  // ---------------- SAVE PRODUCT ----------------
  async function save(e) {
    e.preventDefault();
    const payload = new FormData();
    payload.append("data", JSON.stringify(data));
    if (file) payload.append("image", file);

    const res = await fetch(
      productId ? `/products/${productId}` : "/products",
      { method: productId ? "PUT" : "POST", body: payload }
    );

    if (res.ok) router.push("/dashboard/products");
    else alert("Erreur lors de l'enregistrement");
  }

  // ---------------- AUTO UPSELL ----------------
  async function autoUpsell() {
    if (!productId) return alert("Sauvegardez le produit d'abord");
    const res = await fetch(`/products/${productId}/upsell`, { method: "POST" });
    const j = await res.json();
    setData(prev => ({ ...prev, upsell: j.upsell.map(x => x.id) }));
    alert("Upsell généré automatiquement");
  }

  // ---------------- ADD / REMOVE CROSSSELL ----------------
  async function addCrossSell(product) {
    if (!productId) return alert("Sauvegardez le produit d'abord");
    await fetch(`/products/${productId}/cross-sell`, {
      method: "POST",
      body: JSON.stringify({ targetId: product.id }),
      headers: { "Content-Type": "application/json" }
    });
    setData(prev => ({ ...prev, crossSell: [...prev.crossSell, product] }));
  }

  function removeCrossSell(index) {
    setData(prev => {
      const newArr = [...prev.crossSell];
      newArr.splice(index, 1);
      return { ...prev, crossSell: newArr };
    });
  }

  // ---------------- ADD / REMOVE BUNDLE ----------------
  async function addBundle(bundle) {
    if (!productId) return alert("Sauvegardez le produit d'abord");
    await fetch(`/products/${productId}/bundles`, {
      method: "POST",
      body: JSON.stringify({ bundleId: bundle.id }),
      headers: { "Content-Type": "application/json" }
    });
    setData(prev => ({ ...prev, bundles: [...prev.bundles, bundle] }));
  }

  function removeBundle(index) {
    setData(prev => {
      const newArr = [...prev.bundles];
      newArr.splice(index, 1);
      return { ...prev, bundles: newArr };
    });
  }

  // ---------------- SELECT DESIGNS ----------------
  async function toggleDesign(design) {
    if (!productId) return alert("Sauvegardez le produit d'abord");

    const exists = data.designs.some(d => d.id === design.id);
    const url = `/products/${productId}/designs`;
    if (exists) {
      await fetch(url, { method: "DELETE", body: JSON.stringify({ designId: design.id }), headers: { "Content-Type": "application/json" } });
      setData(prev => ({ ...prev, designs: prev.designs.filter(d => d.id !== design.id) }));
    } else {
      await fetch(url, { method: "POST", body: JSON.stringify({ designId: design.id }), headers: { "Content-Type": "application/json" } });
      setData(prev => ({ ...prev, designs: [...prev.designs, design] }));
    }
  }

  // ---------------- RENDER ----------------
  return (
    <div className="grid grid-cols-2 gap-6">
      <form onSubmit={save} className="bg-white p-4 rounded shadow">
        <h2 className="font-bold text-lg mb-2">{productId ? "Modifier Produit" : "Nouveau Produit"}</h2>

        {/* Basic Fields */}
        <input value={data.title || ""} onChange={e => setData({ ...data, title: e.target.value })} placeholder="Titre" className="w-full mb-2 p-2 border" />
        <input value={data.slug || ""} onChange={e => setData({ ...data, slug: e.target.value })} placeholder="Slug" className="w-full mb-2 p-2 border" />
        <input value={data.price || ""} onChange={e => setData({ ...data, price: e.target.value })} placeholder="Prix (ex: 19.90)" className="w-full mb-2 p-2 border" />
        <input value={data.category || ""} onChange={e => setData({ ...data, category: e.target.value })} placeholder="Catégorie" className="w-full mb-2 p-2 border" />
        <textarea value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Description" className="w-full mb-2 p-2 border" />

        {/* File Upload */}
        <input type="file" onChange={e => setFile(e.target.files[0])} className="mb-2" />
        {preview && <img src={preview} className="w-32 h-32 object-cover mb-2" />}

        {/* Buttons */}
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={autoUpsell} className="btn">Générer Upsell</button>
          <button type="submit" className="btn-primary">Enregistrer</button>
        </div>

        {/* Cross-Sell */}
        <div className="mb-4">
          <h4 className="font-semibold">Cross-Sell</h4>
          {data.crossSell.map((p, i) => (
            <DragItem key={p.id} item={p} index={i} onRemove={removeCrossSell} />
          ))}
        </div>

        {/* Bundles */}
        <div className="mb-4">
          <h4 className="font-semibold">Bundles</h4>
          {data.bundles.map((b, i) => (
            <DragItem key={b.id} item={b} index={i} onRemove={removeBundle} />
          ))}
        </div>

        {/* Designs */}
        <div className="mb-4">
          <h4 className="font-semibold">Designs</h4>
          <div className="flex flex-wrap gap-2">
            {data.designs.map(d => (
              <img key={d.id} src={d.thumbnail || "/placeholder.png"} alt={d.title} className="w-16 h-16 object-cover border rounded" />
            ))}
          </div>
        </div>
      </form>

      {/* Product Card Preview */}
      <div className="bg-gray-50 p-4 rounded shadow">
        <h2 className="font-bold text-lg mb-2">Aperçu du Produit</h2>
        {preview ? <img src={preview} className="w-full h-48 object-cover mb-2" /> : data.image && <img src={data.image} className="w-full h-48 object-cover mb-2" />}
        <h3 className="font-semibold">{data.title}</h3>
        <p>{data.description}</p>
        <p className="font-bold">{data.price} €</p>
        {data.upsell.length > 0 && <p className="text-sm text-blue-600">Upsell: {data.upsell.join(", ")}</p>}
      </div>
    </div>
  );
}
