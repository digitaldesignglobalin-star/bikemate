"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthContext";
import { useState, useEffect } from "react";
import { useLocation } from "../../hooks/useLocation";
import { useWeather } from "../../hooks/useWeather";
import StickerCTA from "../../components/StickerCTA";

const HEALTH_TIPS = [
  { title: "Hydrate: Drink 500 ml electrolytes every 50 km.", icon: "🥤" },
  { title: "Reaction: 7 h sleep reduces high-speed latency.", icon: "💤" },
  { title: "Visibility: Clean your visor before sunset.",     icon: "🌅" },
  { title: "Posture: Relax shoulders to avoid back-burn.",    icon: "🚵" },
  { title: "Nutrition: High-protein snacks prevent sugar crashes.", icon: "🥜" },
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

  // Feedback Form State
  const [feedbackType, setFeedbackType] = useState("SUGGESTION");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    getLocation();

    const interval = setInterval(() => setCurrentTime(new Date()), 60000); // UI updates every minute
    return () => clearInterval(interval);
  }, [getLocation]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;

    setFeedbackLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type: feedbackType, message: feedbackMsg })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSuccess(true);
        setFeedbackMsg("");
        setTimeout(() => setFeedbackSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackLoading(false);
    }
  };

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
  const totalDistanceKm = user.totalDistance || 0; 
  
  // 100km = 10 pts -> 1 pt per 10km
  const rewardPoints = Math.floor(totalDistanceKm / 10); 
  // 10000 pts = ₹10 -> 1000 pts = ₹1 -> rupees = pts / 1000
  const rewardRupees = (rewardPoints / 1000).toFixed(2);

  const dynamicStats = [
    { label: "Total Rides",   icon: "🚵", value: user.totalRides || "0" },
    { label: "Safety Score",  icon: "🛡️", value: user.safetyScore || "100%" },
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

          <div className="flex flex-wrap gap-2 mt-6">
            {user.isVolunteer && (
              <div className="flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                <span className="text-[0.6rem] font-black text-emerald-400 uppercase tracking-widest">🩸 Blood Donor Mesh</span>
              </div>
            )}
            {user.subscriptionActive && (
              <div className="flex items-center gap-2 bg-bh-primary/10 border border-bh-primary/20 px-3 py-1 rounded-full">
                <span className="text-[0.6rem] font-black text-bh-primary uppercase tracking-widest">🛡️ Safety Certified</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Weather Intel Widget ── */}
        <div className="lg:w-[340px] shrink-0">
          <div className="relative bg-[#111] border border-white/5 rounded-[1.5rem] p-5 overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center shrink-0">
                <span className="text-4xl mb-1">{weatherLoading ? "🌍" : weather ? weather.icon : "🌍"}</span>
                <span className="text-2xl font-black text-white">{weatherLoading ? "—" : weather ? `${weather.temp}°C` : "—"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-0.5">{weatherLoading ? "Scanning…" : "Weather Intel"}</div>
                <div className="text-sm font-black text-white mb-2 truncate">{weather ? weather.condition : "Scanning…"}</div>
                {coords && <span className="text-[0.55rem] font-black text-[#666] uppercase tracking-[0.1em]">📍 LAT: {coords.lat.toFixed(4)}° / LNG: {coords.lng.toFixed(4)}°</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {dynamicStats.map((stat, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center group hover:border-[#FF2E2E]/20 hover:bg-[#FF2E2E]/[0.02] transition-all relative overflow-hidden">
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</span>
            <span className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-1">{stat.label}</span>
            <span className="text-xl font-black text-white">{stat.value}</span>
            {stat.subtext && <span className="text-[0.55rem] font-bold text-yellow-400 mt-1 uppercase tracking-widest">{stat.subtext}</span>}
          </div>
        ))}
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

      {/* ── Feedback Section ── */}
      <div className="mb-12">
        <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
          <span className="w-8 h-[2px] bg-blue-500 rounded-full" />
          Feedback & Support
        </h3>
        <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h4 className="text-xl font-black font-heading tracking-tight mb-2">Facing issues or have an idea?</h4>
              <p className="text-sm text-[#888] leading-relaxed">
                Your feedback helps us make Bikemate better. Report problems or suggest new features directly to our team.
              </p>
              <div className="mt-6 flex gap-4">
                <button onClick={() => setFeedbackType("REPORT")} className={`px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest border transition-all ${feedbackType === "REPORT" ? "bg-[#FF2E2E]/10 border-[#FF2E2E]/30 text-[#FF2E2E]" : "bg-white/5 border-white/5 text-[#555]"}`}>
                  ⚠️ Report Problem
                </button>
                <button onClick={() => setFeedbackType("SUGGESTION")} className={`px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest border transition-all ${feedbackType === "SUGGESTION" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/5 text-[#555]"}`}>
                  💡 Suggest Feature
                </button>
              </div>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder={feedbackType === "REPORT" ? "Describe the problem you're facing..." : "What should we build next?"}
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-[#333] outline-none focus:border-white/20 h-32 resize-none"
              />
              <button 
                type="submit" 
                disabled={feedbackLoading || !feedbackMsg.trim()}
                className={`w-full py-4 rounded-2xl text-[0.7rem] font-black uppercase tracking-widest transition-all ${feedbackSuccess ? "bg-emerald-500 text-black" : "bg-white text-black hover:bg-neutral-200"}`}
              >
                {feedbackLoading ? "Sending..." : feedbackSuccess ? "Message Received ✓" : "Send to Admin"}
              </button>
            </form>
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
          </div>
        </div>
      )}
      {/* QR Sticker CTA */}
      <div className="mt-12">
        <StickerCTA variant="banner" />
      </div>
    </div>
  );
}
