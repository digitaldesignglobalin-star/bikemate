import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req) {
  try {
    const { amount, currency = "INR", receipt } = await req.json();
    
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === "rzp_test_your_key_id_here") {
      return NextResponse.json({ 
        success: false, 
        message: "Razorpay keys are not configured" 
      }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amount * 100, // paise
      currency,
      receipt: receipt || `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    
    if (!order) {
      return NextResponse.json({ success: false, message: "Order creation failed" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      order,
      key_id: keyId 
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
