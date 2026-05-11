"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../utils/api";

export default function SpectatorPage() {
  const { userId } = useParams();
  const [rider, setRider] = useState(null);
  const [locality, setLocality] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await api.get(`/live/${userId}`);
        if (!data.isLive) {
          setError(data.error);
          setRider(data);
        } else {
          setRider(data);
          setError(null);
          
          // Reverse Geocode mapping
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${data.liveLat}&lon=${data.liveLng}&format=json`);
            if (res.ok) {
              const locData = await res.json();
              const locName = locData.address?.city || locData.address?.town || locData.address?.village || locData.address?.suburb || locData.address?.county || "Local Tracking...";
              setLocality(locName);
            }
          } catch {
            setLocality("Live mapping...");
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to connect to satellite.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-bh-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-black tracking-widest uppercase text-bh-primary animate-pulse">ESTABLISHING LINK...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0D0D0D] relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-50 flex items-center px-8 justify-between">
        <div className="font-heading text-xl font-black tracking-tight flex items-center gap-2">
          <span className="text-bh-primary text-2xl">🏍</span>
          <span className="bg-gradient-to-br from-bh-primary to-[#FF6B6B] bg-clip-text text-transparent">Bikemate Spectator</span>
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center flex-col text-center z-10 px-4">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-4xl mb-6 shadow-glow-red">🚫</div>
          <h2 className="text-3xl font-black mb-2">{rider?.name ? `${rider.name} is Offline` : 'Link Broken'}</h2>
          <p className="text-bh-gray">{error}</p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
             <div className="grid grid-cols-12 grid-rows-12 w-[150%] h-[150%] -translate-x-10 -translate-y-10 rotate-12">
                {Array.from({length: 144}).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/5 relative">
                    <div className="absolute top-0 left-0 w-1 h-1 bg-white/20 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center z-10">
             <div className="relative flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-bh-yellow rounded-full animate-ping absolute opacity-50 shadow-[0_0_50px_rgba(255,200,61,1)]"></div>
                <div className="w-12 h-12 bg-bh-yellow rounded-full shadow-[0_0_60px_rgba(255,200,61,0.8)] relative z-10 border-4 border-bh-bg flex items-center justify-center text-xs">🏍</div>
                
                <div className="bg-bh-card/80 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl text-center shadow-2xl mt-4 max-w-sm">
                   <h3 className="text-lg font-black tracking-tight text-white">{rider.name} is Live</h3>
                   <div className="text-[0.65rem] font-black text-bh-gray uppercase tracking-[0.2em] mt-1 mb-3">Satellite Active</div>
                   
                   {locality && (
                     <div className="text-[0.65rem] font-black text-bh-yellow uppercase tracking-widest mb-1.5">{locality}</div>
                   )}
                   
                   <div className="flex items-center gap-4 justify-center py-2 border-t border-white/5">
                     <span className="text-bh-primary font-bold">{rider.liveLat.toFixed(4)}°</span>
                     <div className="w-1 h-1 rounded-full bg-white/20"></div>
                     <span className="text-bh-primary font-bold">{rider.liveLng.toFixed(4)}°</span>
                   </div>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
