const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, mockSuccess } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/mock-success", protect, mockSuccess); // dev only

module.exports = router;
