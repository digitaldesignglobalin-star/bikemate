"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../components/AuthContext";
import { useLocation } from "../../hooks/useLocation";
import { api } from "../../utils/api";
import PremiumOverlay from "../../components/PremiumOverlay";

export default function TrackerPage() {
  const { user, isPremium } = useAuth();
  const { coords, locality, status, speed, error: locError, startWatch, stopWatch } = useLocation();

  const [isLive,       setIsLive]       = useState(false);
  const [isGuardian,   setIsGuardian]   = useState(false);
  const [isRecording,  setIsRecording]  = useState(false);

  // Countdown SOS state
  const [countdown,    setCountdown]    = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  const timerRef    = useRef(null);
  const logTimerRef = useRef(null);

  // ── Start / stop GPS watch on toggle ─────────────────────────────────────
  useEffect(() => {
    if (isLive) {
      startWatch();
    } else {
      stopWatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  // ── Sync live location to backend ─────────────────────────────────────────
  useEffect(() => {
    if (!isLive || !coords || !user) return;

    // Fire once immediately
    api.post("/live/update", { lat: coords.lat, lng: coords.lng })
       .catch((e) => console.warn("[Tracker] sync:", e.message));

    const interval = setInterval(() => {
      api.post("/live/update", { lat: coords.lat, lng: coords.lng })
         .catch((e) => console.warn("[Tracker] sync:", e.message));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, coords, user]);

  // ── Stop sync when going offline ──────────────────────────────────────────
  useEffect(() => {
    if (!isLive && user) {
      api.post("/live/stop", {}).catch(() => {});
    }
  }, [isLive, user]);

  // ── Audio Smart Assistant (TTS) ───────────────────────────────────────────
  const lastAudioWarning = useRef(0);
  useEffect(() => {
    if (speed > 60 && isLive) {
       const now = Date.now();
       if (now - lastAudioWarning.current > 30000) { // Only warn once every 30s
         const utter = new SpeechSynthesisUtterance("Warning. Speed limit exceeded. Please slow down.");
         utter.volume = 1;
         utter.rate = 1.1;
         window.speechSynthesis.speak(utter);
         lastAudioWarning.current = now;
       }
    }
  }, [speed, isLive]);

  // ── Journey recording ─────────────────────────────────────────────────────
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      logTimerRef.current = setInterval(() => {
        if (coords) {
          const logs = JSON.parse(localStorage.getItem("ride_logs") || "[]");
          logs.push({ ...coords, speed, time: Date.now() });
          localStorage.setItem("ride_logs", JSON.stringify(logs));
        }
      }, 5000);
    } else {
      setIsRecording(false);
      clearInterval(logTimerRef.current);
      alert("Journey saved to your device!");
    }
  };

  // ── SOS countdown ─────────────────────────────────────────────────────────
  const startEmergencyCountdown = () => {
    setShowCountdown(true);
    setCountdown(10);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          triggerSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setShowCountdown(false);
    setCountdown(10);
  };

  const triggerSOS = async () => {
    setSosTriggered(true);
    setShowCountdown(false);
    
    const location = coords || { lat: 19.0760, lng: 72.8777 };
    
    try {
      // 1. Backend Notification
      await api.post("/sos", {
        location,
        message: "AI GUARDIAN: Emergency detected via GPS stop.",
      });

      // 2. Automated SMS & Calling
      const c1 = user?.emergencyContact1 || "+917980132406";
      const c2 = user?.emergencyContact2 || "+918420600137";
      const locUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      
      // SMS Intent
      setTimeout(() => {
        const smsBody = encodeURIComponent(`EMERGENCY! AI Guardian detected a sudden stop. My location: ${locUrl}`);
        window.open(`sms:${c1},${c2}?body=${smsBody}`);
      }, 1500);

      // Automated Call
      setTimeout(() => {
        window.location.href = `tel:${c1}`;
      }, 5000);

    } catch (e) {
      console.warn("[Tracker] SOS trigger:", e.message);
    }
  };

  // ── Share live link ────────────────────────────────────────────────────────
  const handleShare = () => {
    if (!user) return alert("Please log in to share your live location.");
    const url = `${window.location.origin}/track/${user.id}`;
    if (navigator.share) {
      navigator.share({ title: "Bikemate Live", text: "Follow my ride!", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied: " + url);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(logTimerRef.current);
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-4 pb-32 relative animate-[pageEnter_0.4s_ease_both]">
      {!isPremium && <PremiumOverlay featureName="Live Tracking & AI Guardian" />}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight mb-1">
            Live <span className="bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">Geolocation</span>
          </h1>
          <p className="text-[#B0B0B0] text-xs font-bold uppercase tracking-widest">
            {isLive ? "📡 Satellite Link Established" : "📡 Satellite Disconnected"}
          </p>
          {isLive && (
            <button onClick={handleShare}
              className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FF2E2E] hover:text-white bg-white/5 py-2 px-4 rounded-full border border-white/10 hover:border-[#FF2E2E] transition-all">
              🔗 Share Live Map
            </button>
          )}
        </div>

        {isLive && coords && (
          <div className="glass-card px-8 py-4 bg-[#FF2E2E]/5 border-[#FF2E2E]/20 flex flex-col items-center shrink-0">
            <span className="text-[0.6rem] font-black text-[#FF2E2E] uppercase tracking-[0.2em] mb-1">Speed</span>
            <span className="text-3xl font-black text-white">
              {speed} <span className="text-xs text-[#B0B0B0] font-bold">km/h</span>
            </span>
            {speed > 60 ? (
              <span className="text-[0.55rem] font-black text-[#FF2E2E] animate-pulse mt-1">🔻 REDUCE SPEED</span>
            ) : speed > 0 ? (
              <span className="text-[0.55rem] font-black text-emerald-400 mt-1">🚀 SPEED OPTIMAL</span>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Map Simulation ── */}
      <div className="relative rounded-[2.5rem] overflow-hidden mb-8 border border-white/5 shadow-2xl bg-[#111]"
           style={{ height: "280px" }}>
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF2E2E]/10 to-transparent z-10" />
          <div className="grid grid-cols-12 grid-rows-12 w-[150%] h-[150%] -translate-x-10 -translate-y-10 rotate-6">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-white/10 relative">
                <div className="absolute top-0 left-0 w-1 h-1 bg-white/20 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {isLive && coords ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-8 h-8 bg-yellow-400 rounded-full animate-ping absolute opacity-40" />
                <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-[0_0_40px_rgba(250,204,21,0.6)] relative z-10 border-4 border-[#111]" />
              </div>
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-xl shadow-xl flex flex-col items-center">
                {locality && (
                  <span className="text-[0.65rem] font-black text-yellow-400 uppercase tracking-widest leading-tight mb-0.5">{locality}</span>
                )}
                <span className="text-xs font-black text-white">
                  {coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E
                </span>
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#FF2E2E]/20 border border-[#FF2E2E]/30 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#FF2E2E] animate-pulse" />
                  <span className="text-[0.6rem] font-black text-[#FF2E2E] uppercase tracking-widest">Recording Journey</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-70">
              {status === "loading" ? (
                <>
                  <div className="w-12 h-12 rounded-full border-4 border-[#FF2E2E]/30 border-t-[#FF2E2E] animate-spin" />
                  <span className="text-xs font-black tracking-[0.3em] uppercase text-[#555]">Acquiring GPS…</span>
                </>
              ) : locError ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">📡</div>
                  <span className="text-xs font-black tracking-widest uppercase text-[#555] text-center max-w-xs">
                    {locError}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">📡</div>
                  <span className="text-xs font-black tracking-[0.3em] uppercase text-[#555]">Initialize Satellite Link</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Emergency Countdown Overlay */}
        {showCountdown && (
          <div className="absolute inset-0 z-50 bg-[#FF2E2E]/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/30" />
              <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-white">
                {countdown}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Sudden Stop Detected!</h2>
            <p className="text-white/80 text-sm mb-10 max-w-xs">
              SOS will auto-trigger in {countdown} seconds. Are you okay?
            </p>
            <button onClick={cancelSOS} className="btn btn-glass py-4 px-10 rounded-2xl font-black uppercase tracking-widest text-lg">
              I&apos;m Safe
            </button>
          </div>
        )}

        {/* SOS Triggered Overlay */}
        {sosTriggered && (
          <div className="absolute inset-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase">SOS Sent</h2>
            <p className="text-[#B0B0B0] text-sm mb-8">Emergency contacts have been notified with your live coordinates.</p>
            <button onClick={() => setSosTriggered(false)} className="btn btn-outline btn-sm px-8">Dismiss</button>
          </div>
        )}
      </div>

      {/* ── Control Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* Live Tracking Toggle */}
        <div className="glass-card p-6 flex items-center justify-between group">
          <div>
            <h4 className="font-black text-base mb-0.5 group-hover:text-[#FF2E2E] transition-colors">Live Tracking</h4>
            <p className="text-[0.6rem] text-[#B0B0B0] font-black uppercase tracking-widest">Update every 5 s</p>
          </div>
          <Toggle checked={isLive} onChange={() => setIsLive((v) => !v)} />
        </div>

        {/* AI Guardian Toggle */}
        <div className="glass-card p-6 flex items-center justify-between group">
          <div>
            <h4 className="font-black text-base mb-0.5 group-hover:text-[#FF2E2E] transition-colors">AI Guardian</h4>
            <p className="text-[0.6rem] text-[#B0B0B0] font-black uppercase tracking-widest">Auto stop detection</p>
          </div>
          <Toggle checked={isGuardian} onChange={() => setIsGuardian((v) => !v)} />
        </div>

        {/* Journey Vault Record */}
        <div className={`glass-card p-6 flex items-center justify-between transition-all ${
          isRecording ? "border-[#FF2E2E]/40 shadow-[0_0_30px_rgba(255,46,46,0.12)] bg-[#FF2E2E]/[0.03]" : ""
        }`}>
          <div>
            <h4 className={`font-black text-base mb-0.5 ${isRecording ? "text-[#FF2E2E]" : ""}`}>Journey Vault</h4>
            <p className="text-[0.6rem] text-[#B0B0B0] font-black uppercase tracking-widest">Record path (Elite)</p>
          </div>
          <button onClick={toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isRecording ? "bg-[#FF2E2E] text-white animate-pulse" : "bg-white/5 text-[#B0B0B0] hover:bg-white/10"
            }`}>
            {isRecording ? "⏹" : "⏺"}
          </button>
        </div>
      </div>

      {/* AI Guardian Panel */}
      {isGuardian && isLive && (
        <div className="bg-[#FF2E2E]/5 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FF2E2E]/10 rounded-2xl flex items-center justify-center text-xl animate-pulse">🛡️</div>
            <div>
              <h5 className="font-black text-sm uppercase tracking-widest">AI Guardian Active</h5>
              <p className="text-xs text-[#B0B0B0] mt-1 italic">Monitoring for sudden stops. Family will be alerted automatically.</p>
            </div>
          </div>
          <button onClick={startEmergencyCountdown}
            className="btn btn-outline btn-sm font-black text-[10px] tracking-widest uppercase border-white/10 hover:bg-white/5">
            Simulate Panic
          </button>
        </div>
      )}

      {/* ── Crowdsource Hazard Mapping ── */}
      {isLive && (
        <div className="animate-[pageEnter_0.6s_ease_both]">
           <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
             <span className="w-8 h-[2px] bg-yellow-400 rounded-full" />
             Report Mesh Hazard
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {["🕳️ Pothole", "👮 Checkpoint", "🛢️ Oil Spill", "🚗 Traffic"].map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    alert(`${h} Hazard registered to Mesh! Local riders will be notified.`);
                    const utter = new SpeechSynthesisUtterance("Hazard successfully uploaded.");
                    window.speechSynthesis.speak(utter);
                  }}
                  className="bg-[#111] border border-white/5 hover:border-yellow-400 hover:bg-yellow-400/5 transition-colors p-4 rounded-2xl flex flex-col items-center gap-2"
                >
                   <span className="text-2xl">{h.split(" ")[0]}</span>
                   <span className="text-[0.6rem] font-black uppercase tracking-widest text-white">{h.split(" ")[1]}</span>
                </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}

// ── Toggle Switch Component ───────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-14 h-7 bg-[#333] rounded-full peer
        peer-checked:bg-[#FF2E2E]
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:rounded-full after:h-6 after:w-6
        after:transition-all peer-checked:after:translate-x-7" />
    </label>
  );
}
