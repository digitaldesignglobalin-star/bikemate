import nodemailer from 'nodemailer';

const getTransporter = async () => {
    const useRealSMTP = process.env.SMTP_USER && process.env.SMTP_PASS;
    
    if (useRealSMTP) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPMail = async (email, otp) => {
    try {
        const transporter = await getTransporter();
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #FFFFFF; padding: 40px; border-radius: 20px; border: 1px solid #333; text-align: center;">
                <h1 style="color: #FF2E2E; font-size: 28px; margin-bottom: 30px; letter-spacing: 2px;">BIKEMATE SECURITY</h1>
                <p style="font-size: 16px; color: #B0B0B0; margin-bottom: 30px;">Your security verification code is below. This code is valid for 10 minutes.</p>
                
                <div style="background: #1A1A1A; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px dashed #FF2E2E;">
                    <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #FFFFFF;">${otp}</span>
                </div>
                
                <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
            </div>
        `;

        const mailInfo = await transporter.sendMail({
            from: '"Bikemate Security" <security@bikemate.cc>',
            to: email,
            subject: `${otp} is your Bikemate Verification Code`,
            html: htmlContent,
        });

        if (!process.env.SMTP_USER) {
            console.log("\n-----------------------------------------");
            console.log("OTP SENT (MOCK: ETHEREAL)");
            console.log("OTP:", otp);
            console.log("VIEW TEST EMAIL: %s", nodemailer.getTestMessageUrl(mailInfo));
            console.log("-----------------------------------------\n");
        }

        return true;
    } catch (error) {
        console.error("OTP Mail Error:", error);
        return false;
    }
};
