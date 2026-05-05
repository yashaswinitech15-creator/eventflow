import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Countdown from "react-countdown";
import { Calendar, MapPin, Users, Tag, Share2, Heart, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then((r) => setEvent(r.data.event))
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!user) return navigate("/login");
    navigate(`/booking/${id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  if (loading) return (
    <div className="page-container py-8 animate-pulse">
      <div className="skeleton h-80 rounded-2xl mb-6" />
      <div className="skeleton h-8 rounded-lg w-1/2 mb-4" />
      <div className="skeleton h-4 rounded-lg w-full mb-2" />
    </div>
  );

  if (!event) return null;

  const isPast = new Date(event.date) < new Date();
  const isSoldOut = event.availableTickets === 0;
  const image = event.images?.[0] || `https://picsum.photos/seed/${event._id}/1200/600`;

  return (
    <div className="py-6">
      <div className="page-container">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden h-80 sm:h-96">
              <img src={image} alt={event.title} className="w-full h-full object-cover"
                onError={(e) => { e.target.src = `https://picsum.photos/seed/${event._id}/1200/600`; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="badge bg-white/90 text-gray-800">{event.category}</span>
                {event.isFeatured && <span className="badge bg-amber-400 text-white">⭐ Featured</span>}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setSaved(!saved)} className={`p-2 rounded-full backdrop-blur bg-white/20 border border-white/30 transition-colors ${saved ? "text-red-500" : "text-white"}`}>
                  <Heart size={18} fill={saved ? "currentColor" : "none"} />
                </button>
                <button onClick={handleShare} className="p-2 rounded-full backdrop-blur bg-white/20 border border-white/30 text-white">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Title & Organizer */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">{event.title}</h1>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {event.organizer?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Organized by</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{event.organizer?.name}</p>
                </div>
              </div>
            </div>

            {/* Countdown */}
            {!isPast && (
              <div className="card p-4 bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800">
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2 flex items-center gap-1">
                  <Clock size={14} /> Event starts in
                </p>
                <Countdown
                  date={new Date(event.date)}
                  renderer={({ days, hours, minutes, seconds }) => (
                    <div className="flex gap-4">
                      {[{ v: days, l: "Days" }, { v: hours, l: "Hours" }, { v: minutes, l: "Mins" }, { v: seconds, l: "Secs" }].map(({ v, l }) => (
                        <div key={l} className="text-center">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{String(v).padStart(2, "0")}</div>
                          <div className="text-xs text-gray-500">{l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
            )}

            {/* Event Details */}
            <div className="card p-5 space-y-4">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Date & Time</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                    <p className="text-sm text-gray-500">{format(new Date(event.date), "h:mm a")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Location</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{event.location?.address}</p>
                    <p className="text-sm text-gray-500">{[event.location?.city, event.location?.state].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Users size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Availability</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{event.availableTickets} / {event.totalTickets}</p>
                    <p className="text-sm text-gray-500">Tickets remaining</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Tag size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Category</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{event.category}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card p-5">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-3">About This Event</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">#{tag}</span>
                ))}
              </div>
            )}

            {/* Map placeholder */}
            {event.location?.coordinates?.lat && (
              <div className="card overflow-hidden h-48">
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.location.coordinates.lat},${event.location.coordinates.lng}&zoom=14&size=800x300&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ""}`}
                  alt="Event location map"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.parentElement.style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="mb-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Price per ticket</p>
                <p className="text-4xl font-bold text-primary-500">
                  {event.price === 0 ? "FREE" : `₹${event.price.toLocaleString()}`}
                </p>
              </div>

              {/* Availability bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{event.availableTickets} tickets left</span>
                  <span>{Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100)}% sold</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${((event.totalTickets - event.availableTickets) / event.totalTickets) * 100}%` }}
                  />
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {["Instant QR code ticket", "Email confirmation", "Easy cancellation", "Secure payment"].map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle size={15} className="text-green-500 shrink-0" /> {feat}
                  </li>
                ))}
              </ul>

              {isPast ? (
                <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">Event has ended</div>
              ) : isSoldOut ? (
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 font-semibold">Sold Out</div>
              ) : (
                <button onClick={handleBook} className="btn-primary w-full text-base py-4">
                  {user ? "Book Tickets" : "Sign In to Book"}
                </button>
              )}

              <p className="text-xs text-center text-gray-400 mt-3">No booking fees • Instant confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
