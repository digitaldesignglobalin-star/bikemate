import { Montserrat } from "next/font/google";
import { AuthProvider } from "../components/AuthContext";
import { CartProvider } from "../components/CartContext";
import Navigation from "../components/Navigation";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata = {
  title: "BIKEMET — Ride Safe, Ride Together",
  description: "Your ride-or-die safety companion.",
};

export const viewport = {
  themeColor: "#0D0D0D",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} antialiased`}
    >
      <body suppressHydrationWarning className="min-h-screen font-sans bg-bh-bg text-white pt-16 md:pt-20 pb-24 md:pb-8">
        <AuthProvider>
          <CartProvider>
            <Navigation />
            <main className="w-full">
              {children}
            </main>

            <footer className="w-full py-10 border-t border-white/5 bg-[#0D0D0D]">
              <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center text-center gap-4">
                <div className="flex items-center justify-center gap-6 text-xs font-black uppercase tracking-widest text-[#555] mb-2 flex-wrap">
                  <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a>
                  <a href="/returns" className="hover:text-white transition-colors">Return Policy</a>
                </div>
                <p className="text-[0.65rem] text-[#888] tracking-wider leading-relaxed">
                  © Copyright to Bikemet (A sister brand of Design Global Technology) | Assets managed by Design Global Technology
                </p>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
