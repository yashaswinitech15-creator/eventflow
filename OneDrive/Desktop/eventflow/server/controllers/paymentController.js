const crypto = require("crypto");
const QRCode = require("qrcode");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const emailService = require("../services/emailService");
const Event = require("../models/Event");

// Initialize Razorpay (optional)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      bookingId,
      user: req.user._id,
      paymentStatus: "pending",
    }).populate("event", "title price");

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const amount = booking.totalAmount * 100; // paise

    // Mock payment if Razorpay not configured
    if (!razorpay) {
      const mockOrderId = `mock_order_${Date.now()}`;
      const transaction = await Transaction.create({
        booking: booking._id,
        user: req.user._id,
        amount: booking.totalAmount,
        paymentGateway: "mock",
        gatewayOrderId: mockOrderId,
        status: "initiated",
      });

      return res.json({
        orderId: mockOrderId,
        amount: booking.totalAmount,
        currency: "INR",
        isMock: true,
        bookingId: booking.bookingId,
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: booking.bookingId,
      notes: { bookingId: booking.bookingId },
    });

    await Transaction.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      paymentGateway: "razorpay",
      gatewayOrderId: order.id,
      status: "initiated",
    });

    res.json({
      orderId: order.id,
      amount: booking.totalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking.bookingId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature, isMock } = req.body;

    const booking = await Booking.findOne({ bookingId }).populate(
      "event",
      "title date location price images"
    );
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    let isValid = false;

    if (isMock) {
      isValid = true; // Mock payment always succeeds
    } else {
      // Verify Razorpay signature
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
      isValid = expectedSig === razorpaySignature;
    }

    if (!isValid) {
      await Transaction.findOneAndUpdate(
        { gatewayOrderId: razorpayOrderId },
        { status: "failed" }
      );
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId: booking.bookingId,
      eventId: booking.event._id,
      userId: booking.user,
      quantity: booking.quantity,
    });
    const qrCode = await QRCode.toDataURL(qrData);

    // Update booking
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.paymentId = razorpayPaymentId || `mock_pay_${Date.now()}`;
    booking.paymentMethod = isMock ? "mock" : "razorpay";
    booking.qrCode = qrCode;
    await booking.save();

    // Update transaction
    await Transaction.findOneAndUpdate(
      { booking: booking._id },
      {
        status: "success",
        gatewayPaymentId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
      }
    );

    // Send confirmation email
    const user = req.user;
    emailService
      .sendBookingConfirmation(user, booking, booking.event)
      .catch(console.error);

    res.json({
      message: "Payment successful",
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/payments/mock-success — dev only
exports.mockSuccess = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      bookingId,
      user: req.user._id,
    }).populate("event");

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const qrData = JSON.stringify({ bookingId: booking.bookingId });
    const qrCode = await QRCode.toDataURL(qrData);

    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.paymentId = `mock_pay_${Date.now()}`;
    booking.paymentMethod = "mock";
    booking.qrCode = qrCode;
    await booking.save();

    res.json({ message: "Mock payment successful", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
