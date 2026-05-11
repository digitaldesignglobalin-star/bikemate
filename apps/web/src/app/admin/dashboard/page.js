"use client";
import AdminShell from "../../../components/AdminShell";
import { useEffect, useState } from "react";

function StatCard({ icon, label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-start gap-4 hover:border-white/10 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1">{label}</div>
        <div className={`text-3xl font-black font-heading ${color}`}>{value}</div>
        {sub && <div className="text-[0.65rem] text-[#444] mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(() => {
    const orders = (() => { try { return JSON.parse(localStorage.getItem("bm_orders") || "[]"); } catch { return []; } })();
    const successO  = orders.filter(o => o.status === "success");
    const pendingO  = orders.filter(o => o.status === "pending");
    const revenue   = successO.reduce((s, o) => s + (o.amount || 0), 0);
    const memberCount  = parseInt(localStorage.getItem("bm_member_count") || "1247");
    const newToday     = parseInt(localStorage.getItem("bm_new_today")    || "12");
    const freeStk      = parseInt(localStorage.getItem("sticker_free_dl") || "384");
    const paidStk      = parseInt(localStorage.getItem("sticker_paid_dl") || "91");

    return {
      members:       memberCount,
      newToday:      newToday,
      freeStickers:  freeStk,
      paidStickers:  paidStk,
      totalOrders:   orders.length,
      revenue:       revenue,
      pendingOrders: pendingO.length,
      successOrders: successO.length,
    };
  });

  const [recentOrders, setRecentOrders] = useState(() => {
    try {
      const orders = JSON.parse(localStorage.getItem("bm_orders") || "[]");
      return orders.slice(0, 5);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Keep this empty or remove if no longer needed. 
    // In this case, we've moved initial load to state initializers.
  }, []);

  const STATUS_STYLES = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    trash:   "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20",
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-heading tracking-tight text-white">Operations Dashboard</h1>
        <p className="text-[#555] text-sm mt-1">Live overview of Bikemate platform activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        <StatCard icon="👥" label="Total Members"        value={stats.members.toLocaleString()}  sub={`+${stats.newToday} new today`} color="text-emerald-400" />
        <StatCard icon="📥" label="New Joins Today"      value={stats.newToday}                  sub="Registered users" color="text-blue-400" />
        <StatCard icon="🏷️" label="Sticker Downloads"   value={stats.freeStickers + stats.paidStickers} sub={`${stats.freeStickers} free • ${stats.paidStickers} paid`} color="text-yellow-400" />
        <StatCard icon="🛒" label="Total Orders"         value={stats.totalOrders}               sub={`${stats.successOrders} success • ${stats.pendingOrders} pending`} color="text-[#FF2E2E]" />
        <StatCard icon="💰" label="Revenue (All Time)"   value={`₹${stats.revenue.toLocaleString()}`} sub="From successful orders" color="text-emerald-400" />
        <StatCard icon="✅" label="Successful Orders"    value={stats.successOrders}             color="text-emerald-400" />
        <StatCard icon="⏳" label="Pending Orders"       value={stats.pendingOrders}             color="text-yellow-400" />
        <StatCard icon="📦" label="Free Sticker DLs"    value={stats.freeStickers}              sub="QR safety stickers" color="text-purple-400" />
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">Recent Orders</h2>
          <a href="/admin/orders" className="text-xs font-black text-[#FF2E2E] uppercase tracking-widest hover:underline">View All →</a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-10 text-center text-[#444] text-sm font-bold">
            No orders yet. Orders will appear here after checkout.
          </div>
        ) : (
          <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  {["Order ID", "Customer", "Items", "Amount", "Status", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-[0.6rem] font-black text-[#444] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <tr key={o.id || i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs font-mono text-[#555]">{o.id?.slice(-8) || "—"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-white">{o.customer || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#666] max-w-[160px] truncate">{o.items || "—"}</td>
                    <td className="px-4 py-3 text-sm font-black text-white">₹{o.amount || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${STATUS_STYLES[o.status] || STATUS_STYLES.pending}`}>
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#555]">
                      {o.date ? new Date(o.date).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
