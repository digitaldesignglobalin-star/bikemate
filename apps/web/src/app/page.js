"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useLocation } from "../hooks/useLocation";
import { useWeather } from "../hooks/useWeather";

// ── Static data ───────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🚨",
    title: "Emergency SOS",
    desc: "One tap sends your GPS location to emergency contacts and nearest police.",
    href: "/sos",
    color: "#FF2E2E",
    bg: "rgba(255,46,46,0.1)",
  },
  {
    icon: "📍",
    title: "Live Location",
    desc: "Share your real-time route with family. AI Guardian detects sudden stops.",
    href: "/tracker",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
  },
  {
    icon: "🔧",
    title: "Find Mechanic",
    desc: "Fuel, repair, PUC, hospital — pinpoint every service near your location.",
    href: "/map",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
  },
  {
    icon: "👥",
    title: "Rider Community",
    desc: "Join group rides, meetups, and route challenges with fellow bikers.",
    href: "/community",
    color: "#FACC15",
    bg: "rgba(250,204,21,0.1)",
  },
  {
    icon: "🏷️",
    title: "QR Safety Sticker",
    desc: "Generate a free QR sticker so emergency responders can reach your family.",
    href: "/sticker",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.1)",
  },
  {
    icon: "📋",
    title: "Ride Diary",
    desc: "Log every journey, track distance and stats, replay your best routes.",
    href: "/diary",
    color: "#F97316",
    bg: "rgba(249,115,22,0.1)",
  },
];

const STATS = [
  { value: "50K+",  label: "Active Riders" },
  { value: "2.1M",  label: "Safe KM Ridden" },
  { value: "8,400", label: "SOS Alerts Sent" },
  { value: "99.8%", label: "Uptime Guaranteed" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [particles] = useState(() => [...Array(12)].map((_, i) => ({
    width: `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    backgroundColor: i % 3 === 0 ? "#FF2E2E" : i % 3 === 1 ? "#FACC15" : "#22C55E",
    opacity: 0.4 + Math.random() * 0.4,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${5 + Math.random() * 5}s`,
  })));

  const [progress, setProgress] = useState(0);
  const { coords, getLocation } = useLocation();
  const { weather } = useWeather(coords);

  useEffect(() => {
    getLocation();
    
    // Animate progress percentage
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        const next = prev + Math.floor(Math.random() * 15) + 5;
        return next > 100 ? 100 : next;
      });
    }, 400);

    // Auto-hide splash after 3 seconds
    const timer = setTimeout(() => setShowSplash(false), 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [getLocation]);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
        {/* Cinematic Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF2E2E]/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF2E2E]/5 blur-[150px] rounded-full animate-pulse delay-700" />
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center max-w-lg w-full px-6">
          {/* Logo with high-end entrance */}
          <div className="relative w-48 h-48 mb-12 animate-entrance-scale">
            <div className="absolute inset-0 bg-[#FF2E2E]/20 blur-[40px] rounded-full animate-pulse" />
            <Image 
              src="/assets/images/logo.png" 
              alt="BIKEMET Logo" 
              fill 
              className="object-contain relative z-10" 
              priority 
            />
          </div>
          
          <div className="text-center space-y-6">
            <div className="space-y-1">
              <p className="text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.6em] opacity-0 animate-fade-in-up">
                System Initializing
              </p>
              <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] opacity-0 animate-fade-in-up delay-150">
                BIKE<span className="text-[#FF2E2E]">MET</span>
              </h1>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <p className="text-[#B0B0B0] text-xs font-bold uppercase tracking-[0.3em] opacity-0 animate-fade-in-up delay-300">
                Ride Safe, Ride Together..
              </p>
              
              {/* Progress Container */}
              <div className="w-full max-w-[280px] space-y-3 pt-4 opacity-0 animate-fade-in-up delay-500">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-[#555]">
                  <span className="animate-pulse">Loading Modules...</span>
                  <span>{progress}%</span>
                </div>
                <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,46,46,0.1)]">
                  <div className="absolute h-full bg-gradient-to-r from-[#FF2E2E] to-[#FF6B6B] animate-loading-bar" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Decoration Lines */}
        <div className="absolute top-10 left-10 w-20 h-px bg-white/10" />
        <div className="absolute top-10 left-10 w-px h-20 bg-white/10" />
        <div className="absolute bottom-10 right-10 w-20 h-px bg-white/10" />
        <div className="absolute bottom-10 right-10 w-px h-20 bg-white/10" />

        <style jsx>{`
          @keyframes loadingBar {
            0% { width: 0%; }
            10% { width: 20%; }
            40% { width: 35%; }
            70% { width: 85%; }
            100% { width: 100%; }
          }
          .animate-loading-bar {
            animation: loadingBar 3s cubic-bezier(0.65, 0, 0.35, 1) forwards;
          }
          @keyframes entranceScale {
            from { opacity: 0; transform: scale(1.2) translateY(20px); filter: blur(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
          }
          .animate-entrance-scale {
            animation: entranceScale 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .delay-150 { animation-delay: 0.15s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-500 { animation-delay: 0.5s; }
          .delay-700 { animation-delay: 0.7s; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-end pb-16 md:pb-24 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/hero.png"
            alt="Biker on the open road"
            fill
            className="object-cover object-center"
            priority
            onLoad={() => setHeroLoaded(true)}
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/75 to-[#0D0D0D]/20 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/60 via-transparent to-transparent z-10" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={p}
            />
          ))}
        </div>

        {/* Content Container - Boxed */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className={`max-w-3xl transition-all duration-1000 ${heroLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,46,46,0.15)] border border-[rgba(255,46,46,0.35)] rounded-full text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-widest mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E2E] animate-pulse" />
              India&apos;s #1 Biker Safety App
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tight leading-[1.05] mb-4">
              Ride Safe.<br />
              <span className="bg-gradient-to-br from-[#FF2E2E] via-[#FF6B6B] to-[#FF9B9B] bg-clip-text text-transparent">
                Ride Bold.
              </span>
            </h1>

            <p className="text-[#B0B0B0] text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              BIKEMET is your all-in-one riding companion — GPS tracking, emergency SOS, mechanic finder, and a vibrant rider community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Link href="/signup"
                className="btn btn-primary btn-lg shadow-[0_0_40px_rgba(255,46,46,0.4)] hover:shadow-[0_0_60px_rgba(255,46,46,0.6)]">
                Get Started Free
              </Link>
              <Link href="/map"
                className="btn btn-outline btn-lg group">
                <svg className="w-4 h-4 group-hover:text-[#FF2E2E] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Find Mechanic
              </Link>
            </div>

            {/* ── Live Weather Strip ── */}
            {weather && (
              <div className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl border mb-8 backdrop-blur-sm ${
                weather.isRaining
                  ? "bg-blue-500/10 border-blue-500/20"
                  : "bg-white/[0.05] border-white/10"
              }`}>
                <span className="text-xl">{weather.icon}</span>
                <span className="text-white font-black text-sm">{weather.temp}°C</span>
                <span className="text-[#B0B0B0] text-xs font-bold">{weather.condition}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${weather.isRaining ? "bg-blue-400" : "bg-emerald-400"}`}
                      style={{ width: `${weather.rainChance}%` }}
                    />
                  </div>
                  <span className={`text-[0.65rem] font-black ${weather.isRaining ? "text-blue-400" : "text-emerald-400"}`}>
                    {weather.rainChance}% rain
                  </span>
                </div>
                {weather.isRaining && (
                  <span className="text-xs font-black text-blue-300 animate-pulse ml-auto">🌧️ Raincoat advised</span>
                )}
                <span className="text-[0.65rem] text-[#555] hidden md:block ml-auto">{weather.aiTip}</span>
              </div>
            )}

            {/* Mini Stats Row */}
            <div className="flex flex-wrap gap-6">
              {STATS.slice(0, 3).map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-2xl font-black text-white leading-none">{s.value}</span>
                  <span className="text-[0.6rem] font-bold text-[#555] uppercase tracking-widest mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[0.55rem] font-black text-[#555] uppercase tracking-[0.4em]">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#555] to-transparent" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════ */}
      <section className="py-12 bg-[#111] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center group">
                <span className="text-3xl md:text-4xl font-black text-white group-hover:bg-gradient-to-br group-hover:from-[#FF2E2E] group-hover:to-[#FF6B6B] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {s.value}
                </span>
                <span className="text-[0.65rem] font-black text-[#555] uppercase tracking-widest mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[0.65rem] font-black text-[#B0B0B0] uppercase tracking-widest mb-4">
            Everything You Need
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-heading tracking-tight">
            Built for <span className="bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">Real Riders</span>
          </h2>
          <p className="text-[#B0B0B0] mt-3 max-w-md mx-auto text-sm leading-relaxed">
            Every feature is purpose-built for motorcycle and scooter riders who demand safety without compromise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Link key={f.href} href={f.href}
              className="group relative block"
              style={{ animationDelay: `${i * 80}ms` }}>
              <div
                className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{ background: f.bg }}
              />
              <div className="relative glass-card p-7 h-full flex flex-col gap-4 border-white/[0.07] group-hover:border-white/20 transition-all duration-300 group-hover:-translate-y-1">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: f.bg }}
                >
                  {f.icon}
                </div>
                {/* Text */}
                <div className="flex-1">
                  <h3 className="font-black text-white text-lg mb-2 transition-all duration-300 group-hover:!text-[var(--hover-color)]"
                      style={{ "--hover-color": f.color }}>
                    {f.title}
                  </h3>
                  <p className="text-[#B0B0B0] text-sm leading-relaxed">{f.desc}</p>
                </div>
                {/* Arrow */}
                <div className="flex items-center gap-1 text-[0.7rem] font-black uppercase tracking-widest transition-all duration-300 group-hover:gap-2"
                     style={{ color: f.color }}>
                  Explore
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="relative rounded-[2.5rem] overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF2E2E]/20 via-[#1a1a1a] to-[#1a1a1a]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,46,46,0.15),transparent_60%)]" />

          {/* Grid lines */}
          <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
            <div className="grid grid-cols-10 h-full">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="border-r border-white/30" />
              ))}
            </div>
          </div>

          <div className="relative z-10 p-10 md:p-16 text-center">
            <div className="text-5xl mb-6">🏍️</div>
            <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
              Start Riding Smarter
            </h2>
            <p className="text-[#B0B0B0] text-base max-w-md mx-auto mb-10 leading-relaxed">
              Join 50,000+ riders who trust BIKEMET to keep them safe. Free forever — with optional premium perks.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup" className="btn btn-primary btn-lg shadow-[0_0_50px_rgba(255,46,46,0.4)] hover:shadow-[0_0_70px_rgba(255,46,46,0.6)]">
                Create Free Account
              </Link>
              <Link href="/subscription" className="btn btn-outline btn-lg">
                View Premium Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
