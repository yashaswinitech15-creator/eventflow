// routes/chatbot.js
const express = require("express");
const router = express.Router();
const { sendMessage, getFaqs } = require("../controllers/chatbotController");

router.post("/message", sendMessage);
router.get("/faqs", getFaqs);

module.exports = router;
