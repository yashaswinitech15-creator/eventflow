import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Minus, Plus, CreditCard, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function BookingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    api.get(`/events/${eventId}`)
      .then((r) => setEvent(r.data.event))
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false));
  }, [eventId]);

  const total = event ? event.price * quantity : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/bookings", {
        eventId,
        quantity,
        attendeeDetails: form,
      });
      const booking = res.data.booking;

      if (event.price === 0) {
        toast.success("Booking confirmed!");
        navigate(`/booking/confirm/${booking._id}`);
      } else {
        // Initiate payment
        const orderRes = await api.post("/payments/create-order", { bookingId: booking.bookingId });
        const order = orderRes.data;

        if (order.isMock) {
          // Mock payment flow
          const verifyRes = await api.post("/payments/verify", {
            bookingId: booking.bookingId,
            isMock: true,
            razorpayOrderId: order.orderId,
          });
          toast.success("Payment successful!");
          navigate(`/booking/confirm/${verifyRes.data.booking._id}`);
        } else {
          // Real Razorpay
          const options = {
            key: order.keyId,
            amount: order.amount * 100,
            currency: "INR",
            name: "EventFlow",
            description: event.title,
            order_id: order.orderId,
            handler: async (response) => {
              try {
                const verifyRes = await api.post("/payments/verify", {
                  bookingId: booking.bookingId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                });
                toast.success("Payment successful!");
                navigate(`/booking/confirm/${verifyRes.data.booking._id}`);
              } catch (err) {
                toast.error("Payment verification failed");
              }
            },
            prefill: { name: form.name, email: form.email, contact: form.phone },
            theme: { color: "#6C3EF5" },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="page-container py-8 animate-pulse space-y-4">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  if (!event) return null;

  return (
    <div className="py-8">
      <div className="page-container max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Attendee Info */}
            <div className="card p-6">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Attendee Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                    placeholder="10-digit mobile number"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Tickets</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-primary-500 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(10, event.availableTickets, quantity + 1))}
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-primary-500 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="text-sm text-gray-400">(max 10 per booking)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base mt-2"
                >
                  {submitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard size={20} /> {event.price === 0 ? "Confirm Free Booking" : `Pay ₹${total.toLocaleString()}`}</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-24">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Order Summary</h2>

              <div className="flex gap-3 mb-4">
                <img
                  src={event.images?.[0] || `https://picsum.photos/seed/${event._id}/200/100`}
                  alt={event.title}
                  className="w-20 h-16 rounded-lg object-cover shrink-0"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.category}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} className="text-primary-400" />
                  {format(new Date(event.date), "EEE, MMM d, yyyy · h:mm a")}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={14} className="text-primary-400" />
                  {event.location?.city || event.location?.address}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price × {quantity}</span>
                  <span>{event.price === 0 ? "FREE" : `₹${(event.price * quantity).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform fee</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 dark:border-gray-800 pt-2">
                  <span>Total</span>
                  <span className="text-primary-500">{event.price === 0 ? "FREE" : `₹${total.toLocaleString()}`}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                🔒 Secured by Razorpay. Your payment info is never stored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
