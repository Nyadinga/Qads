const nodemailer = require("nodemailer");

console.log("SMTP DEBUG:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  from: process.env.MAIL_FROM,
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendWhatsAppOtp = async ({ phone, otpCode }) => {
  const mode = process.env.WHATSAPP_OTP_MODE || "stub_fail";

  if (mode === "stub_success") {
    console.log(`[WHATSAPP OTP - DEV MODE] ${phone}: ${otpCode}`);
    return {
      success: true,
      channel: "whatsapp",
      targetValue: phone,
    };
  }

  const error = new Error("WhatsApp verification is unavailable");
  error.code = "WHATSAPP_UNAVAILABLE";
  throw error;
};

const sendEmailOtp = async ({ email, otpCode }) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Your QADS verification code",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your QADS account</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otpCode}</p>
        <p>This code will expire in ${process.env.OTP_EXPIRES_MINUTES || 5} minutes.</p>
      </div>
    `,
  });

  return {
    success: true,
    channel: "email",
    targetValue: email,
  };
};

module.exports = {
  sendWhatsAppOtp,
  sendEmailOtp,
};