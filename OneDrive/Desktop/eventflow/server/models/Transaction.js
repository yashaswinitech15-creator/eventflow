const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe", "mock"],
      required: true,
    },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },
    status: {
      type: String,
      enum: ["initiated", "success", "failed", "refunded"],
      default: "initiated",
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
