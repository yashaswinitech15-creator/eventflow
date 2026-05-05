import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Ticket, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { format } from "date-fns";
import api from "../utils/api";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function BookingCard({ booking, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${booking._id}/cancel`);
      toast.success("Booking cancelled");
      onCancel(booking._id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const isPast = new Date(booking.event?.date) < new Date();

  return (
    <div className="card overflow-hidden">
      <div className="p-4 flex gap-4">
        <img
          src={booking.event?.images?.[0] || `https://picsum.photos/seed/${booking.event?._id}/200/100`}
          alt={booking.event?.title}
          className="w-20 h-20 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white truncate">{booking.event?.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">#{booking.bookingId}</p>
            </div>
            <span className={`badge shrink-0 ${STATUS_COLORS[booking.status] || STATUS_COLORS.pending}`}>
              {booking.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-primary-400" />
              {booking.event?.date ? format(new Date(booking.event.date), "MMM d, yyyy") : "—"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-primary-400" />
              {booking.event?.location?.city || "Online"}
            </span>
            <span className="flex items-center gap-1">
              <Ticket size={13} className="text-primary-400" />
              {booking.quantity} ticket{booking.quantity > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-primary-500">
              {booking.totalAmount === 0 ? "FREE" : `₹${booking.totalAmount.toLocaleString()}`}
            </span>
            <div className="flex items-center gap-2">
              {booking.status === "confirmed" && !isPast && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <XCircle size={13} /> Cancel
                </button>
              )}
              {booking.status === "confirmed" && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary-500 flex items-center gap-1"
                >
                  QR Code {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && booking.status === "confirmed" && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center gap-3 animate-slide-up">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <QRCodeSVG
              value={JSON.stringify({ bookingId: booking.bookingId, eventId: booking.event?._id })}
              size={160}
              level="H"
              fgColor="#1f0d64"
            />
          </div>
          <p className="text-xs text-gray-400 text-center">Show this QR code at the venue entrance</p>
          {booking.isValidated && (
            <span className="badge bg-green-100 text-green-700">✓ Already validated at venue</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/bookings/my")
      .then((r) => setBookings(r.data.bookings))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = (id) => {
    setBookings((prev) =>
      prev.map((b) => b._id === id ? { ...b, status: "cancelled" } : b)
    );
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="py-8">
      <div className="page-container max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} total</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["all", "confirmed", "pending", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === s ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s === "all" && ` (${bookings.length})`}
              {s !== "all" && ` (${bookings.filter((b) => b.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 flex gap-4">
                <div className="skeleton w-20 h-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-5 rounded-lg w-3/4" />
                  <div className="skeleton h-4 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No bookings yet</h3>
            <p className="text-gray-400 mb-6">Explore events and book your first ticket!</p>
            <Link to="/events" className="btn-primary">Browse Events</Link>
          </div>
        )}
      </div>
    </div>
  );
}
