"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext";
import { useRouter } from "next/navigation";

const COMPARISON = [
  { feature: "Emergency SOS Alert",        free: "Basic",          premium: "Priority + Family Alert" },
  { feature: "Live GPS Tracking",           free: "✗",             premium: "✓ Real-time sharing" },
  { feature: "QR Safety Sticker",           free: "Basic QR",       premium: "Medical Vault QR" },
  { feature: "Community Rides",             free: "Join only",      premium: "Create + Join" },
  { feature: "Weather AI Advice",           free: "✗",             premium: "✓ Rain alerts + tips" },
  { feature: "Store Discount",              free: "✗",             premium: "✓ 10% off all orders" },
  { feature: "Mechanic Finder",             free: "✓",             premium: "✓ Priority listings" },
  { feature: "Medical Record Vault",        free: "✗",             premium: "✓ Secure cloud storage" },
  { feature: "Ride Diary & Stats",          free: "Local only",     premium: "✓ Cloud backup" },
  { feature: "Priority SOS Response",       free: "Standard",       premium: "✓ VIP response team" },
];

function calcPrice(days) {
  if (days >= 16) return { rate: 12, label: "Vlogger Pro",   discount: 40 };
  if (days >= 8)  return { rate: 16, label: "Week Warrior",  discount: 20 };
  return                  { rate: 20, label: "Day Pass",      discount: 0  };
}

export default function SubscriptionPage() {
  const [days, setDays] = useState(1);
  const { user, isPremium } = useAuth();
  const router = useRouter();

  const { rate, label, discount } = calcPrice(days);
  const total    = days * rate;
  const original = days * 20;

  const handlePurchase = () => {
    router.push(`/checkout?type=subscription&cost=${total}&days=${days}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-4 pb-32">

      {/* ── Header ── */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 rounded-full text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.2em] mb-4">
            Flexi-Pay Safety
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight mb-3">
            ₹20 <span className="bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">Per Day</span>
          </h1>
          <p className="text-[#B0B0B0] text-sm leading-relaxed">
            World&apos;s first pay-per-day rider safety subscription. Pay only for the adventure days — cancel anytime.
          </p>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 bg-[#111] border border-white/5 rounded-2xl">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isPremium ? "bg-yellow-400/20" : "bg-[#FF2E2E]/10"}`}>
            {isPremium ? "👑" : "💎"}
          </div>
          <div>
            <div className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest">Current Status</div>
            <div className="text-sm font-black text-white">{isPremium ? "Bikemate Premium" : "Free Member"}</div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* ── Left: Calculator ── */}
        <div className="lg:col-span-5 bg-[#111] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {isPremium && (
            <div className="absolute inset-0 z-50 bg-[#111]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rounded-[2.5rem]">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-5 shadow-[0_0_50px_rgba(250,204,21,0.4)]">
                <svg className="w-10 h-10 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase">Active Premium</h3>
              <p className="text-[#B0B0B0] text-sm mb-8">All Elite features are unlocked for you.</p>
              <Link href="/dashboard" className="btn btn-outline btn-sm px-10">Back to Dashboard</Link>
            </div>
          )}

          <h4 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.3em] mb-8 text-center">Choose Duration</h4>

          {/* Day counter */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <button onClick={() => setDays(Math.max(1, days - 1))}
              className="w-14 h-14 rounded-[1.2rem] bg-white/5 flex items-center justify-center text-2xl font-bold hover:bg-[#FF2E2E] hover:text-white transition-all active:scale-90 border border-white/10">
              −
            </button>
            <div className="text-center min-w-[120px]">
              <span className="text-7xl font-black font-heading leading-none text-white">{days}</span>
              <span className="block text-[#444] font-black tracking-[0.3em] uppercase text-[0.65rem] mt-2">Day{days > 1 ? "s" : ""}</span>
            </div>
            <button onClick={() => setDays(days + 1)}
              className="w-14 h-14 rounded-[1.2rem] bg-white/5 flex items-center justify-center text-2xl font-bold hover:bg-[#FF2E2E] hover:text-white transition-all active:scale-90 border border-white/10">
              +
            </button>
          </div>

          {/* Quick select */}
          <div className="flex gap-2 mb-8 justify-center flex-wrap">
            {[1, 3, 7, 15, 30].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${days === d ? "bg-[#FF2E2E] border-[#FF2E2E] text-white" : "bg-white/[0.03] border-white/10 text-[#555] hover:border-[#FF2E2E]/30"}`}>
                {d}d
              </button>
            ))}
          </div>

          {/* Price display */}
          <div className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-6 mb-6 text-center">
            <div className="inline-block px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-[0.65rem] font-black text-yellow-400 uppercase tracking-widest mb-3">
              {label} • ₹{rate}/day{discount > 0 && ` (${discount}% off)`}
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-6xl font-black font-heading tracking-tighter text-white">₹{total}</span>
              {discount > 0 && <span className="text-2xl text-[#444] line-through font-bold mt-3">₹{original}</span>}
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[0.7rem] text-emerald-400 font-black uppercase tracking-widest">Save {discount}% with this tier</span>
              </div>
            )}
          </div>

          {/* Tier info */}
          <div className="flex gap-2 mb-6 text-[0.65rem]">
            {[{d:1, r:20, l:"Day Pass"}, {d:8, r:16, l:"Week Warrior"}, {d:16, r:12, l:"Vlogger Pro"}].map((t) => (
              <div key={t.d} className={`flex-1 p-2 rounded-xl border text-center transition-all ${days >= t.d && (t.d === 16 ? true : days < (t.d === 1 ? 8 : 16)) ? "border-[#FF2E2E]/30 bg-[#FF2E2E]/5" : "border-white/5 bg-white/[0.02]"}`}>
                <div className="font-black text-white">{t.l}</div>
                <div className="text-[#555]">₹{t.r}/day</div>
                <div className="text-[#444]">{t.d === 1 ? "1–7d" : t.d === 8 ? "8–15d" : "16d+"}</div>
              </div>
            ))}
          </div>

          <button onClick={handlePurchase}
            className="btn btn-primary btn-full py-5 rounded-2xl text-base font-black shadow-[0_20px_60px_-15px_rgba(255,46,46,0.5)]">
            🏍️ Activate Premium
          </button>
        </div>

        {/* ── Right: Comparison Table ── */}
        <div className="lg:col-span-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#FF2E2E] rounded-full" />
            <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.3em]">Free vs Premium</h3>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-0 mb-2 px-4">
            <div className="text-[0.6rem] font-black text-[#333] uppercase tracking-widest">Feature</div>
            <div className="text-[0.6rem] font-black text-[#333] uppercase tracking-widest text-center w-24 md:w-32">Free</div>
            <div className="text-[0.6rem] font-black text-[#FF2E2E] uppercase tracking-widest text-center w-24 md:w-36">Premium</div>
          </div>

          <div className="bg-[#0D0D0D] border border-white/5 rounded-3xl overflow-hidden">
            {COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-[1fr_auto_auto] gap-0 items-center px-4 py-3.5 ${i !== COMPARISON.length - 1 ? "border-b border-white/[0.05]" : ""} hover:bg-white/[0.02] transition-colors`}>
                <div className="text-sm font-bold text-[#B0B0B0] pr-4">{row.feature}</div>
                <div className="text-xs text-center text-[#555] font-bold w-24 md:w-32">
                  {row.free === "✗" ? <span className="text-[#333] text-lg">✗</span> : row.free}
                </div>
                <div className="text-xs text-center font-bold w-24 md:w-36">
                  {row.premium.startsWith("✓") ? (
                    <span className="text-emerald-400">{row.premium}</span>
                  ) : (
                    <span className="text-[#FF2E2E]">{row.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div className="mt-6 p-5 bg-gradient-to-r from-[#FF2E2E]/10 to-transparent border border-[#FF2E2E]/15 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-black text-white text-sm">Start with just 1 day — ₹20</div>
              <div className="text-xs text-[#555] mt-0.5">No lock-in. Cancel anytime.</div>
            </div>
            <button onClick={handlePurchase}
              className="btn btn-primary btn-sm px-8 shrink-0">
              Get Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
