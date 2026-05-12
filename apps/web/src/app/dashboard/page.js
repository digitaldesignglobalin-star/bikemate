"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthContext";
import { useState, useEffect } from "react";
import { useLocation } from "../../hooks/useLocation";
import { useWeather } from "../../hooks/useWeather";

const HEALTH_TIPS = [
  { title: "Hydrate: Drink 500 ml electrolytes every 50 km.", icon: "🥤" },
  { title: "Reaction: 7 h sleep reduces high-speed latency.", icon: "💤" },
  { title: "Visibility: Clean your visor before sunset.",     icon: "🌅" },
  { title: "Posture: Relax shoulders to avoid back-burn.",    icon: "🚵" },
  { title: "Nutrition: High-protein snacks prevent sugar crashes.", icon: "🥜" },
];

const STATS = [
  { label: "Total Rides",   icon: "🚵", key: "totalRides", fallback: "0"   },
  { label: "Safety Score",  icon: "🛡️", key: null,        fallback: "98%" },
  { label: "Health Vault",  icon: "🏥", key: "medHistory", fallback: "Optional" },
  { label: "Reward Points", icon: "🔥", key: null,        fallback: "450" },
];

const QUICK_ACTIONS = [
  { href: "/sos",       icon: "🚨", label: "SOS",       color: "text-[#FF2E2E]",   glow: "bg-[#FF2E2E]/5",    hover: "group-hover:border-[#FF2E2E]/20",  pulse: true },
  { href: "/dashcam",   icon: "📷", label: "Dashcam",   color: "text-purple-400",  glow: "bg-purple-500/5",   hover: "group-hover:border-purple-400/20" },
  { href: "/convoy",    icon: "📡", label: "Convoy",    color: "text-blue-400",    glow: "bg-blue-500/5",     hover: "group-hover:border-blue-400/20" },
  { href: "/garage",    icon: "🛢️", label: "Garage",    color: "text-[#FACC15]",   glow: "bg-[#FACC15]/5",    hover: "group-hover:border-[#FACC15]/20" },
  { href: "/survival",  icon: "🎒", label: "Survival",  color: "text-neutral-300", glow: "bg-neutral-500/5",  hover: "group-hover:border-neutral-400/20" },
  
  { href: "/map?filter=mechanic", icon: "🔧", label: "Mechanic",  color: "text-orange-400",  glow: "bg-orange-500/5",   hover: "group-hover:border-orange-400/20" },
  { href: "/map?filter=fuel",     icon: "⛽", label: "Petrol",    color: "text-emerald-400", glow: "bg-emerald-500/5",  hover: "group-hover:border-emerald-400/20" },
  { href: "/map?filter=hospital", icon: "🏥", label: "Hospital",  color: "text-pink-400",    glow: "bg-pink-500/5",     hover: "group-hover:border-pink-400/20" },
  { href: "/map?filter=pharmacy", icon: "💊", label: "Pharmacy",  color: "text-cyan-400",    glow: "bg-cyan-500/5",     hover: "group-hover:border-cyan-400/20" },
  { href: "/map?filter=towing",   icon: "🛻", label: "Towing",    color: "text-yellow-600",  glow: "bg-yellow-600/5",   hover: "group-hover:border-yellow-600/20" },
];

export default function Dashboard() {
  const { user, isPremium, loading: authLoading } = useAuth();
  const router = useRouter();
  const [healthTip, setHealthTip] = useState(() => HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)]);
  const { coords, locality, getLocation } = useLocation();
  const { weather, loading: weatherLoading } = useWeather(coords);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    getLocation();

    const interval = setInterval(() => setCurrentTime(new Date()), 60000); // UI updates every minute
    return () => clearInterval(interval);
  }, [getLocation]);

  if (authLoading || !user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#FF2E2E]/30 border-t-[#FF2E2E] animate-spin"></div>
      </div>
    );
  }

  // Auto Greeting with Time Context and Festivals
  const getGreetingData = () => {
    const d = currentTime.getDate();
    const m = currentTime.getMonth() + 1; // 1-12
    const h = currentTime.getHours();

    // 1. Time based greeting phase
    let timeGreeting = "Good evening";
    if (h < 12) timeGreeting = "Good morning";
    else if (h < 17) timeGreeting = "Good afternoon";
    else if (h >= 20) timeGreeting = "Good night";

    // 2. Festival / Holiday Check
    let festival = null;
    let wish = null;
    let salutationPrefix = "";

    if (m === 1 && d === 1)   { festival = "New Year"; wish = "Ride into an incredible year ahead!"; salutationPrefix = "Happy New Year"; }
    else if (m === 1 && d === 26)  { festival = "Republic Day"; wish = "Saluting the spirit of India. Ride with pride!"; salutationPrefix = "Happy Republic Day"; }
    else if (m === 8 && d === 15)  { festival = "Independence Day"; wish = "Freedom on two wheels! Celebrate safely."; salutationPrefix = "Happy Independence Day"; }
    else if (m === 10 && d === 2)  { festival = "Gandhi Jayanti"; wish = "A day of peace and non-violence. Ride responsibly."; salutationPrefix = "Happy Gandhi Jayanti"; }
    else if (m === 10 && d === 31) { festival = "Diwali"; wish = "May your path be always illuminated! Ride safe this festival of lights."; salutationPrefix = "Happy Diwali"; } // Mock Diwali
    else if (m === 12 && d === 25) { festival = "Christmas"; wish = "Wishing you joy and safe winter rides!"; salutationPrefix = "Merry Christmas"; }

    return { timeGreeting, festival, wish, salutationPrefix };
  };

  const { timeGreeting, festival, wish, salutationPrefix } = getGreetingData();

  // Date Formatting
  const dateStr = currentTime.toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });

  // Calculate Dynamic Reward Formulas
  const totalDistanceKm = user.totalDistance || 4500; // Mock 4500 km if undefined
  
  // 100km = 10 pts -> 1 pt per 10km
  const rewardPoints = Math.floor(totalDistanceKm / 10); 
  // 10000 pts = ₹10 -> 1000 pts = ₹1 -> rupees = pts / 1000
  const rewardRupees = (rewardPoints / 1000).toFixed(2);

  const dynamicStats = [
    { label: "Total Rides",   icon: "🚵", value: user.totalRides || "42" },
    { label: "Safety Score",  icon: "🛡️", value: user.safetyScore || "98%" },
    { label: "Health Vault",  icon: "🏥", value: user.medicalNotes ? "Complete" : "Optional" },
    { label: "Reward Points", icon: "🔥", value: rewardPoints.toLocaleString(), subtext: `Value: ₹${rewardRupees}` },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mt-4 pb-32 animate-[pageEnter_0.4s_ease_both]">

      {/* ── Health Tip Banner ── */}
      <div className="mb-8 relative group cursor-default">
        <div className="absolute inset-0 bg-yellow-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-[#111] border border-yellow-400/10 px-6 py-3 rounded-2xl flex items-center gap-4 overflow-hidden">
          <div className="w-1.5 h-10 bg-yellow-400 absolute left-0 top-0 bottom-0 rounded-r" />
          <span className="text-xl ml-2">{healthTip.icon}</span>
          <div className="flex-1">
            <span className="text-[0.6rem] font-black text-yellow-400 uppercase tracking-[0.2em] block mb-0.5">AI Health Intelligence</span>
            <p className="text-[0.75rem] font-bold text-white tracking-wide">{healthTip.title}</p>
          </div>
        </div>
      </div>

      {/* ── Hero Row ── */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
             <p className="text-[#555] text-[0.6rem] font-black uppercase tracking-[0.3em] flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
               System Active
             </p>
             <div className="h-3 w-[1px] bg-white/10"></div>
             <p className="text-[#888] text-[0.65rem] font-bold uppercase tracking-widest">{dateStr} • {timeStr}</p>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight">
            {festival ? `${salutationPrefix}, ` : `${timeGreeting}, `}
            <span className="bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">{user ? user.name?.split(" ")[0] : "Rider"}!</span> {festival ? "🎊" : "🤘"}
          </h1>
          
          <p className="text-sm text-[#B0B0B0] mt-4 max-w-sm leading-relaxed">
            {festival ? wish : "Your machine is primed. Ready for a session? Stay safe on every road."}
          </p>
        </div>

        {/* ── Weather Intel Widget ── */}
        <div className="lg:w-[340px] shrink-0">
          <div className="relative bg-[#111] border border-white/5 rounded-[1.5rem] p-5 overflow-hidden">
            {/* glow */}
            {weather?.isRaining && <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />}
            {!weather?.isRaining && weather && <div className="absolute inset-0 bg-[#FF2E2E]/[0.02] pointer-events-none" />}

            <div className="flex items-start gap-4">
              {/* Icon + Temp */}
              <div className="flex flex-col items-center shrink-0">
                <span className="text-4xl mb-1">
                  {weatherLoading ? "🌍" : weather ? weather.icon : "🌍"}
                </span>
                <span className="text-2xl font-black text-white">
                  {weatherLoading ? "—" : weather ? `${weather.temp}°C` : "—"}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-0.5">
                  {weatherLoading ? "Fetching weather…" : weather ? "Weather Intel" : coords ? "Loading…" : "Enable GPS"}
                </div>
                <div className="text-sm font-black text-white mb-2 truncate">
                  {weather ? weather.condition : weatherLoading ? "Scanning…" : "Location required"}
                </div>

                {/* Rain bar */}
                {weather && (
                  <div className="mb-2">
                    <div className="flex justify-between text-[0.55rem] font-black uppercase tracking-widest mb-1">
                      <span className="text-[#444]">Rain forecast</span>
                      <span className={weather.rainChance >= 35 ? "text-blue-400" : "text-emerald-400"}>{weather.rainChance}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${weather.rainChance >= 35 ? "bg-blue-400" : "bg-emerald-400"}`}
                        style={{ width: `${weather.rainChance}%` }} />
                    </div>
                  </div>
                )}

                {/* GPS coords with Locality */}
                {coords && (
                  <div className="mt-1 flex flex-col gap-0.5">
                    {locality && (
                       <span className="text-[0.65rem] font-black text-yellow-400 uppercase tracking-widest">{locality}</span>
                    )}
                    <span className="text-[0.55rem] font-black text-[#666] uppercase tracking-[0.1em]">
                      📍 LAT: {coords.lat.toFixed(4)}° / LNG: {coords.lng.toFixed(4)}°
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Tip */}
            {weather && (
              <div className={`mt-4 px-3 py-2.5 rounded-xl border text-xs font-bold leading-relaxed ${
                weather.isRaining
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                  : "bg-white/[0.03] border-white/5 text-[#B0B0B0]"
              }`}>
                {weather.aiTip}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* ── Profile Completion Prompt ── */}
      {(() => {
        const fields = ['name', 'email', 'phone', 'city', 'address', 'guardianName', 'bikeModel', 'bikeRegNo', 'bikeYear', 'bloodGroup', 'medicalNotes'];
        let filled = 0;
        fields.forEach(f => {
          if (user[f] && user[f].toString().trim() !== "" && user[f] !== "None" && user[f] !== "Verified Rider") filled++;
        });
        const completion = Math.round((filled / fields.length) * 100);
        
        if (completion < 100) {
          return (
            <div className="mb-12 relative group">
              <div className="absolute inset-0 bg-bh-primary/10 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-[#111] border border-bh-primary/20 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-bh-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle cx="50%" cy="50%" r="36" fill="none" stroke="#FF2E2E" strokeWidth="4" strokeDasharray="226" strokeDashoffset={226 - (226 * completion) / 100} className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">{completion}%</div>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <h4 className="text-xl font-black font-heading tracking-tight mb-1">Rider Profile Incomplete</h4>
                    <p className="text-sm text-bh-gray-dark font-medium max-w-sm">
                      Complete your safety dossier to unlock Smart Stickers, SOS tracking, and medical vault features.
                    </p>
                  </div>
                </div>
                
                <Link href="/profile" className="btn btn-primary px-8 py-4 shadow-glow-red shrink-0 font-black uppercase tracking-widest text-xs">
                  Complete Profile Now
                </Link>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {dynamicStats.map((stat, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center group hover:border-[#FF2E2E]/20 hover:bg-[#FF2E2E]/[0.02] transition-all relative overflow-hidden">
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</span>
            <span className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1">{stat.label}</span>
            <span className="text-xl font-black text-white">
              {stat.value}
            </span>
            {stat.subtext && (
               <span className="text-[0.55rem] font-bold text-yellow-400 mt-1 uppercase tracking-widest">{stat.subtext}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Live Tracking CTA ── */}
      <div className="relative group overflow-hidden rounded-[2rem] p-[1px] mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF2E2E]/0 via-[#FF2E2E]/40 to-[#FF2E2E]/0 opacity-20 group-hover:opacity-60 transition-opacity duration-700" />
        <div className="relative flex items-center gap-5 p-5 bg-[#121212] rounded-[2rem] border border-white/5">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-black text-[#B0B0B0] uppercase tracking-widest mb-1">Location Sharing</div>
            <div className="text-sm text-[#555]">Enable live tracking to share your route with family</div>
          </div>
          <Link href="/tracker" className="btn btn-primary btn-sm px-6 shrink-0">Go Live</Link>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mb-12">
        <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
          <span className="w-8 h-[2px] bg-[#FF2E2E] rounded-full" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.href} href={a.href} className="group relative">
              <div className={`absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${a.glow}`} />
              <div className={`relative bg-[#111] border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-4 text-center transition-colors ${a.hover}`}>
                <div className={`w-14 h-14 rounded-2xl ${a.glow} border border-white/5 flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${a.pulse ? "animate-pulse" : ""}`}>
                  {a.icon}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest transition-colors ${a.color}`}>{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Progression & Milestones ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {/* Elite Safety Gift Tracker */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 blur-sm pointer-events-none">
            <span className="text-8xl">🎁</span>
          </div>
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <h4 className="font-black text-white text-lg tracking-tight mb-1">Elite Guardian Milestone</h4>
              <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest leading-relaxed max-w-[200px]">
                Achieve 100% AI Safety Score over 10,000 km for an exclusive Bikemate gift.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center text-2xl">
              🎁
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between text-xs font-black mb-2">
               <span className="text-white">{totalDistanceKm.toLocaleString()} KM</span>
               <span className="text-[#666]">10,000 KM</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full" 
                    style={{ width: `${Math.min((totalDistanceKm / 10000) * 100, 100)}%` }} />
            </div>
            {(totalDistanceKm >= 10000 && parseInt(user?.safetyScore || "100") === 100) ? (
              <button className="btn btn-primary btn-sm w-full mt-4 bg-yellow-500 text-black shadow-glow-yellow border-none">Claim Elite Rider Gift</button>
            ) : (
              <p className="text-[0.55rem] text-[#555] font-black uppercase tracking-widest mt-3 text-center">
                AI tracking: Over-speeding, collisions & signals
              </p>
            )}
          </div>
        </div>

        {/* Reward Point Redemption */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111] border border-white/5 rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 blur-sm pointer-events-none">
            <span className="text-8xl">💎</span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-xl bg-[#FF2E2E]/10 flex items-center justify-center text-[#FF2E2E] text-xl">🔥</span>
              <h4 className="font-black text-white text-lg tracking-tight">Reward Conversion</h4>
            </div>
            <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest leading-relaxed mb-6 max-w-[220px]">
               Convert points to Premium Days. (Min ₹10 wallet baseline required)
            </p>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 flex items-center justify-between z-10 relative">
             <div>
               <span className="text-[0.6rem] text-[#555] font-black uppercase tracking-widest block mb-0.5">Current Balance</span>
               <span className="text-lg font-black text-emerald-400">₹{rewardRupees}</span>
             </div>
             <button disabled={parseFloat(rewardRupees) < 10} className="btn btn-outline border-white/10 hover:border-[#FF2E2E]/50 text-[#B0B0B0] hover:text-white btn-sm text-[0.65rem] px-5">
               {parseFloat(rewardRupees) < 10 ? "Needs ₹10 to Unlock" : "Redeem Sub"}
             </button>
          </div>
        </div>
      </div>

      {/* ── Premium Upgrade Banner ── */}
      {!isPremium && (
        <div className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/10 via-white/[0.05] to-transparent overflow-hidden shadow-2xl">
          <div className="relative bg-[#151515] p-8 md:p-12 rounded-[2.5rem] flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-[0.65rem] font-black text-yellow-400 uppercase tracking-widest mb-6">
                Featured
              </div>
              <h3 className="text-3xl font-black font-heading tracking-tight mb-4">Elevate Your Ride</h3>
              <p className="text-[#B0B0B0] text-base leading-relaxed mb-8">
                Unlock live GPS, VIP SOS, AI weather alerts, and exclusive rider discounts. From just ₹20/day.
              </p>
              <Link href="/subscription" className="btn btn-primary btn-lg shadow-[0_0_30px_rgba(255,46,46,0.3)]">
                Upgrade • ₹20/day
              </Link>
            </div>
            <div className="hidden lg:flex flex-col gap-4">
              {["Real-time GPS + Family Sharing", "Medical record vault", "AI Rain & Weather alerts", "10% off store gear"].map((b, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 py-4 px-6 rounded-2xl border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-[10px]">✓</div>
                  <span className="text-[0.9rem] font-bold text-[#B0B0B0]">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
