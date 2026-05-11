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
      const STATIC_PRODUCTS = [
        { id: "tshirt-1",   name: "Rider Essential Tee",    price: 699,  img: "/assets/images/tshirt.png",  category: "Apparel" },
        { id: "keyring-1",  name: "Moto Carbon Keyring",    price: 249,  img: "/assets/images/keyring.png", category: "Accessories" },
        { id: "lanyard-1",  name: "Bikemate Pro Lanyard",   price: 199,  img: "/assets/images/lanyard.png", category: "Accessories" },
        { id: "goodies-1",  name: "Full Rider Goodies Box", price: 999,  img: "/assets/images/goodies.png", category: "Bundles" },
      ];

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000); // 3-second timeout

      try {
        const res = await fetch("http://localhost:5000/api/products", { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        if (data.success && data.products.length > 0) {
          const formatted = data.products.map(p => ({
            id: p.id.toString(),
            name: p.name,
            price: p.price,
            img: p.images?.[0] || "/assets/images/tshirt.png",
            category: p.category
          }));
          setProducts(formatted);
        } else {
          setProducts(STATIC_PRODUCTS);
        }
      } catch (error) {
        clearTimeout(timeout);
        // Backend offline or timed out — use static catalog
        setProducts(STATIC_PRODUCTS);
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

      {isLoading ? (
         <div className="text-bh-gray text-center w-full py-10 font-bold uppercase tracking-widest text-xs">Loading Catalog...</div>
      ) : (
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
              </div>
              
              <div className="px-2 flex-1 flex flex-col">
                <h3 className="text-lg font-black font-heading tracking-tight mb-1 group-hover:text-bh-primary transition-colors">{product.name}</h3>
                <div className="text-xl font-black text-white mb-6">₹{product.price}</div>
                
                <button 
                  onClick={() => addToCart(product)}
                  className="btn btn-outline btn-full group-hover:bg-bh-primary group-hover:border-bh-primary group-hover:text-white transition-all py-4"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
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
