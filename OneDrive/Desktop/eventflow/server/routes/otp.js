const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post("/send", protect, authController.sendOtp);
router.post("/verify", protect, authController.verifyOtp);

module.exports = router;
