import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, BarChart2, Ticket, DollarSign, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/events/organizer/my-events")
      .then((r) => setEvents(r.data.events))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this event permanently?")) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success("Event deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalRevenue = events.reduce((sum, e) => sum + (e.price * (e.totalTickets - e.availableTickets)), 0);
  const totalTicketsSold = events.reduce((sum, e) => sum + (e.totalTickets - e.availableTickets), 0);

  return (
    <div className="py-8">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organizer Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name?.split(" ")[0]}!</p>
          </div>
          <Link to="/events/create" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Event
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BarChart2, label: "Total Events", value: events.length, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
            { icon: Ticket, label: "Tickets Sold", value: totalTicketsSold.toLocaleString(), color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
            { icon: DollarSign, label: "Est. Revenue", value: `₹${totalRevenue.toLocaleString()}`, color: "text-primary-500 bg-primary-50 dark:bg-primary-900/20" },
            { icon: Clock, label: "Pending Approval", value: events.filter((e) => e.status === "pending").length, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Events Table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">My Events</h2>
            <span className="text-sm text-gray-400">{events.length} total</span>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🎪</div>
              <p className="text-gray-500 mb-4">You haven't created any events yet</p>
              <Link to="/events/create" className="btn-primary">Create Your First Event</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Event</th>
                    <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Tickets</th>
                    <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Price</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.images?.[0] || `https://picsum.photos/seed/${event._id}/80/80`}
                            alt={event.title}
                            className="w-10 h-10 rounded-lg object-cover hidden sm:block"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{event.title}</p>
                            <p className="text-xs text-gray-400">{event.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                        {format(new Date(event.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${STATUS_COLORS[event.status]}`}>{event.status}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                        {event.totalTickets - event.availableTickets} / {event.totalTickets}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white hidden lg:table-cell">
                        {event.price === 0 ? "FREE" : `₹${event.price}`}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/events/${event._id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="View">
                            <Eye size={15} className="text-gray-400" />
                          </Link>
                          <Link to={`/events/${event._id}/edit`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Edit">
                            <Edit size={15} className="text-gray-400" />
                          </Link>
                          <button onClick={() => handleDelete(event._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={15} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
