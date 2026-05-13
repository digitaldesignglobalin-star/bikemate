"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthContext";
import PremiumOverlay from "../../components/PremiumOverlay";
import StickerCTA from "../../components/StickerCTA";
import { useLocation } from "../../hooks/useLocation";
import { useWeather } from "../../hooks/useWeather";

// ── Disclaimer text ───────────────────────────────────────────────────────────
const DISCLAIMER = `By participating in this ride, I acknowledge that Bikemate is a technology platform and is NOT responsible for any accidents, injuries, property damage, or any other incidents that may occur during the ride. I voluntarily choose to participate and assume all personal risk. Bikemate does not organize, supervise, or manage this ride in any way. All riders must comply with local traffic laws and wear proper safety gear.`;

// ── Static seed rides (first load) ───────────────────────────────────────────
const SEED_RIDES = [
  {
    id: "seed-1",
    title: "Weekend Lonavala Run",
    date: "Sun, 27 Apr",
    start: "Mumbai",
    end: "Lonavala",
    time: "6:00 AM",
    cost: "₹500/head",
    creator: { name: "Arjun M.", bio: "Tourer & adventure rider. 10+ years on the saddle.", instagram: "arjunrides", twitter: "", facebook: "" },
    joiners: [],
    createdAt: Date.now() - 86400000,
  },
  {
    id: "seed-2",
    title: "Midnight City Cruise",
    date: "Sat, 26 Apr",
    start: "Bandra",
    end: "Colaba",
    time: "11:30 PM",
    cost: "Free",
    creator: { name: "Priya S.", bio: "City rider. Street photography + bikes.", instagram: "priyaonwheels", twitter: "priyarides", facebook: "" },
    joiners: [],
    createdAt: Date.now() - 43200000,
  },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { coords, getLocation } = useLocation();
  const { weather } = useWeather(coords);

  const [rides, setRides] = useState(() => {
    if (typeof window === "undefined") return SEED_RIDES;
    const saved = (() => { try { return JSON.parse(localStorage.getItem("bm_rides") || "null"); } catch { return null; } })();
    return saved ?? SEED_RIDES;
  });

  const [modal, setModal]         = useState(null); // 'create' | 'join'
  const [step, setStep]           = useState(1);
  const [selectedRide, setSelectedRide] = useState(null);
  const [expandedRide, setExpandedRide] = useState(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: "", start: "", end: "", date: "", time: "", cost: "",
    bio: "", instagram: "", twitter: "", facebook: "",
    disclaimer: false,
  });

  // Join form state
  const [joinForm, setJoinForm] = useState({
    bio: "", instagram: "", twitter: "", facebook: "",
    disclaimer: false,
  });
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const saveRides = (updated) => {
    setRides(updated);
    localStorage.setItem("bm_rides", JSON.stringify(updated));
  };

  const openCreate = () => { setCreateForm({ title:"",start:"",end:"",date:"",time:"",cost:"",bio:"",instagram:"",twitter:"",facebook:"",disclaimer:false }); setStep(1); setModal("create"); };
  const openJoin   = (ride) => { setJoinForm({ bio:"",instagram:"",twitter:"",facebook:"",disclaimer:false }); setSelectedRide(ride); setStep(1); setModal("join"); };
  const closeModal = () => { setModal(null); setStep(1); };

  const handleCreateStep1 = (e) => { e.preventDefault(); setStep(2); };
  const handleCreateStep2 = (e) => { e.preventDefault(); setStep(3); };
  const handlePublishRide = () => {
    if (!createForm.disclaimer) return;
    const newRide = {
      id: `ride-${Date.now()}`,
      title: createForm.title,
      date: createForm.date,
      start: createForm.start,
      end: createForm.end,
      time: createForm.time,
      cost: createForm.cost || "Split",
      creator: {
        name: user?.name || "You",
        bio: createForm.bio,
        instagram: createForm.instagram,
        twitter: createForm.twitter,
        facebook: createForm.facebook,
      },
      joiners: [],
      createdAt: Date.now(),
    };
    saveRides([newRide, ...rides]);
    closeModal();
  };

  const handleJoinStep2 = (e) => { e.preventDefault(); setStep(2); };
  const handleConfirmJoin = () => {
    if (!joinForm.disclaimer) return;
    const joiner = { name: user?.name || "Anonymous", ...joinForm };
    const updated = rides.map(r =>
      r.id === selectedRide.id
        ? { ...r, joiners: [...(r.joiners || []), joiner] }
        : r
    );
    saveRides(updated);
    closeModal();
  };

  const isMyRide = (ride) => ride.creator?.name === (user?.name || "You");

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-7xl mx-auto mt-6 px-4 pb-32 relative">

      {/* ── Header ── */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight">
            Rider <span className="bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">Rides</span>
          </h1>
          <p className="text-[#B0B0B0] text-sm mt-2">
            Plan group rides, share details, ride safe together.
          </p>
        </div>
        {weather && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-sm">
            <span className="text-xl">{weather.icon}</span>
            <span className="font-black text-white">{weather.temp}°C</span>
            <span className="text-[#555] text-xs font-bold">{weather.condition}</span>
            {weather.isRaining && <span className="ml-1 text-xs font-black text-blue-400 animate-pulse">🌧️ Rain</span>}
          </div>
        )}
      </div>

      {/* ── AI weather tip banner ── */}
      {weather?.isRaining && (
        <div className="mb-8 px-5 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-bold text-blue-300">{weather.aiTip}</p>
        </div>
      )}

      {/* ── Rides Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rides.map((ride) => (
          <div key={ride.id} className="group relative">
            <div className="absolute inset-0 bg-[#FF2E2E]/0 group-hover:bg-[#FF2E2E]/5 rounded-[2rem] blur-2xl transition-all duration-700" />
            <div className="relative bg-[#111] border border-white/[0.07] group-hover:border-[#FF2E2E]/20 rounded-[2rem] p-6 transition-all">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-[0.6rem] font-black text-[#FF2E2E] uppercase tracking-[0.3em] mb-1">{ride.date} • {ride.time}</div>
                  <h3 className="text-xl font-black font-heading tracking-tight">{ride.title}</h3>
                  <div className="text-[0.65rem] text-[#555] font-bold mt-0.5 uppercase tracking-widest">
                    Created by {ride.creator?.name || "Rider"}
                  </div>
                </div>
                <div className="text-xs font-black text-[#FF2E2E] bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 px-3 py-1.5 rounded-full shrink-0">
                  {ride.cost}
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-4 mb-5 py-3 px-4 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="text-center">
                  <div className="text-[0.55rem] font-black text-[#444] uppercase tracking-widest">From</div>
                  <div className="text-sm font-black text-white">{ride.start}</div>
                </div>
                <div className="flex-1 relative flex items-center justify-center">
                  <div className="h-px w-full bg-white/[0.06]" />
                  <div className="absolute w-6 h-6 bg-[#FF2E2E]/10 border border-[#FF2E2E]/30 rounded-full flex items-center justify-center text-xs">🏍</div>
                </div>
                <div className="text-center">
                  <div className="text-[0.55rem] font-black text-[#444] uppercase tracking-widest">To</div>
                  <div className="text-sm font-black text-white">{ride.end}</div>
                </div>
              </div>

              {/* Creator bio snippet */}
              {ride.creator?.bio && (
                <div className="mb-4 text-[0.7rem] text-[#555] italic leading-relaxed line-clamp-2">
                  &quot;{ride.creator.bio}&quot;
                </div>
              )}

              {/* Creator socials */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {ride.creator?.instagram && (
                  <a href={`https://instagram.com/${ride.creator.instagram}`} target="_blank" rel="noreferrer"
                    className="text-[0.6rem] font-black text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
                    📸 @{ride.creator.instagram}
                  </a>
                )}
                {ride.creator?.twitter && (
                  <a href={`https://twitter.com/${ride.creator.twitter}`} target="_blank" rel="noreferrer"
                    className="text-[0.6rem] font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                    🐦 @{ride.creator.twitter}
                  </a>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-[0.6rem] text-[#444] font-bold uppercase tracking-widest">
                  {(ride.joiners?.length || 0)} rider{(ride.joiners?.length || 0) !== 1 ? "s" : ""} joined
                </div>
                <div className="flex gap-2">
                  {isMyRide(ride) ? (
                    <button
                      onClick={() => setExpandedRide(expandedRide === ride.id ? null : ride.id)}
                      className="btn btn-glass px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl"
                    >
                      {expandedRide === ride.id ? "Close" : "👥 View Joiners"}
                    </button>
                  ) : (
                    <button
                      onClick={() => openJoin(ride)}
                      className="btn btn-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl"
                    >
                      Join Ride
                    </button>
                  )}
                </div>
              </div>

              {/* Joiners Panel (My Rides only) */}
              {isMyRide(ride) && expandedRide === ride.id && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  {(ride.joiners?.length || 0) === 0 ? (
                    <p className="text-xs text-[#444] text-center py-2 font-bold">No joiners yet</p>
                  ) : (
                    ride.joiners.map((j, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-black text-white">{j.name}</div>
                          <div className="flex gap-1.5">
                            {j.instagram && (
                              <a href={`https://instagram.com/${j.instagram}`} target="_blank" rel="noreferrer"
                                className="text-[0.55rem] font-black text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">@{j.instagram}</a>
                            )}
                            {j.twitter && (
                              <a href={`https://twitter.com/${j.twitter}`} target="_blank" rel="noreferrer"
                                className="text-[0.55rem] font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">@{j.twitter}</a>
                            )}
                          </div>
                        </div>
                        <p className="text-[0.65rem] text-[#555] italic">{j.bio || "—"}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── FAB Create ── */}
      <button onClick={openCreate}
        className="fixed bottom-24 right-6 md:right-12 w-14 h-14 bg-[#FF2E2E] rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(255,46,46,0.45)] hover:scale-110 active:scale-90 transition-all z-[90]">
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      {/* ══════════════════════════════════════
          MODAL
      ══════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111] z-10">
              <div>
                <h2 className="text-lg font-black font-heading">
                  {modal === "create" ? "Create New Ride" : `Join: ${selectedRide?.title}`}
                </h2>
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s <= step ? "bg-[#FF2E2E] w-8" : "bg-white/10 w-4"}`} />
                  ))}
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white hover:text-black transition-all text-sm">✕</button>
            </div>

            <div className="p-6">
              {/* ───── CREATE STEPS ───── */}
              {modal === "create" && step === 1 && (
                <form onSubmit={handleCreateStep1} className="space-y-4">
                  <div className="text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.3em] mb-4">Step 1 — Ride Details</div>
                  <input required value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})}
                    placeholder="Ride Title (e.g. Coorg Weekend Run)" className="input-field w-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <input required value={createForm.start} onChange={e => setCreateForm({...createForm, start: e.target.value})}
                      placeholder="Start City" className="input-field w-full" />
                    <input required value={createForm.end} onChange={e => setCreateForm({...createForm, end: e.target.value})}
                      placeholder="Destination" className="input-field w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="date" value={createForm.date} onChange={e => setCreateForm({...createForm, date: e.target.value})}
                      className="input-field w-full" />
                    <input required type="time" value={createForm.time} onChange={e => setCreateForm({...createForm, time: e.target.value})}
                      className="input-field w-full" />
                  </div>
                  <input value={createForm.cost} onChange={e => setCreateForm({...createForm, cost: e.target.value})}
                    placeholder="Cost per rider (e.g. ₹500/head or Free)" className="input-field w-full" />
                  <button type="submit" className="btn btn-primary btn-full mt-2">Next: Your Profile →</button>
                </form>
              )}

              {modal === "create" && step === 2 && (
                <form onSubmit={handleCreateStep2} className="space-y-4">
                  <div className="text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.3em] mb-4">Step 2 — Rider Profile</div>
                  <p className="text-xs text-[#555] mb-4">Joiners will see this info before requesting. Be honest and build trust.</p>
                  <textarea required value={createForm.bio} onChange={e => setCreateForm({...createForm, bio: e.target.value})}
                    placeholder="Short bio — riding experience, bike, style..." rows={3}
                    className="input-field w-full resize-none" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400 text-lg">📸</span>
                      <input value={createForm.instagram} onChange={e => setCreateForm({...createForm, instagram: e.target.value})}
                        placeholder="Instagram username (without @)" className="input-field flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sky-400 text-lg">🐦</span>
                      <input value={createForm.twitter} onChange={e => setCreateForm({...createForm, twitter: e.target.value})}
                        placeholder="Twitter / X username (without @)" className="input-field flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-lg">📘</span>
                      <input value={createForm.facebook} onChange={e => setCreateForm({...createForm, facebook: e.target.value})}
                        placeholder="Facebook profile URL" className="input-field flex-1" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn btn-glass flex-1">← Back</button>
                    <button type="submit" className="btn btn-primary flex-1">Next: Disclaimer →</button>
                  </div>
                </form>
              )}

              {modal === "create" && step === 3 && (
                <div className="space-y-5">
                  <div className="text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.3em] mb-4">Step 3 — Disclaimer</div>
                  <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 text-xs text-[#666] leading-relaxed max-h-40 overflow-y-auto">
                    {DISCLAIMER}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={createForm.disclaimer}
                      onChange={e => setCreateForm({...createForm, disclaimer: e.target.checked})}
                      className="mt-0.5 w-4 h-4 accent-[#FF2E2E] shrink-0" />
                    <span className="text-xs text-[#B0B0B0] group-hover:text-white transition-colors">
                      I have read and agree to the disclaimer. <span className="text-[#FF2E2E] font-black">Bikemate is NOT responsible</span> for any incidents during this ride.
                    </span>
                  </label>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="btn btn-glass flex-1">← Back</button>
                    <button onClick={handlePublishRide} disabled={!createForm.disclaimer}
                      className="btn btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed">
                      🏍️ Publish Ride
                    </button>
                  </div>
                </div>
              )}

              {/* ───── JOIN STEPS ───── */}
              {modal === "join" && step === 1 && (
                <div className="space-y-4">
                  <div className="text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.3em] mb-4">Step 1 — Ride & Creator Info</div>
                  <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest">Route</span>
                      <span className="text-xs font-black text-white">{selectedRide?.start} → {selectedRide?.end}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest">Date & Time</span>
                      <span className="text-xs font-black text-white">{selectedRide?.date} @ {selectedRide?.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest">Cost</span>
                      <span className="text-xs font-black text-[#FF2E2E]">{selectedRide?.cost}</span>
                    </div>
                  </div>
                  {selectedRide?.creator && (
                    <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 space-y-2">
                      <div className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest mb-2">Ride Organizer</div>
                      <div className="font-black text-sm text-white">{selectedRide.creator.name}</div>
                      {selectedRide.creator.bio && <p className="text-[0.7rem] text-[#666] italic">&quot;{selectedRide.creator.bio}&quot;</p>}
                      <div className="flex gap-2 flex-wrap mt-2">
                        {selectedRide.creator.instagram && (
                          <a href={`https://instagram.com/${selectedRide.creator.instagram}`} target="_blank" rel="noreferrer"
                            className="text-[0.6rem] font-black text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
                            📸 @{selectedRide.creator.instagram}
                          </a>
                        )}
                        {selectedRide.creator.twitter && (
                          <a href={`https://twitter.com/${selectedRide.creator.twitter}`} target="_blank" rel="noreferrer"
                            className="text-[0.6rem] font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                            🐦 @{selectedRide.creator.twitter}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setStep(2)} className="btn btn-primary btn-full">Next: Your Info →</button>
                </div>
              )}

              {modal === "join" && step === 2 && (
                <form onSubmit={handleJoinStep2} className="space-y-4">
                  <div className="text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.3em] mb-4">Step 2 — Your Rider Profile</div>
                  <p className="text-xs text-[#555] mb-2">The organizer will see this before approving your request.</p>
                  <textarea required value={joinForm.bio} onChange={e => setJoinForm({...joinForm, bio: e.target.value})}
                    placeholder="Introduce yourself — riding experience, bike, style..." rows={3}
                    className="input-field w-full resize-none" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400 text-lg">📸</span>
                      <input value={joinForm.instagram} onChange={e => setJoinForm({...joinForm, instagram: e.target.value})}
                        placeholder="Instagram username" className="input-field flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sky-400 text-lg">🐦</span>
                      <input value={joinForm.twitter} onChange={e => setJoinForm({...joinForm, twitter: e.target.value})}
                        placeholder="Twitter / X username" className="input-field flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-lg">📘</span>
                      <input value={joinForm.facebook} onChange={e => setJoinForm({...joinForm, facebook: e.target.value})}
                        placeholder="Facebook profile URL" className="input-field flex-1" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn btn-glass flex-1">← Back</button>
                    <button type="submit" className="btn btn-primary flex-1">Next: Disclaimer →</button>
                  </div>
                </form>
              )}

              {modal === "join" && step === 3 && (
                <div className="space-y-5">
                  <div className="text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.3em] mb-4">Step 3 — Disclaimer</div>
                  <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-4 text-xs text-[#666] leading-relaxed max-h-40 overflow-y-auto">
                    {DISCLAIMER}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={joinForm.disclaimer}
                      onChange={e => setJoinForm({...joinForm, disclaimer: e.target.checked})}
                      className="mt-0.5 w-4 h-4 accent-[#FF2E2E] shrink-0" />
                    <span className="text-xs text-[#B0B0B0] group-hover:text-white transition-colors">
                      I have read and agree to the disclaimer. <span className="text-[#FF2E2E] font-black">Bikemate is NOT responsible</span> for any incidents during this ride.
                    </span>
                  </label>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="btn btn-glass flex-1">← Back</button>
                    <button onClick={handleConfirmJoin} disabled={!joinForm.disclaimer}
                      className="btn btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed">
                      🤝 Confirm Join
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline input style */}
      <style jsx global>{`
        .input-field {
          background: #0D0D0D;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #FF2E2E; }
        .input-field::placeholder { color: #333; }
      `}</style>

      {/* QR Sticker CTA */}
      <div className="mt-12">
        <StickerCTA variant="banner" />
      </div>
    </div>
  );
}
