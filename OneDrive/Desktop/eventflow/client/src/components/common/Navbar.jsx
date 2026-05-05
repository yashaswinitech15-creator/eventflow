import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Ticket, ChevronDown, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Ticket size={18} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary-500 to-purple-400 bg-clip-text text-transparent">
              EventFlow
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/events" className={`btn-ghost ${isActive("/events") ? "text-primary-500 bg-primary-50 dark:bg-primary-900/30" : ""}`}>
              Events
            </Link>
            {user && (
              <Link to="/my-bookings" className={`btn-ghost ${isActive("/my-bookings") ? "text-primary-500 bg-primary-50 dark:bg-primary-900/30" : ""}`}>
                My Tickets
              </Link>
            )}
            {(user?.role === "organizer" || user?.role === "admin") && (
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin" className="btn-ghost">Admin</Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.name?.split(" ")[0]}</span>
                  <ChevronDown size={16} className={`transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-52 card shadow-lg py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 mt-1">{user.role}</span>
                    </div>
                    <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/my-bookings" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Ticket size={16} /> My Tickets
                    </Link>
                    {(user.role === "organizer" || user.role === "admin") && (
                      <Link to="/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost hidden sm:block">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile Menu */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 space-y-1">
          <Link to="/events" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(false)}>Events</Link>
          {user && <Link to="/my-bookings" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(false)}>My Tickets</Link>}
          {(user?.role === "organizer" || user?.role === "admin") && <Link to="/dashboard" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {user?.role === "admin" && <Link to="/admin" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          {!user && (
            <>
              <Link to="/login" className="block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="block py-2 px-3 rounded-lg bg-primary-500 text-white text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
