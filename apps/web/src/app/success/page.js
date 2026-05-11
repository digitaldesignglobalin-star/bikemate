"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [session, setSession] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(sessionStorage.getItem("checkout_success"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!session) {
      router.push("/");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, session]);

  useEffect(() => {
    if (countdown === 0 && session) {
      if (session.type === 'subscription') {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [countdown, session, router]);

  if (!session) return null;

  return (
    <div className="animate-page-enter w-full h-[80vh] flex flex-col items-center justify-center p-4">
       <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(34,197,94,0.3)] mb-8 animate-bounce">
         ✓
       </div>
       
       <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4 text-center">
         {session.type === 'subscription' ? 'Welcome to Brotherhood' : 'Order Confirmed!'}
       </h1>
       
       <p className="text-bh-gray text-center max-w-md mb-8">
         {session.type === 'subscription' 
           ? 'Your premium access is now fully active. Enjoy exclusive rides, advanced features, and priority limits.'
           : `Your order for ₹${session.amount} has been securely processed. A confirmation receipt has been sent to your email.`}
       </p>
       
       <div className="glass-card p-6 border-white/5 bg-white/[0.02] flex items-center gap-6 mb-12">
          <div className="text-4xl">📧</div>
          <div className="text-left text-sm">
             <div className="font-bold mb-1">Receipt Sent</div>
             <div className="text-bh-gray text-xs">A copy of the invoice has been dispatched to <span className="text-white">{session.customer?.email}</span> and our administrators.</div>
          </div>
       </div>

       <div className="text-[10px] font-black tracking-[0.2em] uppercase text-bh-gray-dark border border-white/10 px-6 py-2 rounded-full">
         Auto-Redirecting in {countdown}s...
       </div>
    </div>
  );
}
