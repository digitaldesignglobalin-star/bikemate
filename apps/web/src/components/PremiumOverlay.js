"use client";

import Link from "next/link";

export default function PremiumOverlay({ featureName }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-bh-bg/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 animate-page-enter">
      <div className="max-w-xs text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-bh-primary/10 flex items-center justify-center text-bh-primary text-2xl mb-6 shadow-glow-red/20">
          💎
        </div>
        <h3 className="text-xl font-black font-heading tracking-tight mb-2">
          {featureName || "Premium Feature"}
        </h3>
        <p className="text-bh-gray text-sm mb-8 leading-relaxed">
          This feature is exclusive to Bikemate Premium members. Join the elite brotherhood today!
        </p>
        <Link 
          href="/subscription" 
          className="btn btn-primary btn-full py-4 rounded-xl shadow-glow-red font-black uppercase tracking-widest text-[0.7rem]"
        >
          Upgrade for ₹30/day
        </Link>
      </div>
    </div>
  );
}
