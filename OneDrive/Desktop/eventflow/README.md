# 🎟️ EventFlow — End-to-End Event Lifecycle & Ticketing Platform

A full-stack, production-ready event management and ticketing platform built with React, Node.js, MongoDB.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcrypt |
| Payments | Razorpay (with mock fallback) |
| QR Codes | `qrcode` (server) + `qrcode.react` (client) |
| Email | Nodemailer (SMTP/SendGrid) |
| SMS/OTP | Twilio (with mock fallback) |
| Deployment | Vercel (client) + Render (server) + MongoDB Atlas (DB) |

---

## 📁 Folder Structure

```
eventflow/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Navbar, Footer
│   │   │   ├── events/        # EventCard, EventFilters
│   │   │   └── chatbot/       # ChatBot widget
│   │   ├── pages/             # All route pages
│   │   ├── context/           # Auth + Theme context
│   │   └── utils/             # Axios API instance
│   └── vercel.json
│
└── server/                    # Node backend
    ├── controllers/           # Business logic
    ├── models/                # Mongoose schemas
    ├── routes/                # Express routers
    ├── middleware/            # Auth + validation
    ├── services/              # Email + OTP services
    ├── config/                # DB connection
    └── scripts/               # Seed data
```

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd eventflow
npm run install:all
```

### 2. Configure Environment Variables

**Server** (`/server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:5173

# Optional (falls back to mock/console)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=app_password

TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

**Client** (`/client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
VITE_GOOGLE_MAPS_KEY=AIzaxxx
```

### 3. Seed Sample Data
```bash
npm run seed
```

### 4. Run Development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend:  http://localhost:5000

---

## 👤 Test Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@eventflow.in | admin123 |
| Organizer | organizer@eventflow.in | org123 |
| User | user@eventflow.in | user123 |

---

## 📡 API Documentation

### Base URL
`http://localhost:5000/api`

### Authentication

#### POST `/auth/register`
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123", "role": "user" }
```
Returns: `{ token, user }`

#### POST `/auth/login`
```json
{ "email": "jane@example.com", "password": "secret123" }
```
Returns: `{ token, user }`

#### GET `/auth/me` 🔒
Returns current user profile.

#### POST `/auth/send-otp` 🔒
```json
{ "phone": "9876543210" }
```

#### POST `/auth/verify-otp` 🔒
```json
{ "otp": "123456" }
```

---

### Events

#### GET `/events`
Query params: `search`, `category`, `minPrice`, `maxPrice`, `date`, `city`, `page`, `limit`, `sort`

#### GET `/events/featured`
Returns featured approved events.

#### GET `/events/:id`
Returns full event details.

#### POST `/events` 🔒 (organizer/admin)
```json
{
  "title": "My Event",
  "description": "Description here",
  "location": { "address": "123 Main St", "city": "Mumbai", "state": "Maharashtra" },
  "date": "2025-06-15T18:00:00",
  "price": 999,
  "category": "Technology",
  "totalTickets": 200
}
```

#### PUT `/events/:id` 🔒 (organizer/admin)
#### DELETE `/events/:id` 🔒 (organizer/admin)
#### GET `/events/organizer/my-events` 🔒 (organizer/admin)

---

### Bookings

#### POST `/bookings` 🔒
```json
{
  "eventId": "...",
  "quantity": 2,
  "attendeeDetails": { "name": "Jane", "email": "jane@example.com", "phone": "9876543210" }
}
```

#### GET `/bookings/my` 🔒
Returns user's bookings with event details.

#### GET `/bookings/:id` 🔒
#### PUT `/bookings/:id/cancel` 🔒
#### POST `/bookings/validate` 🔒 (organizer/admin)
```json
{ "bookingId": "BK-XXXXXXXX" }
```

---

### Payments

#### POST `/payments/create-order` 🔒
```json
{ "bookingId": "BK-XXXXXXXX" }
```
Returns Razorpay order or mock order.

#### POST `/payments/verify` 🔒
```json
{
  "bookingId": "BK-XXXXXXXX",
  "razorpayPaymentId": "pay_xxx",
  "razorpayOrderId": "order_xxx",
  "razorpaySignature": "sig_xxx"
}
```
On success: generates QR code, sends email confirmation.

---

### Admin (admin only) 🔒

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/stats` | Dashboard analytics |
| GET | `/admin/users` | All users |
| PUT | `/admin/users/:id/role` | Update user role |
| GET | `/admin/events` | All events |
| PUT | `/admin/events/:id/approve` | Approve/reject event |
| PUT | `/admin/events/:id/feature` | Feature/unfeature event |
| GET | `/admin/bookings` | All bookings |

---

### Chatbot

#### POST `/chatbot/message`
```json
{ "message": "How do I book a ticket?" }
```
Returns: `{ response, timestamp }`

#### GET `/chatbot/faqs`
Returns common FAQ questions.

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy /client folder to Vercel
# Set VITE_API_URL to your Render backend URL
```

### Backend → Render
1. Push to GitHub
2. Create new Web Service on Render
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add all environment variables

### Database → MongoDB Atlas
1. Create free M0 cluster at cloud.mongodb.com
2. Create database user
3. Whitelist `0.0.0.0/0` for Render
4. Copy connection string → `MONGO_URI`

---

## 🔐 Security Features
- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with configurable expiry
- Helmet.js HTTP security headers
- Rate limiting (100 req/15min per IP)
- Input validation with Joi
- CORS configured for specific origin
- Razorpay signature verification

---

## ⚙️ Key Features

| Feature | Implementation |
|---|---|
| JWT Auth | `jsonwebtoken` + `bcryptjs` |
| Role-based access | Custom `authorize()` middleware |
| OTP | Twilio SMS (mock fallback) |
| QR Codes | `qrcode` server + `qrcode.react` client |
| Payments | Razorpay (mock fallback for dev) |
| Email | Nodemailer SMTP/SendGrid |
| Chatbot | Rule-based intent matching + live event data |
| Search | MongoDB `$text` full-text search |
| Dark Mode | Tailwind `dark:` classes + localStorage |
| Countdown | `react-countdown` component |
| Real-time availability | Ticket count updated on every booking |
