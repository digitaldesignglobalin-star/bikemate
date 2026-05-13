"use client";
import AdminShell from "../../../components/AdminShell";
import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (userId, updateData) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, ...updateData })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? data.user : u));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users based on search and role
  const filtered = users.filter(u => {
    const matchesSearch = !search || 
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search);
    const matchesRole = roleFilter === "all" || 
      (roleFilter === "premium" ? u.subscriptionActive : 
       roleFilter === "blocked" ? u.isBlocked :
       roleFilter === "admin" ? (u.role === "ADMIN" || u.role === "SUPER_ADMIN") :
       u.role === "USER" && !u.isBlocked);
    return matchesSearch && matchesRole;
  });

  const counts = {
    all: users.length,
    active: users.filter(u => u.role === "USER" && !u.isBlocked).length,
    admin: users.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length,
    premium: users.filter(u => u.subscriptionActive).length,
    blocked: users.filter(u => u.isBlocked).length,
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-3xl font-black font-heading tracking-tight text-white">Member Management</h1>
        <p className="text-[#555] text-sm mt-1">
          {users.length} total member{users.length !== 1 ? "s" : ""} registered on the platform
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-[#111] border border-white/5 rounded-xl py-3 pr-4 pl-11 text-sm text-white placeholder:text-[#333] outline-none focus:border-[#FF2E2E]/40 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all",     label: `All (${counts.all})` },
            { key: "active",  label: `Active (${counts.active})` },
            { key: "admin",   label: `Admins (${counts.admin})` },
            { key: "premium", label: `Premium (${counts.premium})` },
            { key: "blocked", label: `Blocked (${counts.blocked})` },
          ].map(f => (
            <button key={f.key} onClick={() => setRoleFilter(f.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all whitespace-nowrap ${
                roleFilter === f.key
                  ? "bg-[#FF2E2E] border-[#FF2E2E] text-white"
                  : "bg-white/[0.03] border-white/[0.07] text-[#555] hover:text-white"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF2E2E] border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 p-6 rounded-2xl text-[#FF2E2E] text-center">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-10 text-center text-[#444] text-sm font-bold">
          {search ? "No members match your search." : "No members found."}
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  {["Name", "Email", "Phone", "Role", "Status", "Premium", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-5 py-4 text-[0.6rem] font-black text-[#444] uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{u.name || "Unnamed"}</div>
                          <div className="text-[0.6rem] text-[#444] uppercase tracking-tighter font-mono">ID: {u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#888]">{u.email || "—"}</td>
                    <td className="px-5 py-4 text-xs text-[#888] font-mono">{u.phone || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        u.role === "ADMIN" || u.role === "SUPER_ADMIN"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-white/5 text-[#555] border-white/5"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${u.isBlocked ? "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${u.subscriptionActive ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" : "bg-[#222] text-[#444] border-white/5"}`}>
                        {u.subscriptionActive ? "Premium" : "Free"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#555] whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdate(u.id, { subscriptionActive: !u.subscriptionActive })}
                          disabled={actionLoading === u.id}
                          className={`text-[0.6rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${u.subscriptionActive ? "bg-[#222] text-[#888] border-white/5 hover:bg-white/5" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20 hover:bg-yellow-400/20"}`}
                        >
                          {actionLoading === u.id ? "..." : u.subscriptionActive ? "Downgrade" : "Promote"}
                        </button>
                        <button 
                          onClick={() => handleUpdate(u.id, { isBlocked: !u.isBlocked })}
                          disabled={actionLoading === u.id}
                          className={`text-[0.6rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${u.isBlocked ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20 hover:bg-[#FF2E2E]/20"}`}
                        >
                          {actionLoading === u.id ? "..." : u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer with count */}
          <div className="px-5 py-3 border-t border-white/5 text-[0.65rem] font-bold text-[#444]">
            Showing {filtered.length} of {users.length} members
          </div>
        </div>
      )}
    </AdminShell>
  );
}
