"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../components/AuthContext";

export default function DashcamPage() {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(0);

  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Back camera
          audio: true // Capture road noise/honking
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setErrorMsg("Camera access denied or unavailable. Please grant permissions.");
      }
    }
    setupCamera();
    
    const currentVideoRef = videoRef.current;

    return () => {
      // Cleanup stream on close
      if (currentVideoRef && currentVideoRef.srcObject) {
        currentVideoRef.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer loop
  useEffect(() => {
    let t;
    if (isRecording) {
      t = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  const handleStartRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    const stream = videoRef.current.srcObject;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks((prev) => [...prev, e.data]);
      }
    };
    
    mediaRecorder.start(1000); // chunk every second
    setIsRecording(true);
    setRecordedChunks([]); // reset
    setTimer(0);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSaveToDevice = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = `Bikemate_Dashcam_${new Date().toISOString().slice(0,10)}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
    setRecordedChunks([]);
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="w-full min-h-screen bg-black absolute inset-0 z-50 flex flex-col pt-4">
      {/* Top HUD */}
      <div className="px-6 py-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0">
        <Link href="/dashboard" className="text-white bg-white/10 p-2 rounded-full backdrop-blur-md">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
        </Link>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            {isRecording && <span className="w-3 h-3 rounded-full bg-[#FF2E2E] animate-pulse" />}
            <span className="text-sm font-black text-white tracking-widest">{isRecording ? "REC" : "STANDBY"}</span>
          </div>
          {isRecording && <span className="text-xs font-black text-[#FF2E2E] drop-shadow-md">{formatTime(timer)}</span>}
        </div>
      </div>

      {/* Video Stream */}
      <div className="relative flex-1 bg-[#0A0A0A] overflow-hidden rounded-3xl mx-4 mb-4 border border-white/5 flex items-center justify-center">
        {errorMsg ? (
          <div className="text-center px-6">
            <span className="text-4xl mb-4 block">📷</span>
            <p className="text-sm font-bold text-red-400">{errorMsg}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105"
          />
        )}

        {/* Reticle UI Overlay */}
        <div className="absolute inset-0 pointer-events-none border border-white/10 m-4 rounded-xl flex items-center justify-center opacity-30">
           <div className="w-10 h-10 border border-white rounded-full"></div>
           <div className="absolute top-1/2 left-0 w-4 h-[1px] bg-white"></div>
           <div className="absolute top-1/2 right-0 w-4 h-[1px] bg-white"></div>
           <div className="absolute top-0 left-1/2 w-[1px] h-4 bg-white"></div>
           <div className="absolute bottom-0 left-1/2 w-[1px] h-4 bg-white"></div>
        </div>

        {/* Speed / Coords Overlay Mock */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between z-20 pointer-events-none opacity-80 mix-blend-difference">
          <div className="text-white text-[0.65rem] font-bold uppercase tracking-widest">
            {user?.name || "RIDER"} {/* AI GUARDIAN ACTIVE */}
          </div>
          <div className="text-white text-[0.65rem] font-bold uppercase tracking-widest text-right">
            0 KM/H
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pb-8 px-8 flex flex-col items-center justify-center gap-6 z-20">
        {!isRecording ? (
          <button 
            onClick={handleStartRecording}
            className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]"
          >
            <div className="w-14 h-14 bg-[#FF2E2E] rounded-full"></div>
          </button>
        ) : (
          <button 
            onClick={handleStopRecording}
            className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-[0_0_50px_rgba(255,46,46,0.2)]"
          >
            <div className="w-10 h-10 bg-[#FF2E2E] rounded-md animate-pulse"></div>
          </button>
        )}

        {recordedChunks.length > 0 && !isRecording && (
          <div className="w-full flex gap-3 animate-page-enter">
             <button onClick={handleSaveToDevice} className="btn w-full bg-emerald-500 text-black border-none uppercase tracking-widest font-black text-xs py-4">
               💾 Save Video (Offline)
             </button>
             <button onClick={() => setRecordedChunks([])} className="btn w-full bg-white/10 border-white/20 text-white uppercase tracking-widest font-black text-xs py-4">
               🗑 Discard
             </button>
          </div>
        )}
        
        <p className="text-[0.55rem] text-[#555] font-black uppercase tracking-widest text-center mt-2">
          100% PRIVATE. Zero Server Uploads. Saved inside Gallery.
        </p>
      </div>
    </div>
  );
}
