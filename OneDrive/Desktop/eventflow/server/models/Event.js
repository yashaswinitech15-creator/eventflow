const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    date: { type: Date, required: true },
    endDate: { type: Date },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: [
        "Music",
        "Technology",
        "Sports",
        "Art",
        "Food",
        "Business",
        "Health",
        "Education",
        "Comedy",
        "Other",
      ],
      required: true,
    },
    images: [{ type: String }],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalTickets: { type: Number, required: true, min: 1 },
    availableTickets: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    ticketTypes: [
      {
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        available: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

// Full-text search index
eventSchema.index({ title: "text", description: "text", tags: "text" });
eventSchema.index({ date: 1, category: 1, status: 1 });

module.exports = mongoose.model("Event", eventSchema);
