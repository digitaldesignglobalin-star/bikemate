"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext";

export default function GaragePage() {
  const { user } = useAuth();
  const [odo, setOdo] = useState(12450);
  const [editingOdo, setEditingOdo] = useState(false);
  
  const [editingBike, setEditingBike] = useState(false);
  const [bikeConfig, setBikeConfig] = useState({ make: "KTM", model: "Duke 390", purchaseDate: "2024-05-15", avgMileage: "35" });

  const [serviceLogs, setServiceLogs] = useState({
    chainLubeDate: "2026-04-10",
    engineOilDate: "2026-02-15",
    brakePadDate: "2025-11-20",
    fullServiceDate: "2026-01-10"
  });

  // Calculate Bike Age
  const calcAge = (dateStr) => {
    const months = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24 * 30.44);
    return isNaN(months) ? "Unknown" : months > 12 ? `${(months/12).toFixed(1)} Yrs` : `${months.toFixed(0)} Mos`;
  };

  // AI Date Predictors (Days passed since last change)
  const getDaysPassed = (dateStr) => Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24)) || 0;
  
  const isHighPerformance = bikeConfig.make.toLowerCase().includes("ktm") || bikeConfig.model.toLowerCase().includes("390") || bikeConfig.make.toLowerCase().includes("ducati");
  
  // High performance degrades parts faster chronologically
  const chainDaysDue = isHighPerformance ? 14 : 30;     // 2 vs 4 weeks
  const oilDaysDue = isHighPerformance ? 120 : 180;     // 4 vs 6 months
  const brakeDaysDue = isHighPerformance ? 365 : 730;   // 1 vs 2 years
  const serviceDaysDue = isHighPerformance ? 180 : 365; // 6 mos vs 1 yr

  const chainDaysPassed = getDaysPassed(serviceLogs.chainLubeDate);
  const oilDaysPassed = getDaysPassed(serviceLogs.engineOilDate);
  const brakeDaysPassed = getDaysPassed(serviceLogs.brakePadDate);
  const serviceDaysPassed = getDaysPassed(serviceLogs.fullServiceDate);

  const [fuelLogs, setFuelLogs] = useState([{ amount: 500, liters: 5.1, odo: 12100 }]);
  const [fuelInput, setFuelInput] = useState({ amount: "", liters: "" });

  const handleAddFuel = () => {
    if (!fuelInput.amount || !fuelInput.liters) return;
    setFuelLogs([{ amount: parseFloat(fuelInput.amount), liters: parseFloat(fuelInput.liters), odo }, ...fuelLogs]);
    setFuelInput({ amount: "", liters: "" });
  };

  // Quick Analytics
  const avgMileage = parseFloat(bikeConfig.avgMileage) || 43.5; 
  const lastFillPrice = fuelLogs[0] ? (fuelLogs[0].amount / fuelLogs[0].liters).toFixed(2) : 0;
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-4 pb-32 animate-[pageEnter_0.4s_ease_both]">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <Link href="/dashboard" className="text-white bg-white/5 hover:bg-white/10 p-2 rounded-full absolute -top-2 md:top-0 right-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-full text-[0.65rem] font-black text-[#FACC15] uppercase tracking-widest mb-4">
            Predictive AI
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-2">
            Smart <span className="bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">Garage</span>
          </h1>
          <p className="text-[#B0B0B0] text-sm">Monitor maintenance health and fuel analytics without the guesswork.</p>
        </div>
      </div>

      {/* Machine Profile Configuration */}
      <div className="bg-[#111] border border-white/5 rounded-3xl p-6 mb-8 relative md:flex justify-between items-center gap-8 group">
         <div className="absolute top-0 right-0 opacity-5 pointer-events-none text-9xl">🏍</div>
         <div className="flex-1 pb-4 md:pb-0 z-10 relative">
           <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
             <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
             Machine Configuration
           </h4>
           <div className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest">
             AI automatically adjusts maintenance windows based on CC / Engine Type.
           </div>
           
           {editingBike ? (
             <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
               <input type="text" placeholder="Make (KTM)" value={bikeConfig.make} onChange={e => setBikeConfig({...bikeConfig, make: e.target.value})} className="bg-[#050505] text-white border border-white/10 px-3 py-2 rounded-lg text-xs font-bold w-full uppercase" />
               <input type="text" placeholder="Model (Duke 390)" value={bikeConfig.model} onChange={e => setBikeConfig({...bikeConfig, model: e.target.value})} className="bg-[#050505] text-white border border-white/10 px-3 py-2 rounded-lg text-xs font-bold w-full uppercase" />
               <input type="text" placeholder="Avg Mileage (35)" value={bikeConfig.avgMileage} onChange={e => setBikeConfig({...bikeConfig, avgMileage: e.target.value})} className="bg-[#050505] text-white border border-white/10 px-3 py-2 rounded-lg text-xs font-bold w-full uppercase" />
               <input type="date" value={bikeConfig.purchaseDate} onChange={e => setBikeConfig({...bikeConfig, purchaseDate: e.target.value})} className="bg-[#050505] text-white border border-white/10 px-3 py-2 rounded-lg text-xs font-bold w-full uppercase" />
               <div className="col-span-2 lg:col-span-4">
                 <button onClick={() => setEditingBike(false)} className="btn btn-outline border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 w-full text-xs font-black py-2">Save Profile</button>
               </div>
             </div>
           ) : (
             <div className="mt-5 flex flex-wrap gap-4 cursor-pointer" onClick={() => setEditingBike(true)}>
                <div className="flex flex-col">
                  <span className="text-[0.55rem] font-bold text-[#555] uppercase tracking-widest">Manufacturer</span>
                  <span className="text-lg font-black text-white">{bikeConfig.make}</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-[0.55rem] font-bold text-[#555] uppercase tracking-widest">Model variant</span>
                  <span className="text-lg font-black text-white">{bikeConfig.model}</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-[0.55rem] font-bold text-[#555] uppercase tracking-widest">Machine Age</span>
                  <span className="text-lg font-black text-white">{calcAge(bikeConfig.purchaseDate)}</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-[0.55rem] font-bold text-[#555] uppercase tracking-widest">Avg Mileage</span>
                  <span className="text-lg font-black text-white">{bikeConfig.avgMileage} / L</span>
                </div>
             </div>
           )}
         </div>
      </div>

      {/* Date Configuration Form */}
      <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.2em] flex items-center gap-3 mb-4 mt-8">
        <span className="w-8 h-[2px] bg-blue-400 rounded-full" />
        Log Recent Checkups
      </h3>
      <div className="bg-[#111] border border-white/5 p-6 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="flex flex-col">
           <label className="text-[0.55rem] font-bold text-[#666] uppercase tracking-[0.1em] mb-1">Chain Lube</label>
           <input type="date" value={serviceLogs.chainLubeDate} onChange={e => setServiceLogs({...serviceLogs, chainLubeDate: e.target.value})} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white" />
         </div>
         <div className="flex flex-col">
           <label className="text-[0.55rem] font-bold text-[#666] uppercase tracking-[0.1em] mb-1">Engine Oil</label>
           <input type="date" value={serviceLogs.engineOilDate} onChange={e => setServiceLogs({...serviceLogs, engineOilDate: e.target.value})} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white" />
         </div>
         <div className="flex flex-col">
           <label className="text-[0.55rem] font-bold text-[#666] uppercase tracking-[0.1em] mb-1">Brake Pads</label>
           <input type="date" value={serviceLogs.brakePadDate} onChange={e => setServiceLogs({...serviceLogs, brakePadDate: e.target.value})} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white" />
         </div>
         <div className="flex flex-col">
           <label className="text-[0.55rem] font-bold text-[#666] uppercase tracking-[0.1em] mb-1">Full Service</label>
           <input type="date" value={serviceLogs.fullServiceDate} onChange={e => setServiceLogs({...serviceLogs, fullServiceDate: e.target.value})} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white" />
         </div>
      </div>

      {/* AI Health Diagnostics */}
      <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
        <span className="w-8 h-[2px] bg-yellow-400 rounded-full" />
        AI Maintenance Prediction
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {/* Chain */}
        <div className={`bg-[#111] border ${chainDaysPassed >= chainDaysDue ? 'border-[#FF2E2E]/40' : 'border-white/5'} rounded-3xl p-6 relative`}>
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-4 text-emerald-400">⛓️</div>
           <h4 className="font-black text-white text-lg tracking-tight mb-1">Chain Drop</h4>
           <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest mb-4">Required every {chainDaysDue} days</p>
           <div className="flex items-end justify-between font-black text-xl">
             <span className={chainDaysPassed >= chainDaysDue ? "text-[#FF2E2E]" : "text-emerald-400"}>
               {chainDaysPassed >= chainDaysDue ? "OVERDUE" : `${chainDaysDue - chainDaysPassed} Days Out`}
             </span>
           </div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
              <div className={`h-full rounded-full transition-all duration-1000 ${chainDaysPassed >= chainDaysDue ? "bg-[#FF2E2E] animate-pulse" : "bg-emerald-400"}`} 
                   style={{ width: `${Math.min((chainDaysPassed / chainDaysDue) * 100, 100)}%` }} />
           </div>
        </div>

        {/* Oil */}
        <div className={`bg-[#111] border ${oilDaysPassed >= oilDaysDue ? 'border-[#FF2E2E]/40' : 'border-white/5'} rounded-3xl p-6 relative`}>
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-4 text-[#FACC15]">🛢️</div>
           <h4 className="font-black text-white text-lg tracking-tight mb-1">Engine Oil</h4>
           <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest mb-4">Every {Math.floor(oilDaysDue/30)} Months</p>
           <div className="flex items-end justify-between font-black text-xl">
             <span className={oilDaysPassed >= oilDaysDue ? "text-[#FF2E2E]" : "text-[#FACC15]"}>
               {oilDaysPassed >= oilDaysDue ? "OVERDUE" : `${oilDaysDue - oilDaysPassed} Days Out`}
             </span>
           </div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
              <div className={`h-full rounded-full transition-all duration-1000 ${oilDaysPassed >= oilDaysDue ? "bg-[#FF2E2E] animate-pulse" : "bg-[#FACC15]"}`} 
                   style={{ width: `${Math.min((oilDaysPassed / oilDaysDue) * 100, 100)}%` }} />
           </div>
        </div>

        {/* Brake */}
        <div className={`bg-[#111] border ${brakeDaysPassed >= brakeDaysDue ? 'border-[#FF2E2E]/40' : 'border-white/5'} rounded-3xl p-6 relative`}>
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-4 text-blue-400">🛑</div>
           <h4 className="font-black text-white text-lg tracking-tight mb-1">Brake Pads</h4>
           <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest mb-4">Every {Math.floor(brakeDaysDue/30)} Months</p>
           <div className="flex items-end justify-between font-black text-xl">
             <span className={brakeDaysPassed >= brakeDaysDue ? "text-orange-400" : "text-blue-400"}>
               {brakeDaysPassed >= brakeDaysDue ? "OVERDUE" : `${brakeDaysDue - brakeDaysPassed} Days Out`}
             </span>
           </div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
              <div className="h-full rounded-full bg-blue-400 transition-all duration-1000" 
                   style={{ width: `${Math.min((brakeDaysPassed / brakeDaysDue) * 100, 100)}%` }} />
           </div>
        </div>

        {/* Full Service */}
        <div className={`bg-[#111] border ${serviceDaysPassed >= serviceDaysDue ? 'border-[#FF2E2E]/40' : 'border-white/5'} rounded-3xl p-6 relative`}>
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-4 text-purple-400">🔧</div>
           <h4 className="font-black text-white text-lg tracking-tight mb-1">Full Service</h4>
           <p className="text-[0.65rem] text-[#888] font-black uppercase tracking-widest mb-4">Every {Math.floor(serviceDaysDue/30)} Months</p>
           <div className="flex items-end justify-between font-black text-xl">
             <span className={serviceDaysPassed >= serviceDaysDue ? "text-[#FF2E2E]" : "text-purple-400"}>
               {serviceDaysPassed >= serviceDaysDue ? "DUE NOW" : `${serviceDaysDue - serviceDaysPassed} Days Out`}
             </span>
           </div>
           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
              <div className="h-full rounded-full bg-purple-400 transition-all duration-1000" 
                   style={{ width: `${Math.min((serviceDaysPassed / serviceDaysDue) * 100, 100)}%` }} />
           </div>
        </div>
      </div>

      {/* Fuel Analytics */}
      <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
        <span className="w-8 h-[2px] bg-emerald-400 rounded-full" />
        Fuel Economy Engine
      </h3>
      
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Summary Card */}
        <div className="glass-card bg-[#111] flex-1 p-8 rounded-[2rem] border-emerald-400/20 shadow-[0_0_80px_rgba(52,211,153,0.05)]">
           <h4 className="text-xs text-emerald-400 uppercase tracking-widest font-black mb-6">Live Efficiency</h4>
           <div className="flex flex-col gap-6">
             <div>
               <div className="text-[0.6rem] text-[#888] uppercase tracking-[0.2em]">Expected Average</div>
               <div className="text-5xl font-black text-white tracking-tighter">
                 {avgMileage} <span className="text-xl text-[#555] font-bold tracking-widest uppercase">KM/L</span>
               </div>
             </div>
             
             <div className="flex gap-8">
               <div>
                  <div className="text-[0.6rem] text-[#888] uppercase tracking-[0.2em]">Cost per KM</div>
                  <div className="text-2xl font-black text-white">₹{(lastFillPrice / avgMileage).toFixed(2)}</div>
               </div>
               <div>
                  <div className="text-[0.6rem] text-[#888] uppercase tracking-[0.2em]">Latest Rate</div>
                  <div className="text-2xl font-black text-white">₹{lastFillPrice}<span className="text-xs text-[#555]">/L</span></div>
               </div>
             </div>
           </div>
        </div>

        {/* Input Log Box */}
        <div className="bg-[#111] border border-white/5 flex-1 p-8 rounded-[2rem] flex flex-col justify-between">
           <div className="mb-4">
             <h4 className="text-sm text-white font-black uppercase tracking-widest mb-1">Add Fuel Log</h4>
             <p className="text-[0.65rem] text-[#666] tracking-widest uppercase">Maintain calculation accuracy</p>
           </div>
           
           <div className="flex gap-4 mb-6">
             <div className="flex-1">
               <label className="text-[0.6rem] font-black text-[#555] uppercase tracking-widest block mb-1 ml-1">Total Bill (₹)</label>
               <input type="number" placeholder="500" value={fuelInput.amount} onChange={e=>setFuelInput({...fuelInput, amount: e.target.value})} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 font-bold text-white focus:border-emerald-400 outline-none transition-colors" />
             </div>
             <div className="flex-1">
               <label className="text-[0.6rem] font-black text-[#555] uppercase tracking-widest block mb-1 ml-1">Liters Filled</label>
               <input type="number" placeholder="4.5" value={fuelInput.liters} onChange={e=>setFuelInput({...fuelInput, liters: e.target.value})} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 font-bold text-white focus:border-emerald-400 outline-none transition-colors" />
             </div>
           </div>
           
           <button onClick={handleAddFuel} className="btn btn-outline border-white/10 hover:border-emerald-400 hover:bg-emerald-400/5 hover:text-emerald-400 w-full font-black text-xs uppercase tracking-widest py-4 mb-4">
             Register Data
           </button>

           <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <h5 className="text-[0.65rem] font-black text-[#888] uppercase tracking-widest">Tank Range</h5>
                <span className="text-xl font-black text-emerald-400">
                  {((fuelLogs.reduce((acc, log) => acc + log.liters, 0)) * avgMileage).toFixed(0)} <span className="text-sm">KM</span>
                </span>
              </div>
              <div className="text-right">
                <h5 className="text-[0.65rem] font-black text-[#888] uppercase tracking-widest">Total Logs</h5>
                <span className="text-xl font-black text-white">{fuelLogs.length}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
