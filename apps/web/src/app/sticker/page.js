"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useAuth } from "../../components/AuthContext";
import { useRouter } from "next/navigation";

export default function StickerPage() {
  const router = useRouter();
  const stickerRef = useRef(null);
  const { user, isPremium } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    guardian: user?.guardianName || "",
    contact: user?.phone || "",
    blood: user?.bloodGroup || "O+",
    city: user?.city || "",
    address: user?.address || "",
    medicalNotes: user?.medicalNotes || ""
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [refNo] = useState(() => Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        guardian: user.guardianName || "",
        contact: user.phone || "",
        blood: user.bloodGroup || "O+",
        city: user.city || "",
        address: user.address || "",
        medicalNotes: user.medicalNotes || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const downloadSticker = async () => {
    if (stickerRef.current === null) return;
    setIsDownloading(true);
    try {
      // Free users get 1x quality, Premium get 4x
      const quality = isPremium ? 4 : 1;
      const dataUrl = await toPng(stickerRef.current, { 
        cacheBust: true,
        pixelRatio: quality, 
      });
      const link = document.createElement('a');
      link.download = `bikemet-sticker-${isPremium ? '4K' : 'Standard'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadPDF = async () => {
    if (!isPremium) {
       alert("PDF Export is a Premium feature. Please upgrade!");
       return;
    }
    if (stickerRef.current === null) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(stickerRef.current, { pixelRatio: 4 });
      const pdf = new jsPDF('l', 'mm', [100, 45]); // Rectangle shaped PDF
      pdf.addImage(dataUrl, 'PNG', 0, 0, 100, 45);
      pdf.save(`bikemet-helmet-id.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Simplified QR data for better readability/scanability
  const qrDataArr = [
    `Rider: ${formData.name}`,
    `SOS: ${formData.contact}`,
    `Blood: ${formData.blood}`,
    `City: ${formData.city}`,
    `Guardian: ${formData.guardian}`,
    `Medical Notes: ${formData.medicalNotes || 'None'}`
  ];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrDataArr.join('\n'))}`;

  return (
    <div className="animate-page-enter w-full max-w-7xl mx-auto mt-12 px-4 pb-32">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black font-heading tracking-tight mb-2 uppercase italic">Safety <span className="text-bh-primary">ID</span> Sticker</h1>
        <p className="text-bh-gray text-sm font-medium tracking-wide uppercase">Official Helmet Responder Card for Extreme Riders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border-white/5 shadow-2xl">
            <h4 className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-[0.3em] font-heading mb-6 border-b border-white/10 pb-3 italic">Configure Badge</h4>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Rider Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Blood</label>
                  <select name="blood" value={formData.blood} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none appearance-none cursor-pointer">
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Home City</label>
                  <input name="city" value={formData.city} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Guardian Name</label>
                <input name="guardian" value={formData.guardian} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">SOS Number</label>
                <input name="contact" value={formData.contact} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Medical History (Optional)</label>
                <textarea 
                  name="medicalNotes" 
                  value={formData.medicalNotes || ""} 
                  onChange={handleChange} 
                  placeholder="Allergies, previous surgeries, or conditions..."
                  rows="2"
                  className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" 
                />
              </div>
            </div>
          </div>
          
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-bh-primary to-transparent overflow-hidden shadow-2xl">
             <div className="bg-[#121212] p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-lg font-black font-heading tracking-tight">Physical Sticker Pack</h3>
                   <span className="text-bh-green text-[0.5rem] font-black uppercase tracking-widest bg-bh-green/10 px-2 py-1 rounded">Best Seller</span>
                </div>
                <p className="text-bh-gray text-[0.65rem] mb-6 leading-relaxed italic opacity-80">&quot;2x Premium waterproof QR helmet stickers + Surprise Gift Box.&quot;</p>
                <div className="flex items-end gap-2 mb-6">
                   <span className="text-3xl font-black italic">₹429</span>
                   <span className="text-[0.65rem] text-bh-green font-black uppercase tracking-widest pb-1">Free Home Delivery</span>
                </div>
                <button onClick={() => router.push('/checkout?type=sticker')} className="btn btn-primary btn-full py-4 font-black uppercase tracking-widest text-[0.65rem]">Order Sticker Pack</button>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <button 
               onClick={downloadSticker}
               disabled={isDownloading}
               className={`btn btn-outline btn-full py-4 rounded-xl border-white/10 font-black uppercase tracking-widest text-[0.65rem] hover:bg-white/5 flex items-center justify-center gap-2`}
             >
                {isDownloading ? 'Processing...' : (
                   <>
                      <span>Download PNG</span>
                      {!isPremium && <span className="text-[0.55rem] bg-white/10 px-2 py-0.5 rounded ml-2">Low Res</span>}
                      {isPremium && <span className="text-[0.55rem] bg-bh-primary/20 px-2 py-0.5 rounded ml-2">4K Quality</span>}
                   </>
                )}
             </button>

             <button 
               onClick={downloadPDF}
               disabled={isDownloading}
               className={`btn btn-full py-4 rounded-xl font-black uppercase tracking-widest text-[0.65rem] flex items-center justify-center gap-2 ${isPremium ? 'btn-primary shadow-glow-red' : 'bg-white/5 text-bh-gray pointer-events-none opacity-50'}`}
             >
                {isPremium ? 'Download PDF Document' : 'PDF Export (Premium only)'}
                {isPremium ? <span className="text-sm">📄</span> : <span className="text-sm">🔒</span>}
             </button>
          </div>
        </div>

        {/* The Sticker Preview - Rectangle & Small Look */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-8 bg-[#121212]/50 border border-white/5 rounded-[3rem] shadow-inner">
           <h4 className="text-[0.5rem] font-black text-bh-gray-dark uppercase tracking-[0.4em] mb-10 opacity-60 italic">Real-Scale Sticker Simulation</h4>
           
           {/* RECTANGLE STICKER UI */}
           <div 
             ref={stickerRef}
             className="bg-white text-black w-full max-w-[500px] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-row border-[3px] border-bh-card overflow-hidden"
           >
              {/* Left Stripe - Branding & Type */}
              <div className="w-[12%] bg-bh-bg flex items-center justify-center py-4 border-r border-white/10">
                 <div className="rotate-[-90deg] whitespace-nowrap text-[0.4rem] font-black text-white tracking-[0.4em] uppercase opacity-80">BIKEMET SECURE™</div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-5 flex flex-col">
                 <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-2">
                    <div className="flex flex-col">
                       <span className="text-[0.5rem] font-black text-bh-gray-dark uppercase tracking-widest leading-none mb-1">EMERGENCY RESPONDER INFO</span>
                       <span className="text-xl font-black font-heading leading-tight tracking-tight uppercase italic">{formData.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[0.45rem] font-black text-bh-primary uppercase tracking-widest mb-1">BLOOD GROUP</span>
                       <span className="text-2xl font-black text-bh-primary font-heading leading-none">{formData.blood}</span>
                    </div>
                 </div>

                 <div className="flex gap-6 items-start">
                    <div className="flex-1 space-y-3">
                       <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                             <span className="text-[0.4rem] font-black text-bh-gray-dark uppercase tracking-widest leading-none mb-0.5">SOS Hotline</span>
                             <span className="text-md font-black italic">{formData.contact}</span>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[0.4rem] font-black text-bh-gray-dark uppercase tracking-widest leading-none mb-0.5">Origin</span>
                             <span className="text-[0.65rem] font-black uppercase">{formData.city}</span>
                          </div>
                       </div>
                       <div className="flex flex-col opacity-80 border-t border-black/5 pt-2">
                          <span className="text-[0.4rem] font-black text-bh-gray-dark uppercase tracking-widest leading-none mb-1">Medical History</span>
                          <span className="text-[0.55rem] font-bold line-clamp-2">{formData.medicalNotes || "N/A"}</span>
                       </div>
                    </div>
                    
                    {/* Compact Working QR */}
                    <div className="w-20 h-20 shrink-0 bg-white border border-black/5 p-1 relative flex items-center justify-center">
                       <Image 
                         src={qrUrl} 
                         alt="QR" 
                         width={250} 
                         height={250}
                         className="mix-blend-multiply transition-all group-hover:scale-105" 
                       />
                       <div className="absolute -bottom-1 left-0 right-0 text-[0.3rem] font-black text-center text-bh-gray-dark uppercase scale-75">SCAN ME</div>
                    </div>
                 </div>

                 {/* Official Footer Branding */}
                 <div className="mt-4 pt-2 border-t-[0.5px] border-black/10 flex justify-between items-end opacity-60">
                    <div className="text-[0.35rem] font-bold leading-none">REF: BMT-{refNo}</div>
                    <div className="text-[0.4rem] font-black font-heading italic tracking-tighter uppercase leading-none">Design Global Technology</div>
                 </div>
              </div>
           </div>

           <div className="mt-12 text-center max-w-xs opacity-40">
              <p className="text-[0.6rem] font-bold text-bh-gray uppercase tracking-widest leading-relaxed">
                 * Peel-off sticky badge simulation. <br/> Works on Helmets, Bikes, and Visors.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
