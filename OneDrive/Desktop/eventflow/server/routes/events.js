const express = require("express");
const router = express.Router();
const {
  getEvents,
  getFeaturedEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getEventStats,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getEvents);
router.get("/featured", getFeaturedEvents);
router.get("/organizer/my-events", protect, authorize("organizer", "admin"), getMyEvents);
router.get("/:id", getEvent);
router.get("/:id/stats", protect, authorize("organizer", "admin"), getEventStats);
router.post("/", protect, authorize("organizer", "admin"), createEvent);
router.put("/:id", protect, authorize("organizer", "admin"), updateEvent);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteEvent);

module.exports = router;
