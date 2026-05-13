"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext";
import { useLocation } from "../../hooks/useLocation";
import StickerCTA from "../../components/StickerCTA";

export default function ConvoyPage() {
  const { user } = useAuth();
  const { coords, status, getLocation, startWatch, stopWatch } = useLocation();
  const [inConvoy, setInConvoy] = useState(false);
  const [buddies, setBuddies] = useState([]);

  useEffect(() => {
    getLocation();
    // Simulate finding friends around you if in convoy
    if (inConvoy && coords) {
      startWatch();
      const timer = setTimeout(() => {
        setBuddies([
          { id: 1, name: "Arjun M.", distance: 0.4, status: "AHEAD", speed: 52 },
          { id: 2, name: "Priya S.", distance: 1.2, status: "BEHIND", speed: 48 },
          { id: 3, name: "Ravi K.", distance: 3.5, status: "BEHIND (WAITING)", speed: 0, alert: true },
        ]);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      stopWatch();
    }
  }, [inConvoy, coords, getLocation, startWatch, stopWatch]);

  const toggleConvoy = () => {
    if (inConvoy) setBuddies([]);
    setInConvoy(!inConvoy);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-4 pb-32 animate-[pageEnter_0.4s_ease_both]">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <Link href="/dashboard" className="text-white bg-white/5 hover:bg-white/10 p-2 rounded-full absolute -top-2 md:top-0 right-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[0.65rem] font-black text-blue-400 uppercase tracking-widest mb-4">
            Group Radar
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-2">
            Convoy <span className="bg-gradient-to-br from-blue-400 to-indigo-400 bg-clip-text text-transparent">Mesh</span>
          </h1>
          <p className="text-[#B0B0B0] text-sm">Create a secure offline-P2P or mesh group session to never leave a rider behind.</p>
        </div>
      </div>

      <div className="glass-card bg-[#111] border-white/5 p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 blur-sm pointer-events-none text-9xl">📡</div>
        <div className="z-10">
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Active Group Session</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-[#666] mb-4">
            {inConvoy ? "Link Established. Syncing coordinates." : "Radar Offline. Tap below to broadcast."}
          </p>
          <div className="flex gap-4">
             <button onClick={toggleConvoy} className={`btn ${inConvoy ? 'bg-[#FF2E2E] text-white hover:bg-red-600' : 'btn-primary bg-blue-500 hover:bg-blue-600'} font-black text-xs uppercase tracking-widest shadow-xl border-none`}>
               {inConvoy ? "Leave Convoy" : "Create Sync Code"}
             </button>
             {!inConvoy && (
               <button className="btn btn-outline border-white/10 text-[#B0B0B0] font-black text-xs uppercase tracking-widest px-6">
                 Join Code
               </button>
             )}
          </div>
        </div>

        {inConvoy && (
          <div className="z-10 bg-black/50 border border-white/10 p-5 rounded-2xl flex flex-col items-center">
             <span className="text-[0.6rem] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Live Sync Code</span>
             <span className="text-3xl font-black tracking-widest text-white">#RIDE45</span>
             <span className="text-[0.55em] font-black text-[#555] uppercase mt-2">Tap to copy link</span>
          </div>
        )}
      </div>

      {inConvoy && (
        <div className="animate-[pageEnter_0.6s_ease_both]">
           <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
             <span className="w-8 h-[2px] bg-blue-400 rounded-full" />
             Rider Proximity Radar
           </h3>
           
           <div className="flex flex-col gap-4">
             {/* You card */}
             <div className="bg-[#111] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)] rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
                <div className="w-1.5 h-full bg-blue-500 absolute left-0 top-0 bottom-0"></div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 text-lg">🎯</div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-white">{user?.name || "You"}</h4>
                  <p className="text-[0.65rem] text-[#666] font-black uppercase tracking-widest">Convoy Leader</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white">{status === "success" ? "LIVE" : "SYNCING"}</div>
                  <div className="text-[0.55rem] text-[#888] font-black uppercase tracking-widest">GPS Status</div>
                </div>
             </div>

             {/* Buddies */}
             {buddies.map(b => (
               <div key={b.id} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 flex items-center gap-4 group hover:border-white/10 transition-colors">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#B0B0B0] text-lg transition-transform group-hover:scale-110">🏍</div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-black ${b.alert ? 'text-[#FF2E2E]' : 'text-white'}`}>{b.name}</h4>
                    <p className={`text-[0.65rem] font-black uppercase tracking-widest ${b.alert ? 'text-[#FF2E2E]/80 animate-pulse' : 'text-[#666]'}`}>{b.status}</p>
                  </div>
                  
                  <div className="flex bg-[#111] p-2 rounded-xl gap-4">
                    <div className="flex flex-col items-center min-w-[40px]">
                      <span className="text-sm font-black text-white">{b.distance}</span>
                      <span className="text-[0.5rem] font-black text-[#555] uppercase tracking-widest">KM</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5"></div>
                    <div className="flex flex-col items-center min-w-[40px]">
                      <span className={`text-sm font-black ${b.speed === 0 ? 'text-[#FF2E2E]' : 'text-emerald-400'}`}>{b.speed}</span>
                      <span className="text-[0.5rem] font-black text-[#555] uppercase tracking-widest">KM/H</span>
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
      {/* QR Sticker CTA */}
      <div className="mt-8">
        <StickerCTA variant="compact" />
      </div>
    </div>
  );
}
