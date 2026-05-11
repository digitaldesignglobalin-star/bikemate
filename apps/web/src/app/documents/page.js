"use client";

import { useAuth } from "../../components/AuthContext";
import PremiumOverlay from "../../components/PremiumOverlay";
import { useState } from "react";

export default function DocumentsPage() {
  const { isPremium } = useAuth();
  
  const docs = [
    { name: "Insurance Policy", status: "Active", expiry: "12 Oct 2024", color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Registration (RC)", status: "Verified", expiry: "None", color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Pollution (PUC)", status: "Expiring soon", expiry: "25 Apr 2024", color: "text-bh-yellow", bg: "bg-bh-yellow/10" }
  ];
  const [activeModal, setActiveModal] = useState(null); // 'view', 'replace', 'add'
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleAction = (action, doc = null) => {
    setSelectedDoc(doc);
    setActiveModal(action);
  };

  return (
    <div className="animate-page-enter w-full max-w-4xl mx-auto mt-12 px-4 pb-32 relative min-h-[60vh]">
      {!isPremium && <PremiumOverlay featureName="Digital Document Vault" />}
      
      <div className={`transition-all duration-700 ${!isPremium ? 'blur-md grayscale opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="mb-10">
          <h1 className="text-4xl font-black font-heading tracking-tight mb-2">Document Vault</h1>
          <p className="text-bh-gray text-base">Keep your bike papers digital and secure.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {docs.map((doc, i) => (
            <div key={i} className="group glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-bh-primary/30 transition-all">
              <div className="flex items-center gap-6 w-full">
                <div className={`w-14 h-14 rounded-2xl ${doc.bg} ${doc.color} flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                  📄
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black font-heading">{doc.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[0.65rem] font-black uppercase tracking-widest ${doc.status === 'Expiring soon' ? 'text-bh-yellow' : 'text-bh-gray-dark'}`}>{doc.status}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                    <span className="text-[0.65rem] text-bh-gray-dark font-bold uppercase tracking-widest">Expires: {doc.expiry}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => handleAction('view', doc)} className="flex-1 md:flex-none btn btn-glass px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5">View</button>
                <button onClick={() => handleAction('replace', doc)} className="flex-1 md:flex-none btn btn-outline px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-white/5">Replace</button>
              </div>
            </div>
          ))}

          <button onClick={() => handleAction('add')} className="w-full py-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-bh-primary/30 hover:bg-bh-primary/5 transition-all group mt-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl group-hover:bg-bh-primary group-hover:text-white transition-all">+</div>
            <span className="text-xs font-black uppercase tracking-widest text-bh-gray-dark group-hover:text-white">Add New Document</span>
          </button>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-page-enter">
           <div className={`w-full ${activeModal === 'view' ? 'max-w-lg' : 'max-w-md'} bg-bh-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all`}>
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <h2 className="text-lg font-black">{activeModal === 'add' ? 'Upload Document' : `${activeModal === 'view' ? 'Viewing' : 'Replacing'} ${selectedDoc?.name}`}</h2>
                 <button onClick={() => setActiveModal(null)} className="text-bh-gray hover:text-white text-xl">&times;</button>
              </div>
              
              {activeModal === 'view' ? (
                <div className="p-6 md:p-8 flex flex-col items-center">
                   {/* Realistic Document Preview Mockup */}
                   <div className="relative w-full aspect-[1/1.4] max-h-[50vh] bg-[#F5F5F5] rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-start p-6 mb-6 mx-auto">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                         <span className="text-6xl font-black rotate-[-45deg] tracking-[0.5em] text-black">BIKEMATE</span>
                      </div>
                      
                      {/* Mock Text Lines */}
                      <div className="flex w-full justify-between items-end border-b-2 border-black/20 pb-4 mb-6">
                         <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center text-xl">🏍️</div>
                         <div className="text-right">
                            <div className="text-[10px] font-black text-black/40 uppercase tracking-widest">{selectedDoc?.expiry === 'None' ? 'LIFETIME VALIDITY' : 'VALID DOCUMENT'}</div>
                            <div className="text-lg font-black text-black/80 font-heading leading-none">{selectedDoc?.name}</div>
                         </div>
                      </div>

                      <div className="w-full space-y-3">
                         <div className="w-full h-3 bg-black/10 rounded-full"></div>
                         <div className="w-5/6 h-3 bg-black/10 rounded-full"></div>
                         <div className="w-4/6 h-3 bg-black/10 rounded-full"></div>
                      </div>

                      <div className="w-full space-y-3 mt-6">
                         <div className="w-full h-3 bg-black/10 rounded-full"></div>
                         <div className="w-full h-3 bg-black/10 rounded-full"></div>
                         <div className="w-3/4 h-3 bg-black/10 rounded-full"></div>
                      </div>

                      <div className="mt-auto flex w-full justify-between items-end pb-2">
                         <div className="w-16 h-16 bg-black/10 rounded-lg flex items-center justify-center">
                           {/* QR Code Mock */}
                           <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-10 h-10 opacity-50">
                             {Array.from({length: 9}).map((_, i) => <div key={i} className={`bg-black ${i % 2 === 0 ? 'opacity-100' : 'opacity-40'} rounded-sm`}></div>)}
                           </div>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${selectedDoc?.status === 'Active' || selectedDoc?.status === 'Verified' ? 'border-green-600/40 text-green-700 bg-green-500/10' : 'border-yellow-600/40 text-yellow-700 bg-yellow-500/10'}`}>
                            {selectedDoc?.status}
                         </div>
                      </div>
                   </div>

                   <button className="btn btn-primary btn-full" onClick={() => alert('Downloading High-Resolution PDF... (Mock)')}>
                     📥 Download PDF
                   </button>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-6">
                      📁
                   </div>
                   <div className="w-full">
                     <p className="text-sm text-bh-gray mb-6">Select a file (PDF, JPG, PNG) to securely encrypt and upload to your personal Vault.</p>
                     <label className="btn btn-primary btn-full cursor-pointer">
                        Choose File
                        <input type="file" className="hidden" onChange={() => {
                          alert(`${activeModal === 'add' ? 'Uploaded' : 'Replaced'} successfully!`);
                          setActiveModal(null);
                        }} />
                     </label>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
