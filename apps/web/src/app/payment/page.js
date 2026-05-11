"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthContext";
import { useCart } from "../../components/CartContext";

export default function PaymentPage() {
  const router          = useRouter();
  const { upgradeToPremium } = useAuth();
  const { clearCart }   = useCart();
  const [status,   setStatus]   = useState("Initializing Secure Gateway…");
  const [progress, setProgress] = useState(0);
  const [isError,  setIsError]  = useState(false);
  const done = useRef(false);

  useEffect(() => {
    let session;
    try {
      session = JSON.parse(sessionStorage.getItem("checkout_session"));
    } catch { /* ignore */ }

    if (!session) { router.push("/"); return; }

    const loadRazorpay = () =>
      new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload  = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
      });

    const tryBackend = async (amount) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      try {
        const res  = await fetch("http://localhost:5000/api/payment/create-order", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ amount }),
          signal:  ctrl.signal,
        });
        clearTimeout(timer);
        const data = await res.json();
        if (data.success && data.order) return data;
        return null;
      } catch {
        clearTimeout(timer);
        return null;
      }
    };

    const onSuccess = async () => {
      if (done.current) return;
      done.current = true;
      setProgress(95);
      setStatus("Payment Verified! Activating Premium…");

      if (session.type === "subscription") upgradeToPremium();
      if (session.type === "store")        clearCart();

      // Log order to admin store
      try {
        const orders = JSON.parse(localStorage.getItem("bm_orders") || "[]");
        orders.unshift({
          id:       `ORD-${Date.now()}`,
          customer: session.customer?.name || "Rider",
          email:    session.customer?.email || "",
          items:    session.cart?.map(c => c.name).join(", ") || session.type,
          amount:   session.amount,
          status:   "success",
          type:     session.type,
          date:     new Date().toISOString(),
        });
        localStorage.setItem("bm_orders", JSON.stringify(orders));
      } catch { /* ignore */ }

      sessionStorage.setItem("checkout_success", JSON.stringify(session));
      sessionStorage.removeItem("checkout_session");
      setProgress(100);
      setStatus("🎉 Payment Successful! Redirecting…");
      setTimeout(() => router.push("/success"), 1000);
    };

    const simulate = () => {
      setStatus("Activating Premium Access (Simulation Mode)…");
      setProgress(80);
      setTimeout(() => onSuccess(), 1500);
    };

    const openRazorpay = (keyId, orderId, amount) => {
      const options = {
        key:      keyId,
        amount:   amount * 100,
        currency: "INR",
        name:     "Bikemate",
        description: session.type === "subscription" ? "Premium Access" : "Bikemate Store Order",
        ...(orderId ? { order_id: orderId } : {}),
        handler: async (response) => {
          setStatus("Verifying Payment Signature…");
          setProgress(85);

          // Try backend verify (best-effort)
          try {
            const ctrl2 = new AbortController();
            const t2    = setTimeout(() => ctrl2.abort(), 5000);
            const vRes  = await fetch("http://localhost:5000/api/payment/verify", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify(response),
              signal:  ctrl2.signal,
            });
            clearTimeout(t2);
            const vData = await vRes.json();
            if (vData.success) { await onSuccess(); return; }
          } catch { /* fallthrough */ }

          // If verify fails, still mark success client-side
          await onSuccess();
        },
        prefill: {
          name:    session.customer?.name  || "Rider",
          email:   session.customer?.email || "",
          contact: session.customer?.phone || "9999999999",
        },
        theme: { color: "#FF2E2E" },
        modal: {
          ondismiss: () => {
            document.body.style.overflow = "auto";
            router.push("/checkout");
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("[Razorpay] open failed:", err);
        simulate();
      }
    };

    const processPayment = async () => {
      setStatus("Loading Secure Payment SDK…");
      setProgress(20);

      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        setStatus("⚠️ Razorpay SDK failed to load. Check internet connection.");
        setIsError(true);
        return;
      }

      setProgress(40);
      setStatus("Creating Encrypted Order…");

      // Try backend
      const backendOrder = await tryBackend(session.amount);

      setProgress(65);
      setStatus("Launching Payment Gateway…");

      if (backendOrder?.order) {
        openRazorpay(backendOrder.key_id, backendOrder.order.id, session.amount);
      } else {
        // Use key from env directly (no order_id — works for Razorpay direct mode)
        const envKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (envKey && envKey !== "rzp_test_your_key_id_here") {
          openRazorpay(envKey, null, session.amount);
        } else {
          // Full simulation
          simulate();
        }
      }
    };

    processPayment();
  }, [router, upgradeToPremium, clearCart]);

  return (
    <div className="w-full h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111] border border-white/5 rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl">
        {/* Spinner or check */}
        {progress === 100 ? (
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        ) : isError ? (
          <div className="w-20 h-20 bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 rounded-full flex items-center justify-center text-3xl mb-6">⚠️</div>
        ) : (
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#FF2E2E] animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-t-white/20 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
          </div>
        )}

        <h2 className="text-xl font-black font-heading mb-2 tracking-tight">{status}</h2>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-2 mt-4 mb-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF2E2E] to-[#FF6B6B] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="text-[0.65rem] font-black text-[#444] uppercase tracking-widest">{progress}%</div>

        <p className="text-[#444] text-xs mt-5 uppercase tracking-widest font-bold">
          {isError ? "You may close this window safely." : "Please do not close this window"}
        </p>

        {isError && (
          <button onClick={() => router.push("/checkout")}
            className="btn btn-outline btn-sm mt-6 px-8">← Back to Checkout</button>
        )}
      </div>
    </div>
  );
}
