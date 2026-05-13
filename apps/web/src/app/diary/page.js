"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthContext";
import PremiumOverlay from "../../components/PremiumOverlay";
import StickerCTA from "../../components/StickerCTA";

export default function DiaryPage() {
  const { isPremium } = useAuth();
  const [logs, setLogs] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem('diary_logs') || '[]');
    } catch {
      return [];
    }
  });
  const [newLog, setNewLog] = useState({ 
    title: "", 
    category: "Fuel", 
    cost: "", 
    rideTime: "", 
    restTime: "" 
  });

  useEffect(() => {
    // Initial load handled by state initializer
  }, []);

  const handleAdd = () => {
    if (!newLog.title) return;
    const updated = [{ ...newLog, id: Date.now(), date: new Date().toLocaleDateString() }, ...logs];
    setLogs(updated);
    localStorage.setItem('diary_logs', JSON.stringify(updated));
    setNewLog({ title: "", category: "Fuel", cost: "", rideTime: "", restTime: "" });
  };

  const categories = ["Fuel", "Food", "Toll", "Service", "Other"];

  return (
    <div className="animate-page-enter w-full max-w-7xl mx-auto mt-12 px-4 pb-32 relative min-h-[70vh]">
      {!isPremium && <PremiumOverlay featureName="Rider Diary & Trip Manager" />}
      
      <div className={`transition-all duration-700 ${!isPremium ? 'blur-md grayscale opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="mb-10">
          <h1 className="text-4xl font-black font-heading tracking-tight mb-2 uppercase italic">Rider <span className="text-bh-primary">Diary</span></h1>
          <p className="text-bh-gray text-sm font-medium tracking-wide uppercase">Track every hour, every kilometer, and every rupee.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Side */}
          <div className="lg:col-span-4">
             <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                <h4 className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-[0.3em] font-heading mb-8 border-b border-white/10 pb-4 italic">New Trip Log</h4>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Trip/Reason Name</label>
                      <input 
                        value={newLog.title}
                        onChange={(e) => setNewLog({...newLog, title: e.target.value})}
                        placeholder="e.g. Mumbai to Goa"
                        className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:border-bh-primary outline-none transition-all" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Type</label>
                        <select 
                          value={newLog.category}
                          onChange={(e) => setNewLog({...newLog, category: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:border-bh-primary outline-none appearance-none cursor-pointer"
                        >
                           {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Cost (₹)</label>
                        <input 
                          type="number"
                          value={newLog.cost}
                          onChange={(e) => setNewLog({...newLog, cost: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:border-bh-primary outline-none transition-all" 
                        />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Ride Time (Hrs)</label>
                        <input 
                          type="number"
                          value={newLog.rideTime}
                          onChange={(e) => setNewLog({...newLog, rideTime: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:border-bh-primary outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Rest Time (Hrs)</label>
                        <input 
                          type="number"
                          value={newLog.restTime}
                          onChange={(e) => setNewLog({...newLog, restTime: e.target.value})}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:border-bh-primary outline-none transition-all" 
                        />
                      </div>
                   </div>
                   <button 
                     onClick={handleAdd}
                     className="btn btn-primary btn-full py-4 mt-4 font-black uppercase tracking-widest text-[0.65rem] shadow-glow-red"
                   >
                     Add to Diary
                   </button>
                </div>
             </div>
          </div>

          {/* Logs Side */}
          <div className="lg:col-span-8 space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-[0.3em] font-heading italic">Past Session Logs</h4>
                <div className="flex gap-4">
                   <div className="flex flex-col items-end">
                      <span className="text-[0.5rem] font-black text-bh-gray uppercase tracking-widest">Total Spent</span>
                      <span className="text-sm font-black text-white">₹{logs.reduce((acc, l) => acc + (Number(l.cost) || 0), 0)}</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {logs.length === 0 ? (
                   <div className="glass-card p-12 flex flex-col items-center justify-center text-bh-gray-dark gap-4 border-dashed">
                      <span className="text-4xl">📓</span>
                      <span className="text-[0.6rem] font-black uppercase tracking-widest">Your diary is empty. Start logging!</span>
                   </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.02] transition-all group">
                       <div className="flex items-center gap-6 flex-1 w-full">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/5 ${log.category === 'Fuel' ? 'bg-bh-yellow/10 text-bh-yellow' : 'bg-bh-primary/10 text-bh-primary'}`}>
                             {log.category === 'Fuel' ? '⛽' : log.category === 'Food' ? '🍱' : '🧾'}
                          </div>
                          <div>
                             <h5 className="font-black text-lg group-hover:text-bh-primary transition-colors">{log.title}</h5>
                             <div className="flex items-center gap-3 mt-1">
                                <span className="text-[0.6rem] font-black text-bh-gray uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">{log.category}</span>
                                <span className="text-[0.6rem] font-bold text-bh-gray-dark uppercase tracking-widest">{log.date}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-10 w-full md:w-auto">
                          <div className="flex flex-col items-center md:items-end">
                             <span className="text-[0.5rem] font-black text-bh-gray uppercase tracking-widest">Times</span>
                             <span className="text-[0.7rem] font-bold text-white uppercase italic">{log.rideTime}h Ride / {log.restTime}h Rest</span>
                          </div>
                          <div className="flex flex-col items-center md:items-end">
                             <span className="text-[0.5rem] font-black text-bh-gray uppercase tracking-widest italic">Amount</span>
                             <span className="text-lg font-black text-white">₹{log.cost}</span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
      {/* QR Sticker CTA */}
      <div className="mt-8">
        <StickerCTA variant="compact" />
      </div>
    </div>
  );
}
