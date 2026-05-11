"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import AdminShell from "../../../components/AdminShell";

export default function AdminProductsPage() {
  const [products,    setProducts]    = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("bm_products") || "[]"); } catch { return []; }
  });
  const [isLoading,   setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData,    setFormData]    = useState({
    name: "", category: "APPAREL", price: "", mrp: "", stock: "100",
    description: "", imageUrl: "/assets/images/tshirt.png", variants: "[]",
  });

  const fetchProducts = async () => {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 4000);
    try {
      const res  = await fetch("/api/products", { signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.success) { setProducts(data.products); }
    } catch { clearTimeout(timeout); }
    setIsLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(), 0);
    return () => clearTimeout(t);
  }, []);

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdd = (e) => {
    e.preventDefault();
    const p = {
      id: Date.now(),
      ...formData,
      price: parseFloat(formData.price),
      mrp:   formData.mrp ? parseFloat(formData.mrp) : null,
      stock: parseInt(formData.stock),
      images: [formData.imageUrl],
    };
    const updated = [p, ...products];
    setProducts(updated);
    localStorage.setItem("bm_products", JSON.stringify(updated));
    setIsModalOpen(false);
    setFormData({ name:"",category:"APPAREL",price:"",mrp:"",stock:"100",description:"",imageUrl:"/assets/images/tshirt.png",variants:"[]" });
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this product?")) return;
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem("bm_products", JSON.stringify(updated));
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight text-white">Product Database</h1>
          <p className="text-[#555] text-sm mt-1">{products.length} product{products.length !== 1 ? "s" : ""} in catalog</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm px-6">
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                {["Image","Name","Category","Price","MRP","Stock","Description","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-[0.6rem] font-black text-[#444] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-[#444] font-bold text-sm">Loading…</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-[#444] font-bold text-sm">No products yet. Click &quot;+ Add Product&quot; to create one.</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 relative bg-white/5 rounded-xl overflow-hidden">
                        <Image src={p.images?.[0] || "/assets/images/tshirt.png"} alt={p.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-black text-sm text-white max-w-[160px] truncate">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-[0.6rem] font-black bg-white/[0.06] px-2.5 py-1 rounded-full uppercase tracking-widest text-[#B0B0B0]">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 font-black text-sm text-[#FF2E2E]">₹{p.price}</td>
                    <td className="px-4 py-3 text-sm text-[#555] line-through">{p.mrp ? `₹${p.mrp}` : "—"}</td>
                    <td className="px-4 py-3 font-bold text-sm text-emerald-400">{p.stock}</td>
                    <td className="px-4 py-3 text-xs text-[#555] max-w-[160px] truncate italic">{p.description || "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(p.id)}
                        className="text-xs font-black text-[#FF2E2E] hover:text-white border border-[#FF2E2E]/30 hover:border-[#FF2E2E] px-3 py-1.5 rounded-lg transition-all">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white hover:text-black transition-all text-sm">
              ✕
            </button>
            <h2 className="text-2xl font-black font-heading mb-6 text-white">Create New Product</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1.5">Product Name *</label>
                  <input required name="name" value={formData.name} onChange={handleInput}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FF2E2E] transition-colors" />
                </div>
                <div>
                  <label className="block text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1.5">Category</label>
                  <select name="category" value={formData.category} onChange={handleInput}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FF2E2E]">
                    {["APPAREL","ACCESSORIES","SAFETY","STICKER","BUNDLES","OTHER"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1.5">Image URL</label>
                  <input name="imageUrl" value={formData.imageUrl} onChange={handleInput}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FF2E2E] transition-colors" />
                </div>
                <div>
                  <label className="block text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1.5">Price (₹) *</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInput}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FF2E2E] transition-colors" />
                </div>
                <div>
                  <label className="block text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1.5">MRP (₹) Optional</label>
                  <input type="number" name="mrp" value={formData.mrp} onChange={handleInput}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FF2E2E] transition-colors" />
                </div>
                <div>
                  <label className="block text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1.5">Stock *</label>
                  <input required type="number" name="stock" value={formData.stock} onChange={handleInput}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FF2E2E] transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1.5">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInput} rows={3}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FF2E2E] transition-colors resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1.5">JSON Variants (e.g. [&#123;&quot;size&quot;:&quot;L&quot;&#125;])</label>
                  <textarea name="variants" value={formData.variants} onChange={handleInput} rows={2}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FF2E2E] font-mono text-xs transition-colors resize-none" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full mt-4">Save to Database</button>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
