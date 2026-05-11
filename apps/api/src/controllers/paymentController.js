import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    
    // Check if the user really provided Razorpay details
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "rzp_test_your_key_id_here") {
      return res.status(400).json({ 
        success: false, 
        message: "Razorpay Key ID is not configured in .env" 
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    
    if (!order) return res.status(500).send("Some error occured");

    res.json({ 
      success: true, 
      order,
      key_id: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
