require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Event = require("../models/Event");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clean slate
  await User.deleteMany({});
  await Event.deleteMany({});

  // Create users
  const adminPass = await bcrypt.hash("admin123", 12);
  const orgPass = await bcrypt.hash("org123", 12);
  const userPass = await bcrypt.hash("user123", 12);

  const [admin, org, user] = await User.insertMany([
    { name: "Admin User", email: "admin@eventflow.in", password: adminPass, role: "admin", isVerified: true },
    { name: "Event Organizer", email: "organizer@eventflow.in", password: orgPass, role: "organizer", isVerified: true },
    { name: "Test User", email: "user@eventflow.in", password: userPass, role: "user", isVerified: true },
  ]);

  // Create sample events
  const events = [
    {
      title: "TechFest 2025 - India's Biggest Tech Conference",
      description: "Join 5000+ tech professionals, entrepreneurs, and innovators at TechFest 2025. Featuring keynotes from top industry leaders, hands-on workshops, and epic networking sessions.",
      location: { address: "HITEC City Convention Center", city: "Hyderabad", state: "Telangana", country: "India", coordinates: { lat: 17.4474, lng: 78.3762 } },
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      price: 999,
      category: "Technology",
      organizer: org._id,
      totalTickets: 500,
      availableTickets: 423,
      status: "approved",
      isFeatured: true,
      tags: ["tech", "conference", "networking"],
      images: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"],
    },
    {
      title: "AR Rahman Live in Concert",
      description: "Experience the magic of A.R. Rahman live! An evening of timeless melodies, world-class production, and unforgettable musical moments.",
      location: { address: "DY Patil Stadium", city: "Mumbai", state: "Maharashtra", country: "India", coordinates: { lat: 19.0760, lng: 72.8777 } },
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      price: 2499,
      category: "Music",
      organizer: org._id,
      totalTickets: 8000,
      availableTickets: 3241,
      status: "approved",
      isFeatured: true,
      tags: ["music", "concert", "live"],
      images: ["https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"],
    },
    {
      title: "Startup Pitch Day Chennai",
      description: "Pitch your startup idea to top VCs and angel investors. Network with the Chennai startup ecosystem and get expert mentorship.",
      location: { address: "IIT Madras Research Park", city: "Chennai", state: "Tamil Nadu", country: "India", coordinates: { lat: 12.9916, lng: 80.2336 } },
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      price: 0,
      category: "Business",
      organizer: org._id,
      totalTickets: 200,
      availableTickets: 87,
      status: "approved",
      isFeatured: false,
      tags: ["startup", "business", "free"],
      images: ["https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800"],
    },
    {
      title: "Yoga & Wellness Retreat",
      description: "A weekend of yoga, meditation, breathwork, and holistic wellness practices. Suitable for all levels from beginners to advanced practitioners.",
      location: { address: "Rishikesh Ashram, Bank of Ganga", city: "Rishikesh", state: "Uttarakhand", country: "India" },
      date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      price: 3500,
      category: "Health",
      organizer: org._id,
      totalTickets: 50,
      availableTickets: 12,
      status: "approved",
      tags: ["yoga", "wellness", "retreat"],
      images: ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"],
    },
    {
      title: "Food & Culture Festival",
      description: "Taste 100+ dishes from 20 states of India! Live cooking demonstrations, food competitions, and cultural performances.",
      location: { address: "Palace Grounds", city: "Bengaluru", state: "Karnataka", country: "India" },
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      price: 299,
      category: "Food",
      organizer: org._id,
      totalTickets: 2000,
      availableTickets: 1456,
      status: "approved",
      tags: ["food", "culture", "festival"],
      images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800"],
    },
  ];

  await Event.insertMany(events);

  console.log("✅ Seed completed!");
  console.log("\n📧 Test Credentials:");
  console.log("Admin:     admin@eventflow.in / admin123");
  console.log("Organizer: organizer@eventflow.in / org123");
  console.log("User:      user@eventflow.in / user123");

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
