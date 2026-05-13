"use client";
import AdminShell from "../../../components/AdminShell";
import { useEffect, useState } from "react";
import Link from "next/link";

function StatCard({ icon, label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-start gap-4 hover:border-white/10 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1">{label}</div>
        <div className={`text-3xl font-black font-heading ${color}`}>{value ?? "—"}</div>
        {sub && <div className="text-[0.65rem] text-[#444] mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setRecentUsers(data.recentUsers || []);
      } else {
        setError(data.error || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const STATUS_STYLES = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    cancelled: "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20",
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF2E2E] border-t-transparent animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 p-6 rounded-2xl text-[#FF2E2E] text-center max-w-md">
            {error}
          </div>
          <button onClick={() => { setLoading(true); setError(null); fetchStats(); }}
            className="text-xs font-black text-[#FF2E2E] uppercase tracking-widest hover:underline">
            Retry
          </button>
        </div>
      </AdminShell>
    );
  }

  const s = stats || {};
  const members = s.members || 0;
  const newToday = s.newToday || 0;
  const freeStickers = s.freeStickers || 0;
  const paidStickers = s.paidStickers || 0;
  const totalOrders = s.totalOrders || 0;
  const successOrders = s.successOrders || 0;
  const pendingOrders = s.pendingOrders || 0;
  const revenue = s.revenue || 0;

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-heading tracking-tight text-white">Operations Dashboard</h1>
        <p className="text-[#555] text-sm mt-1">Live overview of Bikemate platform activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        <StatCard icon="👥" label="Total Members"        value={members.toLocaleString()}  sub={`+${newToday} new today`} color="text-emerald-400" />
        <StatCard icon="📥" label="New Joins Today"      value={newToday}                  sub="Registered users" color="text-blue-400" />
        <StatCard icon="🏷️" label="Sticker Downloads"   value={freeStickers + paidStickers} sub={`${freeStickers} free • ${paidStickers} paid`} color="text-yellow-400" />
        <StatCard icon="🛒" label="Total Orders"         value={totalOrders}               sub={`${successOrders} success • ${pendingOrders} pending`} color="text-[#FF2E2E]" />
        <StatCard icon="💰" label="Revenue (All Time)"   value={`₹${revenue.toLocaleString()}`} sub="From successful orders" color="text-emerald-400" />
        <StatCard icon="✅" label="Successful Orders"    value={successOrders}             color="text-emerald-400" />
        <StatCard icon="⏳" label="Pending Orders"       value={pendingOrders}             color="text-yellow-400" />
        <StatCard icon="📦" label="Free Sticker DLs"    value={freeStickers}              sub="QR safety stickers" color="text-purple-400" />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-black text-[#FF2E2E] uppercase tracking-widest hover:underline">View All →</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-10 text-center text-[#444] text-sm font-bold">
              No orders yet.
            </div>
          ) : (
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    {["Customer", "Amount", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-[0.6rem] font-black text-[#444] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={o.id || i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm font-bold text-white">{o.customer || "—"}</td>
                      <td className="px-4 py-3 text-sm font-black text-white">₹{o.amount || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${STATUS_STYLES[o.status] || STATUS_STYLES.pending}`}>
                          {o.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">New Members</h2>
            <Link href="/admin/users" className="text-xs font-black text-[#FF2E2E] uppercase tracking-widest hover:underline">Manage All →</Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-10 text-center text-[#444] text-sm font-bold">
              No new members yet.
            </div>
          ) : (
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    {["Name", "Phone", "Role"].map(h => (
                      <th key={h} className="px-4 py-3 text-[0.6rem] font-black text-[#444] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u, i) => (
                    <tr key={u.id || i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-white">{u.name || "Unnamed"}</div>
                        <div className="text-[0.6rem] text-[#444]">
                          {u.date ? new Date(u.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#888] font-mono">{u.phone || "—"}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-[#555] border-white/5'}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
