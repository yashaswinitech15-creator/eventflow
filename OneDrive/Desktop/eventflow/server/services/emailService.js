const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Gmail or SMTP fallback
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Mock transporter for dev
  console.log("📧 Using mock email transporter (no EMAIL config found)");
  return {
    sendMail: async (opts) => {
      console.log(`📧 [MOCK EMAIL] To: ${opts.to} | Subject: ${opts.subject}`);
      return { messageId: `mock_${Date.now()}` };
    },
  };
};

const transporter = createTransporter();
const FROM = process.env.EMAIL_FROM || "EventFlow <noreply@eventflow.in>";

exports.sendWelcomeEmail = async (user) => {
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: "Welcome to EventFlow! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
        <h1 style="color:#6C3EF5">Welcome to EventFlow, ${user.name}!</h1>
        <p>Your account has been created successfully.</p>
        <p>Start exploring amazing events near you!</p>
        <a href="${process.env.CLIENT_URL}/events" 
           style="background:#6C3EF5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          Browse Events
        </a>
        <p style="color:#999;margin-top:24px;font-size:12px">EventFlow - Your Premier Event Platform</p>
      </div>
    `,
  });
};

exports.sendBookingConfirmation = async (user, booking, event) => {
  const eventDate = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Booking Confirmed: ${event.title} 🎟️`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
        <h1 style="color:#6C3EF5">Your booking is confirmed!</h1>
        <div style="background:#f5f5f5;border-radius:12px;padding:20px;margin:20px 0">
          <h2>${event.title}</h2>
          <p><strong>📅 Date:</strong> ${eventDate}</p>
          <p><strong>📍 Location:</strong> ${event.location?.address || "TBD"}</p>
          <p><strong>🎟️ Tickets:</strong> ${booking.quantity}</p>
          <p><strong>💰 Total:</strong> ₹${booking.totalAmount}</p>
          <p><strong>🔖 Booking ID:</strong> ${booking.bookingId}</p>
        </div>
        ${booking.qrCode ? `
        <div style="text-align:center">
          <p><strong>Your QR Code Ticket</strong></p>
          <img src="${booking.qrCode}" alt="QR Code" style="width:200px;height:200px"/>
          <p style="color:#666;font-size:12px">Show this at the venue entrance</p>
        </div>` : ""}
        <a href="${process.env.CLIENT_URL}/bookings/${booking._id}" 
           style="background:#6C3EF5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          View Booking Details
        </a>
      </div>
    `,
  });
};

exports.sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Your EventFlow OTP",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:20px;text-align:center">
        <h2 style="color:#6C3EF5">Verification Code</h2>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#333;padding:20px;background:#f5f5f5;border-radius:12px;margin:20px 0">
          ${otp}
        </div>
        <p style="color:#666">This OTP expires in 10 minutes.</p>
      </div>
    `,
  });
};
