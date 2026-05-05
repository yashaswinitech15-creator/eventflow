const QRCode = require("qrcode");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const emailService = require("../services/emailService");

// @POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { eventId, quantity, attendeeDetails, ticketType } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.status !== "approved")
      return res.status(400).json({ error: "Event is not available for booking" });
    if (event.availableTickets < quantity)
      return res
        .status(400)
        .json({ error: `Only ${event.availableTickets} tickets available` });

    const totalAmount = event.price * quantity;

    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      quantity,
      totalAmount,
      attendeeDetails,
      ticketType: ticketType || "General",
      status: event.price === 0 ? "confirmed" : "pending",
      paymentStatus: event.price === 0 ? "paid" : "pending",
    });

    // Reserve tickets
    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableTickets: -quantity },
    });

    // Generate QR code if free event
    if (event.price === 0) {
      const qrData = JSON.stringify({
        bookingId: booking.bookingId,
        eventId,
        userId: req.user._id,
        quantity,
      });
      const qrCode = await QRCode.toDataURL(qrData);
      booking.qrCode = qrCode;
      await booking.save();

      emailService
        .sendBookingConfirmation(req.user, booking, event)
        .catch(console.error);
    }

    await booking.populate([
      { path: "event", select: "title date location price images" },
      { path: "user", select: "name email" },
    ]);

    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title date location price images category")
      .sort("-createdAt");
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event", "title date location price images organizer")
      .populate("user", "name email phone");

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Restore tickets
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { availableTickets: booking.quantity },
    });

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/bookings/validate — organizer scans QR
exports.validateTicket = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ bookingId })
      .populate("event", "title date organizer")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ error: "Invalid ticket" });

    if (
      booking.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized to validate" });
    }

    if (booking.isValidated) {
      return res.status(400).json({
        error: "Ticket already validated",
        validatedAt: booking.validatedAt,
      });
    }

    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ error: `Booking status is ${booking.status}` });
    }

    booking.isValidated = true;
    booking.validatedAt = new Date();
    await booking.save();

    res.json({ message: "Ticket validated successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
