const Event = require("../models/Event");

// Rule-based FAQ chatbot with intent matching
const intents = [
  {
    patterns: ["hello", "hi", "hey", "greet"],
    response: "👋 Hello! I'm EventBot. How can I help you today? You can ask me about events, bookings, payments, or anything else!",
  },
  {
    patterns: ["how to book", "book ticket", "purchase ticket", "buy ticket"],
    response:
      "🎟️ Booking is simple!\n1. Browse events on the Events page\n2. Click on an event you like\n3. Select the number of tickets\n4. Fill in your details\n5. Complete payment\nYour QR code ticket will be emailed to you!",
  },
  {
    patterns: ["cancel", "refund", "cancellation policy"],
    response:
      "❌ To cancel a booking:\n1. Go to My Bookings\n2. Select the booking\n3. Click 'Cancel Booking'\n\nRefunds are processed within 5-7 business days for paid tickets.",
  },
  {
    patterns: ["payment", "pay", "razorpay", "stripe", "how to pay"],
    response:
      "💳 We accept payments via:\n• Razorpay (Cards, UPI, Net Banking, Wallets)\n• Free events require no payment\n\nAll payments are secured with 256-bit encryption.",
  },
  {
    patterns: ["qr code", "ticket qr", "show ticket"],
    response:
      "📱 Your QR code is generated after successful payment. You can find it in:\n• My Bookings → Select booking\n• Confirmation email\n\nShow the QR code at the venue entrance for validation.",
  },
  {
    patterns: ["organizer", "create event", "host event", "add event"],
    response:
      "🎪 To host an event:\n1. Register/login as an Organizer\n2. Go to your Dashboard\n3. Click 'Create Event'\n4. Fill in all event details\n5. Submit for admin approval\n\nEvents are approved within 24 hours.",
  },
  {
    patterns: ["contact", "support", "help", "email us"],
    response:
      "📞 Need more help?\n• Email: support@eventflow.in\n• Phone: +91 98765 43210\n• Hours: Mon-Fri, 9AM - 6PM IST\n\nOr browse our Help Center at eventflow.in/help",
  },
  {
    patterns: ["free event", "free ticket", "no charge"],
    response:
      "🆓 Yes! Many events on EventFlow are free. Simply filter by price (₹0) on the Events page or look for the 'FREE' badge on event cards.",
  },
  {
    patterns: ["categories", "types of events", "what events"],
    response:
      "🎭 EventFlow hosts events in these categories:\nMusic 🎵, Technology 💻, Sports ⚽, Art 🎨, Food 🍕, Business 💼, Health 🏃, Education 📚, Comedy 😄, and more!",
  },
  {
    patterns: ["dark mode", "theme", "appearance"],
    response:
      "🌙 You can toggle Dark Mode using the moon/sun icon in the top navigation bar. Your preference is saved automatically!",
  },
  {
    patterns: ["account", "profile", "settings"],
    response:
      "👤 Manage your account from the Profile page:\n• Update name & bio\n• Change password\n• Verify phone number\n• View booking history",
  },
  {
    patterns: ["thank", "thanks", "great", "awesome"],
    response:
      "😊 You're welcome! Is there anything else I can help you with?",
  },
  {
    patterns: ["bye", "goodbye", "exit", "quit"],
    response:
      "👋 Goodbye! Enjoy your events! Feel free to chat anytime.",
  },
];

// Find best matching intent
const matchIntent = (message) => {
  const lower = message.toLowerCase();
  for (const intent of intents) {
    if (intent.patterns.some((p) => lower.includes(p))) {
      return intent.response;
    }
  }
  return null;
};

// @POST /api/chatbot/message
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    let response = matchIntent(message);

    // Check if asking about specific events
    if (!response && (message.toLowerCase().includes("event") || message.toLowerCase().includes("upcoming"))) {
      const events = await Event.find({ status: "approved", date: { $gte: new Date() } })
        .sort("date")
        .limit(3)
        .select("title date location.city price category");

      if (events.length > 0) {
        const eventList = events
          .map(
            (e) =>
              `• ${e.title} — ${new Date(e.date).toLocaleDateString("en-IN")} | ${e.location?.city || "Online"} | ${e.price === 0 ? "FREE" : `₹${e.price}`}`
          )
          .join("\n");
        response = `🗓️ Upcoming events:\n${eventList}\n\nVisit the Events page to see all events and filter by category, date, or price!`;
      }
    }

    if (!response) {
      response =
        "🤔 I'm not sure about that. Here's what I can help with:\n• Event booking process\n• Payment & refunds\n• QR code tickets\n• Creating/hosting events\n• Account & profile\n\nTry asking about any of these!";
    }

    res.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/chatbot/faqs
exports.getFaqs = async (req, res) => {
  const faqs = [
    { q: "How do I book a ticket?", category: "Booking" },
    { q: "How do I cancel my booking?", category: "Booking" },
    { q: "What payment methods are accepted?", category: "Payment" },
    { q: "Where is my QR code?", category: "Tickets" },
    { q: "How do I create an event?", category: "Organizer" },
    { q: "How do I contact support?", category: "Support" },
  ];
  res.json({ faqs });
};
