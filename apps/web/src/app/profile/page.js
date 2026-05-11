"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthContext";

export default function Profile() {
  const { user, logout, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    bikeModel: user?.bikeModel || "Yamaha MT-15",
    bikeRegNo: user?.bikeRegNo || "MH 02 AB 1234",
    bikeYear: user?.bikeYear || "2024",
    bloodGroup: user?.bloodGroup || "O+",
    allergies: user?.allergies || "None",
    medHistory: user?.medHistory || "None"
  }));

  // Security Settings States
  const [showSecurity, setShowSecurity] = useState(false);
  const [securityTab, setSecurityTab] = useState("email"); // email or password
  
  // Email Update State
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  // Password State
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [securityMsg, setSecurityMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const t = setTimeout(() => {
        setFormData(prev => {
          if (prev.name) return prev;
          return {
            name: user.name || "",
            email: user.email || "",
            bikeModel: user.bikeModel || "Yamaha MT-15",
            bikeRegNo: user.bikeRegNo || "MH 02 AB 1234",
            bikeYear: user.bikeYear || "2024",
            bloodGroup: user.bloodGroup || "O+",
            allergies: user.allergies || "None",
            medHistory: user.medHistory || "None"
          };
        });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSave = () => { updateUser(formData); setIsEditing(false); };

  // --- Security Functions ---
  const handleSendOtp = () => {
    if (!newEmail.includes("@")) return setSecurityMsg({ type: "error", text: "Invalid email" });
    setOtpSent(true);
    setSecurityMsg({ type: "success", text: "OTP sent to " + newEmail });
  };

  const handleVerifyOtp = () => {
    if (emailOtp === "123456") {
      updateUser({ email: newEmail });
      setFormData(prev => ({ ...prev, email: newEmail }));
      setSecurityMsg({ type: "success", text: "Email updated successfully!" });
      setTimeout(() => { setShowSecurity(false); setOtpSent(false); }, 2000);
    } else {
      setSecurityMsg({ type: "error", text: "Invalid OTP. Use 123456" });
    }
  };

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) return setSecurityMsg({ type: "error", text: "Passwords don't match" });
    if (passwords.new.length < 6) return setSecurityMsg({ type: "error", text: "Password too short" });
    setSecurityMsg({ type: "success", text: "Password updated successfully!" });
    setTimeout(() => { setShowSecurity(false); setPasswords({ current: "", new: "", confirm: "" }); }, 2000);
  };

  const sections = [
    {
      title: "Bike Details",
      rows: [
        { label: "Model", key: "bikeModel" },
        { label: "Reg. No.", key: "bikeRegNo" },
        { label: "Year", key: "bikeYear" },
      ],
    },
    {
      title: "Medical Info",
      rows: [
        { label: "Blood Group", key: "bloodGroup" },
        { label: "Allergies", key: "allergies" },
        { label: "Med History", key: "medHistory" },
      ],
    },
  ];

  const features = [
    { title: "My Subscription", desc: "View & upgrade plan", icon: "💎", color: "text-red-500", bg: "bg-red-500/10", path: "/subscription" },
    { title: "Safety QR Sticker", desc: "Generate digital QR", icon: "🏷️", color: "text-yellow-500", bg: "bg-yellow-500/10", path: "/sticker" },
    { title: "Live Location", desc: "Sharing settings", icon: "📍", color: "text-blue-500", bg: "bg-blue-500/10", path: "/tracker" },
    { title: "Document Vault", desc: "Insurance & PUC", icon: "📄", color: "text-green-500", bg: "bg-green-500/10", path: "/documents" },
  ];

  if (authLoading || !user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#FF2E2E]/30 border-t-[#FF2E2E] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-page-enter w-full max-w-4xl mx-auto mt-12 px-4 pb-32">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        
        {/* Left: Quick Profile Card */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-bh-primary to-transparent opacity-50"></div>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-bh-primary rounded-[2.5rem] blur-[20px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-bh-primary to-[#FF6B6B] flex items-center justify-center text-3xl font-black text-white shadow-2xl overflow-hidden border border-white/10">
                {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : 'R'}
              </div>
            </div>
            
            {isEditing ? (
              <div className="w-full space-y-3 mb-6">
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-center focus:border-bh-primary outline-none transition-all"
                />
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-[0.65rem] font-black uppercase tracking-widest text-[#FF2E2E] hover:text-white transition-colors"
                >
                  Done Editing
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black font-heading tracking-tight mb-1">{formData.name}</h2>
                <p className="text-sm text-bh-gray-dark mb-8">{formData.email}</p>
              </>
            )}
            
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className={`btn btn-sm w-full font-black uppercase tracking-widest ${isEditing ? 'btn-primary shadow-glow-red' : 'btn-outline border-white/10'}`}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
              <button onClick={logout} className="btn btn-ghost btn-sm w-full text-bh-red hover:bg-bh-red/5 mt-2">Logout</button>
            </div>
          </div>
        </div>

        {/* Right: Details & Features */}
        <div className="flex-1 w-full space-y-12">
          
          {/* Security Panel */}
          <div className="glass-card p-6 border-bh-primary/30 bg-[#FF2E2E]/[0.02]">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => { setSecurityTab("email"); setSecurityMsg({}); }} className={`text-sm font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${securityTab === "email" ? "text-[#FF2E2E] border-[#FF2E2E]" : "text-[#555] border-transparent hover:text-white"}`}>Update Email</button>
              <button onClick={() => { setSecurityTab("password"); setSecurityMsg({}); }} className={`text-sm font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${securityTab === "password" ? "text-[#FF2E2E] border-[#FF2E2E]" : "text-[#555] border-transparent hover:text-white"}`}>Change Password</button>
            </div>

            {securityMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold mb-4 ${securityMsg.type === "error" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                {securityMsg.text}
              </div>
            )}

            {securityTab === "email" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[0.65rem] font-black text-bh-gray uppercase tracking-widest ml-1 block mb-1">New Email Address</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={otpSent} placeholder="new@example.com" className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF2E2E] outline-none" />
                </div>
                {otpSent ? (
                  <div>
                    <label className="text-[0.65rem] font-black text-bh-gray uppercase tracking-widest ml-1 block mb-1">Enter 6-Digit OTP</label>
                    <input type="text" maxLength={6} value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ""))} placeholder="123456" className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-sm tracking-[0.5em] focus:border-[#FF2E2E] outline-none" />
                    <button onClick={handleVerifyOtp} className="btn btn-primary btn-sm w-full mt-4">Verify & Update</button>
                  </div>
                ) : (
                  <button onClick={handleSendOtp} disabled={!newEmail} className="btn btn-outline btn-sm w-full mt-2">Send OTP</button>
                )}
              </div>
            )}

            {securityTab === "password" && (
              <div className="space-y-4">
                <input type="password" placeholder="Current Password (Or OTP)" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF2E2E] outline-none" />
                <input type="password" placeholder="New Password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF2E2E] outline-none" />
                <input type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF2E2E] outline-none" />
                <button onClick={handlePasswordChange} disabled={!passwords.new} className="btn btn-primary w-full mt-2">Update Password</button>
              </div>
            )}
          </div>

          {/* Regular Profile Details */}
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-4">
                <h4 className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-[0.4em] font-heading">{section.title}</h4>
                <div className="h-[1px] bg-white/5 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.rows.map((row, rIdx) => (
                  <div key={rIdx} className="glass-card p-5 group hover:border-bh-primary/20 transition-all">
                    <div className="flex flex-col gap-2">
                       <span className="text-[0.6rem] font-black text-bh-gray uppercase tracking-widest leading-none">{row.label}</span>
                       {isEditing ? (
                          <input 
                            name={row.key}
                            value={formData[row.key]}
                            onChange={handleChange}
                            className="bg-transparent border-b border-white/10 w-full py-1 text-sm text-white font-black focus:border-bh-primary outline-none transition-all"
                          />
                       ) : (
                          <span className="text-sm text-white font-black group-hover:text-bh-primary transition-colors">{formData[row.key]}</span>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h4 className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-[0.4em] font-heading">Digital Ecosystem</h4>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <Link key={i} href={f.path} className="glass-card p-5 flex items-center gap-5 hover:border-bh-primary/30 hover:bg-bh-primary/[0.03] transition-all hover:translate-x-1 group">
                  <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-110`}>
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[0.95rem] font-black text-white">{f.title}</div>
                    <div className="text-[0.65rem] text-bh-gray uppercase tracking-widest font-bold mt-1">{f.desc}</div>
                  </div>
                  <svg className="text-bh-gray-darker group-hover:text-bh-primary transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
