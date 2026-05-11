"use client";

import Link from "next/link";

export default function SurvivalKit() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-4 pb-32 animate-[pageEnter_0.4s_ease_both]">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <Link href="/dashboard" className="text-white bg-white/5 hover:bg-white/10 p-2 rounded-full absolute -top-2 md:top-0 right-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-500/10 border border-neutral-500/20 rounded-full text-[0.65rem] font-black text-neutral-400 uppercase tracking-widest mb-4">
            Zero-Network PWA Cached
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-2">
            Survival <span className="bg-gradient-to-br from-neutral-400 to-neutral-200 bg-clip-text text-transparent">Kit</span>
          </h1>
          <p className="text-[#B0B0B0] text-sm">Critical medical info & offline cache available without internet signal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
         <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative">
            <h4 className="font-black text-white text-lg tracking-tight mb-1">Medical ID</h4>
            <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Locked to device</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-[#555]">Blood Group</span>
                <span className="text-xs font-black text-[#FF2E2E]">O+ Positive</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-[#555]">Emergency Contact 1</span>
                <span className="text-xs font-black text-white">+91 9876543210</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-[#555]">Allergies</span>
                <span className="text-xs font-black text-white">Penicillin</span>
              </div>
            </div>
         </div>

         <div className="bg-[#111] border border-white/5 rounded-3xl p-6 relative">
            <h4 className="font-black text-white text-lg tracking-tight mb-1">Machine Vault</h4>
            <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Offline Insurance Docs</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-[#555]">Registration</span>
                <span className="text-xs font-black text-white">MH-02-AB-1234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-[#555]">Insurance Policy</span>
                <span className="text-xs font-black text-white">POL98127391</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-[#555]">Cache Status</span>
                <span className="text-xs font-black text-emerald-400 gap-1 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" /> Secure
                </span>
              </div>
            </div>
         </div>
      </div>

      <div className="bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 p-6 rounded-3xl text-center">
         <span className="text-3xl mb-2 block animate-pulse">🚁</span>
         <h3 className="font-black text-white text-lg tracking-tight mb-2">Offline Dispatch Protocol</h3>
         <p className="text-xs text-[#B0B0B0] max-w-sm mx-auto leading-relaxed">
           Even if you are outside 4G/5G coverage, dialing generic SOS defaults directly to your device local satellite mesh or carrier fallback. Do not panic.
         </p>
      </div>
    </div>
  );
}
