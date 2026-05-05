import { useState } from "react";
import { User, Mail, Phone, Shield, Edit2, Save, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/auth/profile", form);
      updateUser(res.data.user);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    try {
      await api.put("/auth/change-password", pwForm);
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) { toast.error(err.message); }
    finally { setPwLoading(false); }
  };

  const ROLE_COLORS = { admin: "bg-red-100 text-red-700", organizer: "bg-blue-100 text-blue-700", user: "bg-green-100 text-green-700" };

  return (
    <div className="py-8">
      <div className="page-container max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

        {/* Profile Card */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                <span className={`badge text-xs mt-1 ${ROLE_COLORS[user?.role]}`}>{user?.role}</span>
              </div>
            </div>
            <button
              onClick={() => editing ? setEditing(false) : setEditing(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {editing ? <X size={18} /> : <Edit2 size={18} className="text-gray-400" />}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-primary-400 shrink-0" />
              <span className="text-gray-600 dark:text-gray-300">{user?.email}</span>
              {user?.isVerified && <span className="badge bg-green-100 text-green-600 text-xs">✓ Verified</span>}
            </div>
            {user?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-primary-400 shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">{user.phone}</span>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm">
              <Shield size={16} className="text-primary-400 shrink-0 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-300 capitalize">{user?.role} Account</span>
            </div>
          </div>

          {editing && (
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input resize-none" placeholder="Tell us about yourself..." />
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={handlePw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" required minLength={6} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="input" />
            </div>
            <button type="submit" disabled={pwLoading} className="btn-primary">
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
