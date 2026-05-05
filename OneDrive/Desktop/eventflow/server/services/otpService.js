// OTP Service — Twilio or mock fallback
let twilioClient = null;

if (
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
) {
  const twilio = require("twilio");
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

exports.sendOtp = async (phone, otp) => {
  if (!twilioClient) {
    // Mock: just log the OTP
    console.log(`📱 [MOCK OTP] Phone: ${phone} | OTP: ${otp}`);
    return { success: true, mock: true };
  }

  await twilioClient.messages.create({
    body: `Your EventFlow verification code is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${phone}`,
  });

  return { success: true };
};
