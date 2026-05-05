const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
};

// Auth schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  role: Joi.string().valid("user", "organizer").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Event schemas
const eventSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
  }).required(),
  date: Joi.date().greater("now").required(),
  endDate: Joi.date().optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string()
    .valid(
      "Music","Technology","Sports","Art","Food",
      "Business","Health","Education","Comedy","Other"
    )
    .required(),
  totalTickets: Joi.number().integer().min(1).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  ticketTypes: Joi.array().optional(),
});

// Booking schemas
const bookingSchema = Joi.object({
  eventId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(10).required(),
  attendeeDetails: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
  }).required(),
  ticketType: Joi.string().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  eventSchema,
  bookingSchema,
};
