import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Ticket } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo quick-login
  const demoLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Logged in as ${user.role}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Ticket size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-primary-500">EventFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pr-11"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span> : "Sign In"}
            </button>
          </form>

          <div className="mt-4">
            <p className="text-xs text-center text-gray-400 mb-3">Quick demo access:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Admin", email: "admin@eventflow.in", pass: "admin123" },
                { label: "Organizer", email: "organizer@eventflow.in", pass: "org123" },
                { label: "User", email: "user@eventflow.in", pass: "user123" },
              ].map(({ label, email, pass }) => (
                <button key={label} onClick={() => demoLogin(email, pass)}
                  className="text-xs py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 transition-colors font-medium">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-500 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "user" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Welcome to EventFlow 🎉");
      navigate("/events");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Ticket size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-primary-500">EventFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h1>
          <p className="text-gray-500 mt-1">Join thousands of event-goers</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="10-digit number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pr-11" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
                <option value="user">Attendee — I want to attend events</option>
                <option value="organizer">Organizer — I want to host events</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</span> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
