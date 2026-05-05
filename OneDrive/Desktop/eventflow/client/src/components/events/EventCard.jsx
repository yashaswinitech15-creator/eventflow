import { Link } from "react-router-dom";
import { Calendar, MapPin, Tag, Users } from "lucide-react";
import { format } from "date-fns";

const CATEGORY_COLORS = {
  Music: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Technology: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Sports: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Art: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Business: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Health: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  Education: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  Comedy: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  Other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function EventCard({ event }) {
  const image = event.images?.[0] || `https://picsum.photos/seed/${event._id}/800/400`;
  const pct = Math.round(((event.totalTickets - event.availableTickets) / event.totalTickets) * 100);
  const soldOut = event.availableTickets === 0;

  return (
    <Link to={`/events/${event._id}`} className="card group overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${event._id}/800/400`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Category badge */}
        <span className={`badge absolute top-3 left-3 ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other}`}>
          {event.category}
        </span>

        {/* Featured */}
        {event.isFeatured && (
          <span className="badge absolute top-3 right-3 bg-accent text-white">⭐ Featured</span>
        )}

        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-white dark:bg-gray-900 rounded-lg px-3 py-1 font-bold text-primary-600">
          {event.price === 0 ? "FREE" : `₹${event.price.toLocaleString()}`}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400 flex-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-primary-400 shrink-0" />
            <span>{format(new Date(event.date), "EEE, MMM d · h:mm a")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-primary-400 shrink-0" />
            <span className="truncate">{event.location?.city || event.location?.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-primary-400 shrink-0" />
            <span>{event.availableTickets} tickets left</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{pct}% sold</span>
            {soldOut && <span className="text-red-500 font-semibold">SOLD OUT</span>}
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-primary-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
