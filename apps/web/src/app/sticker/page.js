"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import QRCode from "qrcode";
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
  const [qrDataUrl, setQrDataUrl] = useState("");
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

  // Generate QR code client-side whenever form data changes
  const generateQR = useCallback(async () => {
    const qrDataArr = [
      `Rider: ${formData.name}`,
      `SOS: ${formData.contact}`,
      `Blood: ${formData.blood}`,
      `City: ${formData.city}`,
      `Guardian: ${formData.guardian}`,
      `Medical: ${formData.medicalNotes || 'None'}`
    ];
    try {
      const url = await QRCode.toDataURL(qrDataArr.join('\n'), {
        width: 300,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("QR generation failed:", err);
    }
  }, [formData]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate before download
  const validate = () => {
    if (!formData.name || !formData.contact) {
      alert("Please fill in at least your Rider Name and SOS Contact.");
      return false;
    }
    if (!stickerRef.current) {
      alert("Sticker not ready. Please wait a moment.");
      return false;
    }
    return true;
  };

  const downloadPNG = async () => {
    if (!validate()) return;
    setIsDownloading(true);
    try {
      const quality = isPremium ? 4 : 2;
      const dataUrl = await toPng(stickerRef.current, { 
        cacheBust: true,
        pixelRatio: quality,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });
      const link = document.createElement('a');
      link.download = `bikemet-sticker-${formData.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PNG download failed:', err);
      alert('PNG download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadPDF = async () => {
    if (!validate()) return;
    setIsDownloading(true);
    try {
      const quality = isPremium ? 4 : 2;
      const dataUrl = await toPng(stickerRef.current, { 
        pixelRatio: quality,
        backgroundColor: '#ffffff',
        skipFonts: true,
      });
      const pdf = new jsPDF('l', 'mm', [100, 50]);
      pdf.addImage(dataUrl, 'PNG', 0, 0, 100, 50);
      pdf.save(`bikemet-sticker-${formData.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('PDF download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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
                <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Rider Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" placeholder="Your full name" />
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
                  <input name="city" value={formData.city} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" placeholder="Mumbai" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Guardian Name</label>
                <input name="guardian" value={formData.guardian} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" placeholder="Parent or emergency contact name" />
              </div>
              <div className="space-y-1">
                <label className="text-[0.55rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">SOS Number *</label>
                <input name="contact" value={formData.contact} onChange={handleChange} className="w-full bg-[#0D0D0D] border border-white/5 rounded-lg p-3 text-xs focus:border-bh-primary outline-none transition-all" placeholder="+91 9876543210" />
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

          {/* Download Buttons */}
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={downloadPNG}
               disabled={isDownloading}
               className="btn btn-outline btn-full py-4 rounded-xl border-white/10 font-black uppercase tracking-widest text-[0.6rem] hover:bg-white/5 flex flex-col items-center justify-center gap-1.5 disabled:opacity-50"
             >
                <span className="text-lg">🖼️</span>
                <span>{isDownloading ? 'Processing...' : 'Download PNG'}</span>
                {isPremium && <span className="text-[0.5rem] bg-bh-primary/20 text-bh-primary px-2 py-0.5 rounded">4K</span>}
             </button>

             <button 
               onClick={downloadPDF}
               disabled={isDownloading}
               className="btn btn-primary btn-full py-4 rounded-xl font-black uppercase tracking-widest text-[0.6rem] shadow-glow-red flex flex-col items-center justify-center gap-1.5 disabled:opacity-50"
             >
                <span className="text-lg">📄</span>
                <span>{isDownloading ? 'Processing...' : 'Download PDF'}</span>
                {isPremium && <span className="text-[0.5rem] bg-white/20 px-2 py-0.5 rounded">4K</span>}
             </button>
          </div>
        </div>

        {/* The Sticker Preview */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-8 bg-[#121212]/50 border border-white/5 rounded-[3rem] shadow-inner">
           <h4 className="text-[0.5rem] font-black text-bh-gray-dark uppercase tracking-[0.4em] mb-10 opacity-60 italic">Real-Scale Sticker Simulation</h4>
           
           {/* RECTANGLE STICKER UI */}
           <div 
             ref={stickerRef}
             style={{ fontFamily: 'Arial, Helvetica, sans-serif', backgroundColor: '#ffffff' }}
             className="bg-white text-black w-full max-w-[500px] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-row border-[3px] border-bh-card overflow-hidden"
           >
              {/* Left Stripe - Branding & Type */}
              <div style={{ backgroundColor: '#0D0D0D', width: '12%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: '5px', fontWeight: '900', color: '#ffffff', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.8 }}>BIKEMET SECURE™</div>
              </div>

              {/* Main Content Area */}
              <div style={{ flex: 1, padding: '16px 20px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <div>
                       <div style={{ fontSize: '6px', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2px' }}>EMERGENCY RESPONDER INFO</div>
                       <div style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 1.1 }}>{formData.name || 'YOUR NAME'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '5px', fontWeight: '900', color: '#FF2E2E', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2px' }}>BLOOD GROUP</div>
                       <div style={{ fontSize: '22px', fontWeight: '900', color: '#FF2E2E', lineHeight: 1 }}>{formData.blood}</div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                             <div style={{ fontSize: '5px', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1px' }}>SOS Hotline</div>
                             <div style={{ fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}>{formData.contact || '—'}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                             <div style={{ fontSize: '5px', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1px' }}>Origin</div>
                             <div style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>{formData.city || '—'}</div>
                          </div>
                       </div>
                       <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '6px' }}>
                          <div style={{ fontSize: '5px', fontWeight: '900', color: '#999', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2px' }}>Medical History</div>
                          <div style={{ fontSize: '7px', fontWeight: '700', lineHeight: 1.4 }}>{formData.medicalNotes || 'N/A'}</div>
                       </div>
                    </div>
                    
                    {/* QR Code - rendered client-side */}
                    <div style={{ width: '72px', height: '72px', flexShrink: 0, border: '1px solid #eee', padding: '2px', position: 'relative' }}>
                       {qrDataUrl && (
                         <img 
                           src={qrDataUrl} 
                           alt="QR Code" 
                           style={{ width: '100%', height: '100%', display: 'block' }}
                         />
                       )}
                       <div style={{ position: 'absolute', bottom: '-8px', left: 0, right: 0, textAlign: 'center', fontSize: '4px', fontWeight: '900', color: '#999', textTransform: 'uppercase' }}>SCAN ME</div>
                    </div>
                 </div>

                 {/* Footer */}
                 <div style={{ marginTop: '12px', paddingTop: '6px', borderTop: '0.5px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: 0.5 }}>
                    <div style={{ fontSize: '5px', fontWeight: '700' }}>REF: BMT-{refNo}</div>
                    <div style={{ fontSize: '5px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>Design Global Technology</div>
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
