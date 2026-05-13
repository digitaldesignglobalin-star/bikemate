import nodemailer from "nodemailer";

// ── SMTP Transporter (Hostinger) ──
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // SSL for port 465
  auth: {
    user: process.env.SMTP_USER || "noreply@bikemet.in",
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"BIKEMET" <${process.env.SMTP_USER || "noreply@bikemet.in"}>`;

// ── Send Generic Email ──
export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ── Welcome Email Template ──
export async function sendWelcomeEmail(user) {
  const name = user.name || "Rider";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.05);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#FF2E2E 0%,#CC0000 100%);padding:40px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:32px;font-weight:900;margin:0;letter-spacing:2px;">BIKEMET</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:8px 0 0;letter-spacing:3px;text-transform:uppercase;">Ride Safe. Stay Connected.</p>
    </div>
    
    <!-- Body -->
    <div style="padding:40px 32px;">
      <h2 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;">Welcome aboard, ${name}! 🏍️</h2>
      <p style="color:#999;font-size:14px;line-height:1.8;margin:0 0 24px;">
        Your BIKEMET account is now active. You've just joined India's most advanced rider safety platform.
      </p>
      
      <!-- Feature Cards -->
      <div style="margin:24px 0;">
        <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:12px;">
          <h3 style="color:#FF2E2E;font-size:14px;font-weight:800;margin:0 0 4px;">🚨 SOS Emergency</h3>
          <p style="color:#888;font-size:12px;margin:0;">One-tap emergency alert to your guardians with GPS location.</p>
        </div>
        <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:12px;">
          <h3 style="color:#FACC15;font-size:14px;font-weight:800;margin:0 0 4px;">🏷️ QR Safety Sticker</h3>
          <p style="color:#888;font-size:12px;margin:0;">Generate a scannable sticker with your emergency info for your helmet.</p>
        </div>
        <div style="background:#1a1a1a;border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:12px;">
          <h3 style="color:#22C55E;font-size:14px;font-weight:800;margin:0 0 4px;">📍 Live Tracking</h3>
          <p style="color:#888;font-size:12px;margin:0;">Share real-time location with family during long rides.</p>
        </div>
      </div>
      
      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="https://bikemet.in/profile" style="display:inline-block;background:#FF2E2E;color:#fff;padding:14px 40px;border-radius:12px;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Complete Your Profile</a>
      </div>
      
      <p style="color:#555;font-size:12px;text-align:center;margin:24px 0 0;">
        💡 Tip: Set your emergency contacts and blood group in your profile for maximum safety.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
      <p style="color:#444;font-size:11px;margin:0;">
        © ${new Date().getFullYear()} BIKEMET · <a href="https://bikemet.in/privacy" style="color:#666;text-decoration:none;">Privacy</a> · <a href="https://bikemet.in/terms" style="color:#666;text-decoration:none;">Terms</a>
      </p>
      <p style="color:#333;font-size:10px;margin:8px 0 0;">
        This email was sent to ${user.email || user.phone}. You received this because you created a BIKEMET account.
      </p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: user.email,
    subject: `Welcome to BIKEMET, ${name}! 🏍️`,
    html,
  });
}

// ── OTP Email Template ──
export async function sendOtpEmail(email, otp) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.05);">
    <div style="background:linear-gradient(135deg,#FF2E2E 0%,#CC0000 100%);padding:24px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0;letter-spacing:2px;">BIKEMET</h1>
    </div>
    <div style="padding:40px 32px;text-align:center;">
      <h2 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 12px;">Email Verification Code</h2>
      <p style="color:#888;font-size:13px;margin:0 0 32px;">Use this code to verify your email address. It expires in 10 minutes.</p>
      <div style="background:#0A0A0A;border:2px solid #FF2E2E;border-radius:16px;padding:24px;display:inline-block;">
        <span style="color:#fff;font-size:36px;font-weight:900;letter-spacing:12px;">${otp}</span>
      </div>
      <p style="color:#555;font-size:11px;margin:24px 0 0;">If you didn't request this, ignore this email.</p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
      <p style="color:#333;font-size:10px;margin:0;">© ${new Date().getFullYear()} BIKEMET</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject: `${otp} - Your BIKEMET Verification Code`,
    html,
  });
}
