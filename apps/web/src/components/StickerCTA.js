"use client";

import Link from "next/link";

/**
 * QR Safety Sticker CTA Banner
 * Drop into any page to promote the physical sticker pack.
 * Variants: "banner" (full-width) | "compact" (inline card) | "floating" (sticky bottom)
 */
export default function StickerCTA({ variant = "banner" }) {
  if (variant === "compact") {
    return (
      <Link href="/sticker" className="group block">
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#FF2E2E]/10 to-transparent border border-[#FF2E2E]/15 rounded-2xl hover:border-[#FF2E2E]/30 transition-all">
          <div className="w-10 h-10 bg-[#FF2E2E]/10 rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">🏷️</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate">QR Safety Sticker</p>
            <p className="text-[0.6rem] text-[#888] font-bold uppercase tracking-widest">₹429 · Free Delivery</p>
          </div>
          <svg className="w-4 h-4 text-[#FF2E2E] shrink-0 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </Link>
    );
  }

  if (variant === "floating") {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 animate-[slideUp_0.5s_ease_both]">
        <Link href="/sticker" className="group block">
          <div className="flex items-center gap-4 p-4 bg-[#111]/95 backdrop-blur-xl border border-[#FF2E2E]/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:border-[#FF2E2E]/40 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF2E2E] to-[#CC0000] rounded-xl flex items-center justify-center text-xl shrink-0 shadow-[0_0_20px_rgba(255,46,46,0.3)]">🏷️</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">Get Your QR Sticker</p>
              <p className="text-[0.6rem] text-[#888] font-bold uppercase tracking-widest">2 Stickers + Gift Box · ₹429</p>
            </div>
            <div className="w-8 h-8 bg-[#FF2E2E] rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </Link>
        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Default: banner
  return (
    <Link href="/sticker" className="group block">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FF2E2E]/10 via-[#FF2E2E]/5 to-transparent border border-[#FF2E2E]/15 rounded-3xl p-6 md:p-8 hover:border-[#FF2E2E]/30 transition-all">
        <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none text-[8rem] leading-none">🏷️</div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF2E2E] to-[#CC0000] rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-[0_0_30px_rgba(255,46,46,0.2)] group-hover:scale-110 transition-transform">🏷️</div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-white mb-1 tracking-tight">Protect Every Ride with a QR Safety Sticker</h3>
            <p className="text-xs text-[#888] leading-relaxed">Scannable by anyone — no app needed. Your emergency info reaches first responders instantly.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-2xl font-black text-white">₹429</span>
            <div className="btn btn-primary px-6 py-3 text-xs font-black uppercase tracking-widest shadow-glow-red group-hover:scale-105 transition-transform">
              Order Now
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
