"use client";
import { useState } from "react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("email");
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleSendOtp = () => {
    if (!newEmail.includes("@")) return setMsg({ type: "error", text: "Invalid admin email format." });
    setOtpSent(true);
    setMsg({ type: "success", text: `Verification OTP sent to ${newEmail} (Use 123456)` });
  };

  const handleVerifyOtp = () => {
    if (otp === "123456") {
      setMsg({ type: "success", text: "Admin master email successfully updated." });
      setOtpSent(false);
    } else {
      setMsg({ type: "error", text: "Invalid OTP. Use 123456 for the override." });
    }
  };

  const handleUpdatePassword = () => {
    if (passwords.new !== passwords.confirm) return setMsg({ type: "error", text: "Passwords do not match." });
    if (passwords.new.length < 6) return setMsg({ type: "error", text: "Password must be at least 6 characters." });
    setMsg({ type: "success", text: "Master Admin password updated successfully." });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="max-w-4xl animate-page-enter">
      <h1 className="text-3xl font-black font-heading tracking-tight mb-2">Security Settings</h1>
      <p className="text-[#555] text-sm mb-8">Manage Master Admin authentication</p>

      <div className="glass-card p-8 border-white/5 bg-[#111]">
        <div className="flex gap-4 border-b border-white/10 mb-8">
          <button 
            onClick={() => { setActiveTab("email"); setMsg({}); }} 
            className={`pb-3 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === "email" ? "text-[#FF2E2E] border-b-2 border-[#FF2E2E]" : "text-[#555] hover:text-white"}`}
          >
            Update Email
          </button>
          <button 
            onClick={() => { setActiveTab("password"); setMsg({}); }} 
            className={`pb-3 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === "password" ? "text-[#FF2E2E] border-b-2 border-[#FF2E2E]" : "text-[#555] hover:text-white"}`}
          >
            Change Password
          </button>
        </div>

        {msg.text && (
          <div className={`p-4 rounded-xl text-sm font-bold mb-6 ${msg.type === "error" ? "bg-[#FF2E2E]/10 text-[#FF2E2E] border border-[#FF2E2E]/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
            {msg.text}
          </div>
        )}

        {/* Update Email Panel */}
        {activeTab === "email" && (
          <div className="max-w-md space-y-5">
            <div>
              <label className="text-[0.65rem] font-black text-[#666] uppercase tracking-widest block mb-1.5 ml-1">New Admin Email</label>
              <input 
                type="email" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)}
                disabled={otpSent}
                placeholder="admin@master.com" 
                className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-sm focus:border-[#FF2E2E] outline-none transition-colors"
              />
            </div>
            
            {otpSent ? (
              <div className="animate-page-enter">
                <label className="text-[0.65rem] font-black text-[#666] uppercase tracking-widest block mb-1.5 ml-1">Authentication OTP</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="------" 
                  className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-xl tracking-[0.75em] text-center font-black focus:border-[#FF2E2E] outline-none transition-colors"
                />
                <button onClick={handleVerifyOtp} className="btn btn-primary w-full py-4 mt-6 uppercase tracking-widest font-black text-sm">
                  Verify & Update Domain
                </button>
              </div>
            ) : (
              <button onClick={handleSendOtp} disabled={!newEmail} className="btn btn-outline border-white/10 hover:border-[#FF2E2E]/50 w-full py-4 mt-2 uppercase tracking-widest font-black text-sm">
                Request Authorization OTP
              </button>
            )}
          </div>
        )}

        {/* Change Password Panel */}
        {activeTab === "password" && (
          <div className="max-w-md space-y-5">
            <div>
              <label className="text-[0.65rem] font-black text-[#666] uppercase tracking-widest block mb-1.5 ml-1">Current Password (Or Panel PIN)</label>
              <input 
                type="password" 
                value={passwords.current} 
                onChange={e => setPasswords({...passwords, current: e.target.value})}
                placeholder="••••••••••••" 
                className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-sm focus:border-[#FF2E2E] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-black text-[#666] uppercase tracking-widest block mb-1.5 ml-1">New Master Password</label>
              <input 
                type="password" 
                value={passwords.new} 
                onChange={e => setPasswords({...passwords, new: e.target.value})}
                placeholder="••••••••••••" 
                className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-sm focus:border-[#FF2E2E] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[0.65rem] font-black text-[#666] uppercase tracking-widest block mb-1.5 ml-1">Verify New Password</label>
              <input 
                type="password" 
                value={passwords.confirm} 
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                placeholder="••••••••••••" 
                className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-sm focus:border-[#FF2E2E] outline-none transition-colors"
              />
            </div>
            <button onClick={handleUpdatePassword} disabled={!passwords.new || !passwords.confirm} className="btn btn-primary w-full py-4 mt-2 uppercase tracking-widest font-black text-sm">
              Enforce New Password
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
