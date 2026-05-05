import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Music","Technology","Sports","Art","Food","Business","Health","Education","Comedy","Other"];

const defaultForm = {
  title: "", description: "", price: 0, category: "Technology",
  date: "", totalTickets: 100,
  location: { address: "", city: "", state: "", country: "India" },
  tags: [],
  images: [],
};

export default function CreateEventPage({ editMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(defaultForm);
  const [tag, setTag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(editMode);

  useEffect(() => {
    if (editMode && id) {
      api.get(`/events/${id}`)
        .then((r) => {
          const e = r.data.event;
          setForm({
            title: e.title, description: e.description, price: e.price,
            category: e.category, totalTickets: e.totalTickets,
            date: e.date ? new Date(e.date).toISOString().slice(0, 16) : "",
            location: e.location || defaultForm.location,
            tags: e.tags || [], images: e.images || [],
          });
        })
        .finally(() => setFetching(false));
    }
  }, [editMode, id]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setLoc = (key, val) => setForm((f) => ({ ...f, location: { ...f.location, [key]: val } }));

  const addTag = () => {
    if (tag && !form.tags.includes(tag)) { set("tags", [...form.tags, tag.toLowerCase()]); setTag(""); }
  };
  const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));
  const addImage = () => {
    if (imageUrl && !form.images.includes(imageUrl)) { set("images", [...form.images, imageUrl]); setImageUrl(""); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await api.put(`/events/${id}`, form);
        toast.success("Event updated!");
      } else {
        await api.post("/events", form);
        toast.success("Event created! Pending admin approval.");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="page-container py-8"><div className="skeleton h-96 rounded-2xl" /></div>;

  return (
    <div className="py-8">
      <div className="page-container max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          {editMode ? "Edit Event" : "Create New Event"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
              <input type="text" required value={form.title} onChange={(e) => set("title", e.target.value)} className="input" placeholder="e.g. TechFest 2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea required rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className="input resize-none" placeholder="Describe your event..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time *</label>
                <input type="datetime-local" required value={form.date} onChange={(e) => set("date", e.target.value)} className="input" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Location</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue Address *</label>
              <input type="text" required value={form.location.address} onChange={(e) => setLoc("address", e.target.value)} className="input" placeholder="Full venue address" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input type="text" value={form.location.city} onChange={(e) => setLoc("city", e.target.value)} className="input" placeholder="Mumbai" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <input type="text" value={form.location.state} onChange={(e) => setLoc("state", e.target.value)} className="input" placeholder="Maharashtra" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input type="text" value={form.location.country} onChange={(e) => setLoc("country", e.target.value)} className="input" />
              </div>
            </div>
          </div>

          {/* Tickets & Pricing */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Tickets & Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticket Price (₹)</label>
                <input type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} className="input" placeholder="0 for free" />
                {form.price === 0 && <p className="text-xs text-green-500 mt-1">✓ Free event</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Tickets *</label>
                <input type="number" required min={1} value={form.totalTickets} onChange={(e) => set("totalTickets", Number(e.target.value))} className="input" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Event Images</h2>
            <div className="flex gap-2">
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input flex-1" placeholder="Paste image URL (Unsplash, etc.)" />
              <button type="button" onClick={addImage} className="btn-secondary py-3 px-4"><Plus size={18} /></button>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-24 h-16 rounded-lg object-cover" onError={(e) => e.target.style.display="none"} />
                    <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Tags</h2>
            <div className="flex gap-2">
              <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="input flex-1" placeholder="Add tag and press Enter" />
              <button type="button" onClick={addTag} className="btn-secondary py-3 px-4"><Plus size={18} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((t) => (
                <span key={t} className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 gap-1">
                  #{t} <button type="button" onClick={() => removeTag(t)}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : editMode ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
