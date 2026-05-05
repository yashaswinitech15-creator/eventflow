const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");

// @GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      pendingEvents,
      totalRevenue,
      recentBookings,
      categoryStats,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Event.countDocuments({ status: "pending" }),
      Transaction.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Booking.find({ status: "confirmed" })
        .populate("user", "name email")
        .populate("event", "title")
        .sort("-createdAt")
        .limit(10),
      Event.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Monthly bookings for chart
    const monthlyBookings = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        pendingEvents,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentBookings,
      categoryStats,
      monthlyBookings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/admin/events
exports.getAllEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate("organizer", "name email")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ events, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @PUT /api/admin/events/:id/approve
exports.approveEvent = async (req, res) => {
  try {
    const { status } = req.body; // approved or rejected
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("organizer", "name email");
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @PUT /api/admin/events/:id/feature
exports.featureEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isFeatured: req.body.isFeatured },
      { new: true }
    );
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("event", "title date")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ bookings, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
