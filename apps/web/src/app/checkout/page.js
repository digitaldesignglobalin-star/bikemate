"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../../components/CartContext";
import { useAuth } from "../../components/AuthContext";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "store";
  const plan = searchParams.get("plan") || "monthly";
  const cost = searchParams.get("cost") || "0";
  
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: ""
  });

  const getCheckoutContext = () => {
    if (type === "subscription") {
      return { title: "Premium Subscription", amount: parseInt(cost) || 30 };
    }
    if (type === "sticker") {
      return { title: "Smart Sticker Pack", amount: 399 };
    }
    return { title: "Store Checkout", amount: cartTotal };
  };

  const checkoutDetails = getCheckoutContext();

  const handleProceed = (e) => {
    e.preventDefault();
    if (checkoutDetails.amount === 0) {
      alert("Cart is empty");
      return;
    }
    
    // Store checkout session to simulate state passing
    sessionStorage.setItem("checkout_session", JSON.stringify({
      type,
      amount: checkoutDetails.amount,
      customer: formData,
      cart: type === 'store' ? cart : [{ name: checkoutDetails.title }]
    }));
    
    router.push("/payment");
  };

  return (
    <div className="animate-page-enter w-full max-w-3xl mx-auto mt-12 px-4 pb-32">
       <div className="mb-10 text-center">
         <h1 className="text-4xl font-black font-heading tracking-tight mb-2">Checkout Details</h1>
         <p className="text-bh-gray text-sm">Please confirm your billing and delivery information</p>
       </div>
       
       <div className="flex flex-col md:flex-row gap-8">
         <div className="flex-[2]">
            <form id="checkout-form" onSubmit={handleProceed} className="space-y-5 glass-card p-8">
               <div className="space-y-1">
                 <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Full Name</label>
                 <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all placeholder:text-bh-gray-darker" placeholder="Rider Name" />
               </div>
               <div className="space-y-1">
                 <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Email Address (For Invoices)</label>
                 <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all placeholder:text-bh-gray-darker" placeholder="rider@example.com" />
               </div>
               <div className="space-y-1">
                 <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Phone Number</label>
                 <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all placeholder:text-bh-gray-darker" placeholder="Your Phone Number" />
               </div>
               <div className="space-y-1">
                 <label className="text-[0.65rem] font-black text-bh-gray-dark uppercase tracking-widest ml-1">Full Delivery Address</label>
                 <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-[#0D0D0D] border border-white/5 rounded-xl p-4 text-sm focus:border-bh-primary outline-none transition-all h-24 placeholder:text-bh-gray-darker" placeholder="Flat, Street, City, ZIP"></textarea>
               </div>
            </form>
         </div>
         
         <div className="flex-1">
            <div className="glass-card p-6 bg-white/[0.02]">
               <h3 className="font-heading font-black text-lg mb-4">Order Summary</h3>
               <div className="border-b border-white/5 pb-4 mb-4">
                  <div className="flex justify-between text-sm text-bh-gray mb-2">
                     <span>{checkoutDetails.title}</span>
                     <span className="font-bold text-white">₹{checkoutDetails.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-bh-gray mb-2">
                     <span>Taxes & Fees</span>
                     <span className="font-bold text-white">₹0</span>
                  </div>
               </div>
               <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-black uppercase tracking-widest text-bh-gray">Total Payable</span>
                  <span className="text-3xl font-black font-heading text-bh-primary">₹{checkoutDetails.amount}</span>
               </div>
               
               <button form="checkout-form" type="submit" className="btn btn-primary btn-full shadow-glow-red py-4 text-sm">
                 Proceed to Payment
               </button>
            </div>
         </div>
       </div>
    </div>
  );
}
