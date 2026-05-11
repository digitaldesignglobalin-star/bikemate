import nodemailer from 'nodemailer';

export const sendPurchaseMail = async (req, res) => {
  try {
    const { type, amount, customer, cart } = req.body;
    
    // Check if the user has provided real Gmail SMTP credentials
    const useRealSMTP = process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== "ashishganguly122@gmail.com";
    
    let transporter;
    
    if (useRealSMTP) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS, // 16 digit app password
        },
      });
    } else {
      // Fallback: Create an Ethereal test account if no real keys are provided
      console.log("No real SMTP credentials found. Simulating via Ethereal Mail...");
      let testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const isSub = type === 'subscription';
    
    // Format the cart items for the email
    const cartHtml = isSub 
      ? `<li>Premium Bikemate Subscription - ₹${amount}</li>`
      : cart?.map(item => `<li>${item.name} (x${item.quantity || 1}) - ₹${item.price}</li>`).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w-width: 600px; margin: 0 auto; background: #0D0D0D; color: #FFFFFF; padding: 30px; border-radius: 10px; border: 1px solid #333;">
         <h1 style="color: #FF2E2E;">BIKEMATE NOTIFICATION</h1>
         <h2 style="border-bottom: 1px solid #333; padding-bottom: 10px;">${isSub ? 'Subscription Activated!' : 'New Order Confirmed!'}</h2>
         
         <p><strong>Customer Name:</strong> ${customer?.name}</p>
         <p><strong>Customer Email:</strong> ${customer?.email}</p>
         ${!isSub ? `<p><strong>Delivery Address:</strong> ${customer?.address}</p>` : ''}
         <p><strong>Phone:</strong> ${customer?.phone}</p>
         
         <h3 style="margin-top: 20px;">Order Details:</h3>
         <ul style="background: #1A1A1A; padding: 15px 30px; border-radius: 8px;">
            ${cartHtml}
         </ul>
         
         <h3 style="color: #FF2E2E; font-size: 24px;">Total Paid: ₹${amount}</h3>
         
         <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            This copy was dispatched to: ashishganguly122@gmail.com (ADMIN) and ${customer?.email} (RIDER).
         </p>
      </div>
    `;

    // Send to Admin
    let adminInfo = await transporter.sendMail({
      from: '"Bikemate System" <noreply@bikemate.cc>',
      to: "ashishganguly122@gmail.com",
      subject: `[ADMIN] New ${isSub ? 'Subscription' : 'Order'} - ₹${amount}`,
      html: htmlContent,
    });

    // Send to Customer
    let customerInfo = await transporter.sendMail({
      from: '"Bikemate System" <noreply@bikemate.cc>',
      to: customer?.email || "rider@example.com",
      subject: `Welcome to Bikemate! Your ${isSub ? 'Subscription' : 'Receipt'}`,
      html: htmlContent,
    });

    console.log("-----------------------------------------");
    console.log("EMAILS SENT SUCCESSFULLY VIA ETHEREAL SMTP");
    console.log("ADMIN URL: %s", nodemailer.getTestMessageUrl(adminInfo));
    console.log("RIDER URL: %s", nodemailer.getTestMessageUrl(customerInfo));
    console.log("-----------------------------------------");

    res.status(200).json({ success: true, message: "Emails dispatched successfully" });

  } catch (error) {
    console.error("Mail routing failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
