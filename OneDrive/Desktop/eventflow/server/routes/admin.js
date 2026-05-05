const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getAllEvents,
  approveEvent,
  featureEvent,
  getAllBookings,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/events", getAllEvents);
router.put("/events/:id/approve", approveEvent);
router.put("/events/:id/feature", featureEvent);
router.get("/bookings", getAllBookings);

module.exports = router;
