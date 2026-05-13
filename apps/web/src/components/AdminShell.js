"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard",  icon: "📊", href: "/admin/dashboard" },
  { label: "Members",    icon: "👥", href: "/admin/users"     },
  { label: "Feedback",   icon: "💬", href: "/admin/feedback"  },
  { label: "Products",   icon: "📦", href: "/admin/products"  },
  { label: "Orders",     icon: "🛒", href: "/admin/orders"    },
  { label: "Settings",   icon: "⚙️", href: "/admin/settings"  },
];

const ADMIN_PIN = "bikemate2026";

export default function AdminShell({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  
  const [booting, setBooting] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Check 1: Does the user have a valid JWT token from logging in?
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      // No login session — redirect to login page
      router.push("/login");
      return;
    }

    // Check if user has admin role
    let user = null;
    try { user = JSON.parse(userStr); } catch {}
    
    setHasToken(true);

    // Check 2: Has the admin PIN been entered?
    const pinOk = localStorage.getItem("bikemate_admin_auth") === "true";
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
    
    if (pinOk || isAdmin) {
      setAuthed(true);
    }
    
    setBooting(false);
  }, [router]);

  if (booting) return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0D0D0D] z-[999]">
      <div className="w-10 h-10 rounded-full border-2 border-[#FF2E2E] border-t-transparent animate-spin" />
    </div>
  );

  // If no token, we already redirected — show nothing
  if (!hasToken) return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0D0D0D] z-[999]">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#FF2E2E] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-[#555] text-sm">Redirecting to login...</p>
      </div>
    </div>
  );

  /* ── PIN Lock Screen ─── */
  if (!authed) {
    const handlePin = (e) => {
      e.preventDefault();
      if (pin === ADMIN_PIN) {
        localStorage.setItem("bikemate_admin_auth", "true");
        setAuthed(true);
      } else {
        setPinError("Invalid PIN. Contact the administrator.");
        setPin("");
      }
    };
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-[#0D0D0D] z-[999]">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">🔐</div>
            <h1 className="text-3xl font-black font-heading tracking-tight mb-2">Admin Panel</h1>
            <p className="text-[#555] text-sm">Bikemate Operations Centre</p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
            <form onSubmit={handlePin} className="space-y-5">
              <div>
                <label className="text-[0.6rem] font-black text-[#444] uppercase tracking-widest block mb-2">Admin PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setPinError(""); }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 text-center text-xl tracking-[0.5em] outline-none focus:border-[#FF2E2E] transition-colors"
                  autoFocus
                />
                {pinError && <p className="text-[#FF2E2E] text-xs mt-2 text-center">{pinError}</p>}
              </div>
              <button type="submit" className="btn btn-primary btn-full py-4 text-sm font-black uppercase tracking-widest">
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ── Admin Shell ─── */
  return (
    <div className="fixed inset-0 flex bg-[#080808] z-[998] overflow-hidden">
      {/* Sidebar */}
      <aside className={`h-full bg-[#0D0D0D] border-r border-white/5 flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF2E2E] rounded-xl flex items-center justify-center text-sm shrink-0">🏍️</div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-xs font-black text-white">BIKEMATE</div>
              <div className="text-[0.55rem] text-[#444] uppercase tracking-widest">Admin Panel</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[#555] hover:text-white hover:bg-white/10 transition-all text-xs shrink-0"
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  active
                    ? "bg-[#FF2E2E]/10 text-[#FF2E2E] border border-[#FF2E2E]/20"
                    : "text-[#555] hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!collapsed && <span className="text-sm font-bold">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#444] hover:text-white hover:bg-white/5 transition-all">
            <span className="shrink-0 text-base">🌐</span>
            {!collapsed && <span className="text-xs font-bold">View Site</span>}
          </Link>
          <button
            onClick={() => { 
              localStorage.removeItem("bikemate_admin_auth"); 
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("isPremium");
              router.push("/"); 
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[#444] hover:text-[#FF2E2E] hover:bg-[#FF2E2E]/5 transition-all"
          >
            <span className="shrink-0 text-base">🚪</span>
            {!collapsed && <span className="text-xs font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
