import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Zap, Shield, Globe, Star, Calendar, MapPin } from "lucide-react";
import api from "../utils/api";
import EventCard from "../components/events/EventCard";

const STATS = [
  { label: "Events Hosted", value: "10,000+" },
  { label: "Happy Attendees", value: "500K+" },
  { label: "Cities", value: "150+" },
  { label: "Organizers", value: "2,500+" },
];

const FEATURES = [
  { icon: Zap, title: "Instant Booking", desc: "Book tickets in under 60 seconds with seamless checkout." },
  { icon: Shield, title: "Secure Payments", desc: "256-bit encryption. Your money and data are always safe." },
  { icon: Globe, title: "Nationwide Events", desc: "Events across 150+ cities. From concerts to conferences." },
];

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/events/featured")
      .then((r) => setFeatured(r.data.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-950 via-primary-900/30 to-gray-950">
        {/* Background mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(108,62,245,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,62,245,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="page-container relative z-10 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
              <Star size={14} className="text-amber-400" />
              India's #1 Event Ticketing Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
              Discover &
              <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Experience</span>
              <br />Amazing Events
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              From live concerts and tech conferences to food festivals — find your next unforgettable experience.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-10">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events, artists, venues..."
                  className="w-full pl-11 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur"
                />
              </div>
              <button type="submit" className="btn-primary py-4 flex items-center justify-center gap-2 whitespace-nowrap">
                Find Events <ArrowRight size={18} />
              </button>
            </form>

            {/* Popular searches */}
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-gray-400">Trending:</span>
              {["Music Concerts", "Tech Conferences", "Food Festivals", "Comedy Shows"].map((t) => (
                <Link key={t} to={`/events?search=${encodeURIComponent(t)}`} className="text-primary-300 hover:text-primary-200 underline underline-offset-2">
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 text-xs">
          <span>Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary-500 mb-1">{value}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="page-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Featured Events</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Handpicked experiences you won't want to miss</p>
            </div>
            <Link to="/events" className="btn-secondary py-2 px-4 text-sm hidden sm:flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-48" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-5 rounded-lg w-3/4" />
                    <div className="skeleton h-4 rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((event) => <EventCard key={event._id} event={event} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No featured events yet. Check back soon!</div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/events" className="btn-primary">Browse All Events</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Why EventFlow?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Everything you need for seamless event experiences</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-primary-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="page-container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Host Your Event?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">Join thousands of organizers who trust EventFlow to manage and sell tickets for their events.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl transition-colors">
              Start for Free
            </Link>
            <Link to="/events" className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-colors">
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
