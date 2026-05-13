"use client";
import AdminShell from "../../../components/AdminShell";
import { useEffect, useState } from "react";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  confirmed: { label: "Confirmed", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  shipped:   { label: "Shipped",   color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  cancelled: { label: "Cancelled", color: "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20" },
  // Legacy mappings
  success:   { label: "Success",   color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  trash:     { label: "Trashed",   color: "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20" },
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [editing, setEditing] = useState(null);
  const [updating, setUpdating] = useState(null);

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
        setOrders(data.orders || []);
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
    setUpdating(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: parseInt(id), status: newStatus.toUpperCase() })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      // Fallback to local update if API not ready
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } finally {
      setUpdating(null);
      setEditing(null);
    }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    shipped:   orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight text-white">Order Management</h1>
          <p className="text-[#555] text-sm mt-1">View and manage all customer orders</p>
        </div>
        <div className="text-2xl font-black text-white">{counts.all} order{counts.all !== 1 ? "s" : ""}</div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all",       label: `All (${counts.all})` },
          { key: "pending",   label: `⏳ Pending (${counts.pending})` },
          { key: "confirmed", label: `📋 Confirmed (${counts.confirmed})` },
          { key: "shipped",   label: `🚚 Shipped (${counts.shipped})` },
          { key: "delivered", label: `✅ Delivered (${counts.delivered})` },
          { key: "cancelled", label: `❌ Cancelled (${counts.cancelled})` },
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
                      <td className="px-4 py-4 text-xs font-mono text-[#444] whitespace-nowrap">{typeof o.id === 'string' ? o.id.slice(-10) : `#${o.id}`}</td>
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
                            {["pending", "confirmed", "shipped", "delivered", "cancelled"].filter(s => s !== o.status).map(s => (
                              <button key={s} onClick={() => updateStatus(o.id, s)}
                                disabled={updating === o.id}
                                className={`text-[0.55rem] font-black uppercase px-2 py-1 rounded-lg border transition-all disabled:opacity-50 ${STATUS_CONFIG[s].color}`}>
                                {updating === o.id ? "..." : s}
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
      )}
    </AdminShell>
  );
}
