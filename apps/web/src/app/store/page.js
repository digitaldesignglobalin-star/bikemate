"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StorePage() {
  const router = useRouter();
  const { addToCart, cartCount, cartTotal, isCartOpen, setIsCartOpen, cart, removeFromCart } = useCart();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch("/api/products", { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        if (data.success && data.products?.length > 0) {
          const formatted = data.products.map(p => ({
            id: p.id.toString(),
            name: p.name,
            price: p.price,
            mrp: p.mrp || null,
            img: p.images?.[0] || "/assets/images/goodies.png",
            category: p.category,
            description: p.description || "",
            stock: p.stock
          }));
          setProducts(formatted);
        }
      } catch {
        // API unavailable — show empty catalog
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="animate-page-enter w-full max-w-7xl mx-auto mt-12 px-4 pb-32">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight">Bikemate Store</h1>
          <p className="text-bh-gray text-base mt-2">Premium gear for the modern rider.</p>
        </div>
        
        {/* Cart Trigger */}
        <button 
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="btn btn-glass px-8 py-4 rounded-2xl flex items-center gap-4 group"
        >
          <div className="relative">
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span className="absolute -top-3 -right-3 w-5 h-5 bg-bh-primary text-[10px] font-black flex items-center justify-center rounded-full animate-bounce">{cartCount}</span>}
          </div>
          <span className="font-bold">₹{cartTotal}</span>
        </button>
      </div>

      {/* ── Featured Product: QR Sticker Pack ── */}
      <div className="mb-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FF2E2E]/10 to-transparent border border-[#FF2E2E]/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 group hover:border-[#FF2E2E]/40 transition-all">
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none text-[12rem] leading-none">🏷️</div>
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF2E2E]/10 border border-[#FF2E2E]/20 rounded-full text-[0.65rem] font-black text-[#FF2E2E] uppercase tracking-[0.2em] mb-4">
              ⭐ Featured Product
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-heading tracking-tight mb-3">QR Safety Sticker Pack</h2>
            <p className="text-[#B0B0B0] text-sm leading-relaxed mb-4 max-w-md">
              2x Premium waterproof QR helmet stickers with your emergency info + a Surprise Gift Box. Scannable by any phone — no app needed.
            </p>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-black text-white">₹429</span>
              <span className="text-sm text-bh-green font-black uppercase tracking-widest pb-1">Free Delivery</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => router.push('/sticker')}
                className="btn btn-primary px-8 py-4 font-black uppercase tracking-widest text-xs shadow-glow-red"
              >
                Customize & Order
              </button>
              <button 
                onClick={() => addToCart({ id: "sticker-pack", name: "QR Sticker Pack (2 Stickers + Gift Box)", price: 429, img: "/assets/images/goodies.png", category: "Safety" })}
                className="btn btn-outline border-white/10 px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-white/5"
              >
                Quick Add to Cart
              </button>
            </div>
          </div>
          <div className="w-48 h-48 md:w-56 md:h-56 relative shrink-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0A0A0A]">
            <Image src="/assets/images/goodies.png" alt="QR Sticker Pack" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
          </div>
        </div>
      </div>

      {/* ── Products from API ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col h-full">
              <div className="aspect-[4/5] rounded-[2rem] bg-white/[0.03] animate-pulse border border-white/5 mb-6"></div>
              <div className="h-4 bg-white/[0.03] rounded-lg mb-2 animate-pulse"></div>
              <div className="h-6 bg-white/[0.03] rounded-lg w-1/3 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-[2px] bg-[#FF2E2E] rounded-full" />
            <h3 className="text-[0.7rem] font-black text-[#444] uppercase tracking-[0.3em]">All Products</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col h-full">
                <div className="relative aspect-[4/5] rounded-[2rem] bg-bh-card border border-white/5 overflow-hidden mb-6 transition-all duration-500 group-hover:border-bh-primary/30 group-hover:shadow-[0_20px_40px_-15px_rgba(255,46,46,0.1)]">
                  <Image 
                    src={product.img} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 glass-nav rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">{product.category}</span>
                  </div>
                  {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-[10px] font-black text-yellow-400 uppercase tracking-widest">Only {product.stock} left</span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-sm font-black text-white uppercase tracking-widest">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="px-2 flex-1 flex flex-col">
                  <h3 className="text-lg font-black font-heading tracking-tight mb-1 group-hover:text-bh-primary transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xl font-black text-white">₹{product.price}</span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-sm text-[#555] line-through font-bold">₹{product.mrp}</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="btn btn-outline btn-full group-hover:bg-bh-primary group-hover:border-bh-primary group-hover:text-white transition-all py-4 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {product.stock === 0 ? "Sold Out" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Empty state — no products from API yet */
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">🏍️</div>
          <h3 className="text-xl font-black text-white mb-2">More Products Coming Soon</h3>
          <p className="text-sm text-[#555] max-w-sm mx-auto leading-relaxed">
            We&apos;re curating premium rider gear. Check back soon for new drops!
          </p>
        </div>
      )}

      {/* Slide-out Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-bh-bg/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#121212] border-l border-white/10 shadow-2xl animate-slide-left flex flex-col h-full">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-black font-heading tracking-tight">Shopping Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">✕</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-bh-gray gap-4">
                    <span className="text-4xl text-bh-gray-darker">🛒</span>
                    <p className="font-bold">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-5 items-center bg-white/[0.03] p-4 rounded-2xl border border-white/5 group">
                       <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-white/5">
                          <Image src={item.img} alt={item.name} fill className="object-cover" />
                       </div>
                       <div className="flex-1">
                          <div className="font-bold text-sm leading-tight mb-1">{item.name}</div>
                          <div className="text-bh-primary font-black text-sm">₹{item.price} <span className="text-bh-gray-dark text-[10px]">x {item.quantity}</span></div>
                       </div>
                       <button onClick={() => removeFromCart(item.id)} className="text-bh-gray-dark hover:text-bh-red transition-colors text-xs font-bold uppercase tracking-widest px-2">Remove</button>
                    </div>
                  ))
                )}
             </div>

             <div className="p-8 bg-bh-card border-t border-white/5">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-bh-gray font-bold uppercase tracking-widest text-xs">Total Amount</span>
                   <span className="text-3xl font-black font-heading">₹{cartTotal}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  className="btn btn-primary btn-lg btn-full shadow-glow-red"
                  onClick={() => router.push("/checkout?type=store")}
                >
                  Checkout Now
                </button>
                <p className="text-center text-[10px] text-bh-gray-dark mt-4 font-bold uppercase tracking-widest">Free Shipping for Premium Members</p>
             </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-left { animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
