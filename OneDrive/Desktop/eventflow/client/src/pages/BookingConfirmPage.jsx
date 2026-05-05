import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, Calendar, MapPin, Download, Ticket } from "lucide-react";
import { format } from "date-fns";
import api from "../utils/api";

export default function BookingConfirmPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then((r) => setBooking(r.data.booking))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return (
    <div className="page-container py-16 text-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!booking) return null;

  const qrValue = JSON.stringify({ bookingId: booking.bookingId, eventId: booking.event?._id });

  return (
    <div className="py-12">
      <div className="page-container max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your tickets have been sent to <strong>{booking.attendeeDetails?.email}</strong>
          </p>
        </div>

        {/* Ticket Card */}
        <div className="card overflow-hidden animate-fade-in">
          {/* Top band */}
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 p-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Ticket size={18} />
              <span className="text-sm font-medium opacity-80">EventFlow Ticket</span>
            </div>
            <h2 className="text-xl font-bold">{booking.event?.title}</h2>
            <p className="text-white/70 text-sm mt-1">Booking ID: {booking.bookingId}</p>
          </div>

          {/* Dashed separator */}
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-950 -ml-3 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
            <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-950 -mr-3 shrink-0" />
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Details */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Attendee</p>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.attendeeDetails?.name}</p>
                <p className="text-sm text-gray-500">{booking.attendeeDetails?.email}</p>
              </div>

              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-primary-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.event?.date ? format(new Date(booking.event.date), "EEE, MMM d, yyyy") : "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.event?.date ? format(new Date(booking.event.date), "h:mm a") : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-primary-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Venue</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.event?.location?.address}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tickets</p>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{booking.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Total Paid</p>
                  <p className="font-bold text-lg text-primary-500">
                    {booking.totalAmount === 0 ? "FREE" : `₹${booking.totalAmount.toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <QRCodeSVG
                  value={qrValue}
                  size={140}
                  level="H"
                  includeMargin={false}
                  fgColor="#1f0d64"
                />
              </div>
              <p className="text-xs text-gray-400 text-center">Show this QR code at the venue</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link to="/my-bookings" className="btn-primary flex-1 text-center">
            View My Tickets
          </Link>
          <Link to="/events" className="btn-secondary flex-1 text-center">
            Browse More Events
          </Link>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          📧 A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  );
}
