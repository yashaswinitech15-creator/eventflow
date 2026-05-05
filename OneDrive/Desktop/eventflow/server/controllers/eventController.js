const Event = require("../models/Event");
const Booking = require("../models/Booking");

// @GET /api/events  — public, supports search + filter
exports.getEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      date,
      city,
      page = 1,
      limit = 12,
      sort = "-date",
    } = req.query;

    const query = { status: "approved" };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (city) query["location.city"] = new RegExp(city, "i");
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate("organizer", "name email avatar")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      events,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/events/featured
exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved", isFeatured: true })
      .populate("organizer", "name avatar")
      .sort("-date")
      .limit(6);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email avatar bio"
    );
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/events  — organizer/admin only
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      availableTickets: req.body.totalTickets,
      status: req.user.role === "admin" ? "approved" : "pending",
    };

    const event = await Event.create(eventData);
    await event.populate("organizer", "name email");
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("organizer", "name email");

    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/events/organizer/my-events
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort(
      "-createdAt"
    );
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/events/:id/stats
exports.getEventStats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const bookings = await Booking.find({
      event: event._id,
      status: "confirmed",
    });
    const revenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const ticketsSold = bookings.reduce((sum, b) => sum + b.quantity, 0);

    res.json({
      stats: {
        totalBookings: bookings.length,
        ticketsSold,
        revenue,
        availableTickets: event.availableTickets,
        soldPercentage:
          ((event.totalTickets - event.availableTickets) /
            event.totalTickets) *
          100,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
