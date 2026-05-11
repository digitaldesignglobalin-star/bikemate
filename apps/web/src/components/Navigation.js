"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

const navLinks = [
  { name: "Home",      path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Tracker",   path: "/tracker" },
  { name: "Diary",     path: "/diary" },
  { name: "Vault",     path: "/documents" },
  { name: "Community", path: "/community" },
  { name: "Store",     path: "/store" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* ── Desktop Top Nav ───────────────────────────────── */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 z-50 items-center px-8 gap-8">

        {/* Logo */}
        <Link href="/" className="font-heading text-2xl font-black tracking-tight flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10">
            <Image src="/assets/images/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">
            BIKEMET
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 ml-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={user || link.path === "/" || link.path === "/store" ? link.path : "/login"}
              className={`text-sm font-medium py-2 relative transition-colors hover:text-white ${
                pathname === link.path ? "text-white" : "text-[#B0B0B0]"
              }`}
            >
              {link.name}
              {pathname === link.path && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#FF2E2E] rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-4 ml-4 shrink-0">
            <span className="text-xs font-bold text-[#B0B0B0] uppercase tracking-widest">{user.name?.split(" ")[0]}</span>
            <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <Link href="/login"  className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Join</Link>
          </div>
        )}

        {/* SOS */}
        <Link href="/sos" className="btn btn-primary btn-sm ml-2 shrink-0 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SOS
        </Link>
      </nav>

      {/* ── Mobile Top Header ─────────────────────────────── */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-center">
        <Link href="/" className="flex flex-col items-center">
          <span className="font-heading text-xl font-black tracking-[0.2em] uppercase bg-gradient-to-br from-[#FF2E2E] to-[#FF6B6B] bg-clip-text text-transparent">
            BIKEMET
          </span>
          <span className="text-[0.5rem] font-black text-[#555] uppercase tracking-[0.4em] -mt-0.5">
            RIDE SAFE · RIDE TOGETHER
          </span>
        </Link>
      </nav>

      {/* ── Mobile Bottom Nav ─────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[#0A0A0A]/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around z-50 pb-[env(safe-area-inset-bottom,0)] px-2">

        {/* Panel */}
        <MobileNavItem href={user ? "/dashboard" : "/login"} label="Panel" active={pathname === "/dashboard"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
        </MobileNavItem>

        {/* Vault */}
        <MobileNavItem href={user ? "/documents" : "/login"} label="Vault" active={pathname === "/documents"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </MobileNavItem>

        {/* SOS Center Button */}
        <Link href={user ? "/sos" : "/login"} className="relative z-20 -mt-8 flex flex-col items-center group">
          <div className="w-14 h-14 rounded-full bg-[#FF2E2E] flex items-center justify-center shadow-[0_0_30px_rgba(255,46,46,0.45)] transition-all group-active:scale-90 animate-[sosPulse_3s_ease-in-out_infinite]">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span className="mt-1 text-[7px] font-black text-[#FF2E2E] uppercase tracking-[0.2em] opacity-80">SOS</span>
        </Link>

        {/* Community or Admin */}
        {user?.role === "ADMIN" ? (
          <MobileNavItem href="/admin/products" label="Admin" active={pathname.startsWith("/admin")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </MobileNavItem>
        ) : (
          <MobileNavItem href={user ? "/community" : "/login"} label="Rides" active={pathname === "/community"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </MobileNavItem>
        )}

        {/* Profile */}
        <MobileNavItem href={user ? "/profile" : "/login"} label="Me" active={pathname === "/profile"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </MobileNavItem>
      </nav>

      {/* Desktop floating SOS */}
      <Link href="/sos" className="hidden md:flex fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#FF2E2E] to-[#CC0000] items-center justify-center z-50 shadow-[0_0_50px_rgba(255,46,46,0.35)] transition-all hover:scale-110">
        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </Link>

      <style jsx global>{`
        @keyframes sosPulse {
          0%,100% { box-shadow: 0 0 20px rgba(255,46,46,0.35); }
          50%      { box-shadow: 0 0 40px rgba(255,46,46,0.55), 0 0 70px rgba(255,46,46,0.15); }
        }
      `}</style>
    </>
  );
}

/** Reusable mobile nav icon+label item */
function MobileNavItem({ href, label, active, children }) {
  return (
    <Link
      href={href}
      className={`relative z-10 flex flex-col items-center gap-[3px] p-2 transition-all ${
        active ? "text-[#FF2E2E] scale-110" : "text-[#444] opacity-80 hover:text-[#888]"
      }`}
    >
      <span className="w-[18px] h-[18px]">{children}</span>
      <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}
