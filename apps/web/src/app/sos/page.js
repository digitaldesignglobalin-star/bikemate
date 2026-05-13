"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthContext";
import { api } from "../../utils/api";

export default function SOSPage() {
  const [isActivating, setIsActivating] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, sending, success, error
  const [errorMsg, setErrorMsg] = useState("");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSOS = async () => {
    if (!user) {
      setErrorMsg("You must be logged in to trigger SOS.");
      setStatus("error");
      return;
    }
    
    setIsActivating(true);
    setStatus("sending");
    setErrorMsg("");

    try {
      // 1. Get real location if possible
      let location = { lat: 19.0760, lng: 72.8777 }; // Default fallback
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, 
            timeout: 5000,
            maximumAge: 0
          });
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (locErr) {
        console.warn("Geolocation failed, using fallback:", locErr.message);
      }
      
      // 2. Real API call to trigger SOS in backend
      await api.post("/sos", {
        location,
        message: `EMERGENCY! SOS triggered by ${user?.name || 'Rider'}. Phone: ${user?.phone || 'N/A'}`
      });
      
      setStatus("success");
      
      // 3. Automated SMS Location Sharing
      // Get contacts from user profile or fallback
      const c1 = user?.emergencyContact1 || "+917980132406";
      const c2 = user?.emergencyContact2 || "+918420600137";
      const locUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      
      setTimeout(() => {
        // Multi-contact SMS intent
        const smsBody = encodeURIComponent(`EMERGENCY! I need help. My live location: ${locUrl}`);
        window.open(`sms:${c1},${c2}?body=${smsBody}`);
      }, 1500);

      // 4. Automated Calling (Primary Contact)
      setTimeout(() => {
        window.location.href = `tel:${c1}`; 
      }, 5000);

      setTimeout(() => setStatus("idle"), 15000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Failed to connect to SOS server");
      setTimeout(() => setStatus("idle"), 6000);
    } finally {
      setIsActivating(false);
    }
  };

  const contacts = [
    { name: user?.guardianName || "Emergency Primary", phone: user?.emergencyContact1 || "+91 79801 32406", initials: "E1" },
    { name: "Emergency Secondary", phone: user?.emergencyContact2 || "+91 84206 00137", initials: "E2" },
    { name: "Ambulance", phone: "108", initials: "108", special: true },
    { name: "Police Station", phone: "100", initials: "100", special: true },
  ];

  return (
    <div className="animate-page-enter w-full max-w-xl mx-auto mt-12 text-center px-4 pb-32">
      <div className="mb-12">
        <h2 className="text-4xl font-black font-heading tracking-tight mb-4">Emergency SOS</h2>
        <p className="text-bh-gray text-base mx-auto max-w-xs leading-relaxed">
          Tap the button below to instantly alert your family and local responders.
        </p>
      </div>

      {/* SOS Button UX Overhaul */}
      <div className="flex flex-col items-center justify-center mb-20">
        <div className="relative">
          {/* Animated Background Ripples */}
          {status === "sending" || status === "success" ? (
            <div className="absolute inset-0 scale-[2.5]">
              <div className="absolute inset-0 rounded-full border-[2px] border-bh-primary animate-[ripple_2s_infinite] opacity-30"></div>
              <div className="absolute inset-0 rounded-full border-[2px] border-bh-primary animate-[ripple_2s_infinite_0.5s] opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-[2px] border-bh-primary animate-[ripple_2s_infinite_1s] opacity-10"></div>
            </div>
          ) : (
             <div className="absolute inset-0 bg-bh-red/10 rounded-full blur-[80px] scale-[1.5]"></div>
          )}

          <button 
            onClick={handleSOS}
            disabled={isActivating || status === "success"}
            className={`
              relative w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all duration-500 active:scale-90
              ${status === "success" 
                ? 'bg-bh-green shadow-[0_0_60px_rgba(34,197,94,0.45)]' 
                : 'bg-gradient-to-br from-bh-primary to-[#CC0000] shadow-[0_30px_60px_-15px_rgba(255,46,46,0.45)] hover:shadow-[0_40px_80px_-20px_rgba(255,46,46,0.6)]'
              }
              ${isActivating ? 'opacity-90' : 'hover:scale-105'}
            `}
          >
             <div className="relative z-10 flex flex-col items-center">
                {status === "success" ? (
                  <>
                    <svg className="w-20 h-20 text-white mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="text-lg font-black text-white tracking-widest uppercase">SENT</span>
                  </>
                ) : (
                  <>
                    <svg className={`w-16 h-16 text-white mb-2 ${isActivating ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-3xl font-black text-white tracking-widest uppercase">SOS</span>
                  </>
                )}
             </div>
          </button>
        </div>
        
          {status === "sending" && <p className="text-bh-primary font-bold text-sm animate-pulse uppercase tracking-[0.2em]">Locating responders...</p>}
          {status === "success" && <p className="text-bh-green font-bold text-sm uppercase tracking-[0.2em]">Help is on the way!</p>}
          {status === "error" && (
            <div className="space-y-2">
              <p className="text-bh-red font-bold text-sm uppercase tracking-[0.2em]">System busy. Try calling below.</p>
              <p className="text-[0.6rem] text-bh-gray italic">{errorMsg}</p>
            </div>
          )}
      </div>

      <div className="text-left w-full space-y-8">
        <div className="flex items-center gap-4">
           <h4 className="text-xs font-black text-bh-gray-dark uppercase tracking-[0.3em] flex-1">Emergency Contacts</h4>
           <div className="h-[1px] bg-white/5 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {contacts.map((contact, i) => (
            <div key={i} className="group relative">
              <div className="absolute inset-0 bg-white/[0.02] rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-between p-5 glass-card border-none bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                 <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${contact.special ? 'bg-bh-green/10 text-bh-green' : 'bg-bh-gray-darker text-bh-gray'}`}>
                      {contact.initials}
                    </div>
                    <div>
                      <div className="font-bold text-white text-[1rem] leading-tight">{contact.name}</div>
                      <div className="text-xs text-bh-gray mt-1">{contact.phone}</div>
                    </div>
                 </div>
                 <button 
                   className="w-12 h-12 rounded-full flex items-center justify-center text-bh-gray hover:text-white hover:bg-bh-primary transition-all border border-white/5 shadow-2xl"
                   onClick={() => window.open(`tel:${contact.phone}`)}
                 >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                     <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                   </svg>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
