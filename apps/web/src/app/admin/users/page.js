"use client";
import AdminShell from "../../../components/AdminShell";
import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    }
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-3xl font-black font-heading tracking-tight text-white">Member Management</h1>
        <p className="text-[#555] text-sm mt-1">View profiles, manage premium status, and block members</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF2E2E] border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 p-6 rounded-2xl text-[#FF2E2E] text-center">
          {error}
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                {["Name", "Email", "Phone", "Status", "Premium", "Actions"].map(h => (
                  <th key={h} className="px-6 py-4 text-[0.6rem] font-black text-[#444] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-white">{u.name || "Unnamed"}</div>
                    <div className="text-[0.6rem] text-[#444] uppercase tracking-tighter">ID: {u.id}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#888]">{u.email || "—"}</td>
                  <td className="px-6 py-4 text-xs text-[#888]">{u.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${u.isBlocked ? "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${u.subscriptionActive ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" : "bg-[#222] text-[#444] border-white/5"}`}>
                      {u.subscriptionActive ? "Premium" : "Free"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdate(u.id, { subscriptionActive: !u.subscriptionActive })}
                        className={`text-[0.6rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${u.subscriptionActive ? "bg-[#222] text-[#888] border-white/5 hover:bg-white/5" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20 hover:bg-yellow-400/20"}`}
                      >
                        {u.subscriptionActive ? "Downgrade" : "Promote"}
                      </button>
                      <button 
                        onClick={() => handleUpdate(u.id, { isBlocked: !u.isBlocked })}
                        className={`text-[0.6rem] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${u.isBlocked ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20 hover:bg-[#FF2E2E]/20"}`}
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
