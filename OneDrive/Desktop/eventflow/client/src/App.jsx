import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ChatBot from "./components/chatbot/ChatBot";

// Pages
import LandingPage from "./pages/LandingPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import BookingPage from "./pages/BookingPage";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/booking/:eventId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/booking/confirm/:bookingId" element={<ProtectedRoute><BookingConfirmPage /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Organizer Routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={["organizer","admin"]}><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/events/create" element={<ProtectedRoute roles={["organizer","admin"]}><CreateEventPage /></ProtectedRoute>} />
          <Route path="/events/:id/edit" element={<ProtectedRoute roles={["organizer","admin"]}><EditEventPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
