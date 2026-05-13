"use client";
import AdminShell from "../../../components/AdminShell";
import { useEffect, useState } from "react";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/feedback", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-3xl font-black font-heading tracking-tight text-white">Feedback & Reports</h1>
        <p className="text-[#555] text-sm mt-1">Review user suggestions and reported problems</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF2E2E] border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 p-6 rounded-2xl text-[#FF2E2E] text-center">
          {error}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-10 text-center text-[#444] text-sm font-bold">
          No feedback received yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {feedbacks.map((f) => (
            <div key={f.id} className="bg-[#111] border border-white/5 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${f.type === "REPORT" ? "bg-[#FF2E2E]/10 text-[#FF2E2E] border-[#FF2E2E]/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                  {f.type}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">👤</div>
                <div>
                  <div className="text-sm font-bold text-white">{f.user?.name || "Unnamed"}</div>
                  <div className="text-[0.65rem] text-[#555]">{f.user?.email} • {new Date(f.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <p className="text-sm text-[#B0B0B0] leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5 italic">
                "{f.message}"
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
