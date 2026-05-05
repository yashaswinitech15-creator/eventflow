// routes/bookings.js
const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  validateTicket,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBooking);
router.put("/:id/cancel", protect, cancelBooking);
router.post("/validate", protect, authorize("organizer", "admin"), validateTicket);

module.exports = router;
