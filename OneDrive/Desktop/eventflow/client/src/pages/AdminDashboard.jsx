import { useState, useEffect } from "react";
import { Users, Calendar, Ticket, DollarSign, Clock, CheckCircle, XCircle, Star } from "lucide-react";
import { format } from "date-fns";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then((r) => { setStats(r.data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (activeTab === "events") api.get("/admin/events?status=pending").then((r) => setEvents(r.data.events));
    if (activeTab === "users") api.get("/admin/users").then((r) => setUsers(r.data.users));
    if (activeTab === "bookings") api.get("/admin/bookings").then((r) => setBookings(r.data.bookings));
  }, [activeTab]);

  const approveEvent = async (id, status) => {
    try {
      await api.put(`/admin/events/${id}/approve`, { status });
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success(`Event ${status}`);
    } catch (err) { toast.error(err.message); }
  };

  const featureEvent = async (id, isFeatured) => {
    try {
      await api.put(`/admin/events/${id}/feature`, { isFeatured });
      toast.success(isFeatured ? "Event featured!" : "Removed from featured");
    } catch (err) { toast.error(err.message); }
  };

  const updateRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role } : u));
      toast.success("Role updated");
    } catch (err) { toast.error(err.message); }
  };

  const TABS = ["overview", "events", "users", "bookings"];

  return (
    <div className="py-8">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-500">Manage your EventFlow platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all -mb-px ${
                activeTab === tab
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab}
              {tab === "events" && stats?.stats?.pendingEvents > 0 && (
                <span className="ml-1.5 w-5 h-5 bg-amber-500 text-white rounded-full text-xs inline-flex items-center justify-center">
                  {stats.stats.pendingEvents}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { icon: Users, label: "Users", value: stats?.stats?.totalUsers, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
                    { icon: Calendar, label: "Events", value: stats?.stats?.totalEvents, color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
                    { icon: Ticket, label: "Bookings", value: stats?.stats?.totalBookings, color: "text-primary-500 bg-primary-50 dark:bg-primary-900/20" },
                    { icon: Clock, label: "Pending", value: stats?.stats?.pendingEvents, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
                    { icon: DollarSign, label: "Revenue", value: `₹${(stats?.stats?.totalRevenue || 0).toLocaleString()}`, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="card p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{value ?? "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Bookings */}
                <div className="card p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Bookings</h3>
                  <div className="space-y-3">
                    {stats?.recentBookings?.slice(0, 6).map((b) => (
                      <div key={b._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                            {b.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{b.user?.name}</p>
                            <p className="text-xs text-gray-400">{b.event?.title}</p>
                          </div>
                        </div>
                        <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">confirmed</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category breakdown */}
                <div className="card p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Events by Category</h3>
                  <div className="space-y-2">
                    {stats?.categoryStats?.map(({ _id, count }) => (
                      <div key={_id} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-24 shrink-0">{_id}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${Math.min(100, (count / Math.max(...(stats.categoryStats.map(c => c.count)))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="card overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Pending Event Approvals</h3>
            </div>
            {events.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No pending events 🎉</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {events.map((event) => (
                  <div key={event._id} className="p-4 flex items-center gap-4">
                    <img src={event.images?.[0] || `https://picsum.photos/seed/${event._id}/80/80`} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{event.title}</p>
                      <p className="text-xs text-gray-400">{event.organizer?.name} · {event.category} · {event.date ? format(new Date(event.date), "MMM d, yyyy") : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => featureEvent(event._id, true)} className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg" title="Feature">
                        <Star size={15} className="text-amber-400" />
                      </button>
                      <button onClick={() => approveEvent(event._id, "approved")} className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                        <CheckCircle size={15} className="text-green-500" />
                      </button>
                      <button onClick={() => approveEvent(event._id, "rejected")} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <XCircle size={15} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="card overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Joined</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{u.name?.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800"
                        >
                          <option value="user">User</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {u.isVerified ? <span className="text-green-500 text-xs">✓ Verified</span> : <span className="text-gray-400 text-xs">Unverified</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="card overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Booking ID</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">User</th>
                    <th className="text-left px-4 py-3 font-medium">Event</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookingId}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-700 dark:text-gray-300">{b.user?.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[180px] truncate">{b.event?.title}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white hidden md:table-cell">
                        {b.totalAmount === 0 ? "FREE" : `₹${b.totalAmount.toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
