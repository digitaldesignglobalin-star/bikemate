"use client";
import AdminShell from "../../../components/AdminShell";
import { useEffect, useState } from "react";

const STATUS_CONFIG = {
  pending: { label: "Pending",  color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  success: { label: "Success",  color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  trash:   { label: "Trashed",  color: "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20" },
};

// Seed orders so admin has data from first load
const SEED_ORDERS = [
  { id: "ORD-seed-001", customer: "Arjun Mehta",  email: "arjun@example.com",  items: "Premium Subscription (3 days)", amount: 60,  status: "success", type: "subscription", date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "ORD-seed-002", customer: "Priya Sharma", email: "priya@example.com",  items: "Rider Essential Tee",           amount: 699, status: "pending", type: "store",        date: new Date(Date.now() - 86400000).toISOString() },
  { id: "ORD-seed-003", customer: "Ravi Nair",    email: "ravi@example.com",   items: "Moto Carbon Keyring",           amount: 249, status: "success", type: "store",        date: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "ORD-seed-004", customer: "Kavya Rao",    email: "kavya@example.com",  items: "Smart Sticker Pack",            amount: 399, status: "success", type: "sticker",      date: new Date(Date.now() - 3600000 * 2).toISOString() },
];

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    // For now, we update local state as there's no status update API yet
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setEditing(null);
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const counts = {
    all:     orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    success: orders.filter(o => o.status === "success").length,
    trash:   orders.filter(o => o.status === "trash").length,
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight text-white">Order Management</h1>
          <p className="text-[#555] text-sm mt-1">View and manage all customer orders</p>
        </div>
        <div className="text-2xl font-black text-white">{counts.all} orders</div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all",     label: `All (${counts.all})` },
          { key: "pending", label: `⏳ Pending (${counts.pending})` },
          { key: "success", label: `✅ Success (${counts.success})` },
          { key: "trash",   label: `🗑️ Trashed (${counts.trash})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
              filter === f.key
                ? "bg-[#FF2E2E] border-[#FF2E2E] text-white"
                : "bg-white/[0.03] border-white/[0.07] text-[#555] hover:text-white"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF2E2E] border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 p-6 rounded-2xl text-[#FF2E2E] text-center">
          {error}
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                {["Order ID", "Customer", "Email", "Items", "Amount", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-[0.6rem] font-black text-[#444] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center text-[#444] text-sm font-bold">No orders match this filter.</td></tr>
              ) : (
                filtered.map((o) => {
                  const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors">
                      <td className="px-4 py-4 text-xs font-mono text-[#444] whitespace-nowrap">{o.id?.slice(-10) || "—"}</td>
                      <td className="px-4 py-4 text-sm font-black text-white whitespace-nowrap">{o.customer || "—"}</td>
                      <td className="px-4 py-4 text-xs text-[#555] whitespace-nowrap">{o.email || "—"}</td>
                      <td className="px-4 py-4 text-xs text-[#666] max-w-[180px] truncate">{o.items || "—"}</td>
                      <td className="px-4 py-4 text-sm font-black text-white whitespace-nowrap">₹{o.amount || 0}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#555] whitespace-nowrap">
                        {o.date ? new Date(o.date).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-4 py-4">
                        {editing === o.id ? (
                          <div className="flex gap-1.5 flex-wrap">
                            {["pending", "success", "trash"].filter(s => s !== o.status).map(s => (
                              <button key={s} onClick={() => updateStatus(o.id, s)}
                                className={`text-[0.55rem] font-black uppercase px-2 py-1 rounded-lg border transition-all ${STATUS_CONFIG[s].color}`}>
                                {s}
                              </button>
                            ))}
                            <button onClick={() => setEditing(null)}
                              className="text-[0.55rem] font-black text-[#444] border border-white/10 px-2 py-1 rounded-lg">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setEditing(o.id)}
                            className="text-xs font-black text-[#555] hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
