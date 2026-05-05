const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      default: () => `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: { type: String },
    paymentMethod: { type: String },
    qrCode: { type: String },
    isValidated: { type: Boolean, default: false },
    validatedAt: { type: Date },
    attendeeDetails: {
      name: String,
      email: String,
      phone: String,
    },
    ticketType: { type: String, default: "General" },
    notes: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
