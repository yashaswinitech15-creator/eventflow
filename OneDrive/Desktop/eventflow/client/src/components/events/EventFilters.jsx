import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = ["Music","Technology","Sports","Art","Food","Business","Health","Education","Comedy","Other"];

export default function EventFilters({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  const clear = () => onChange({ search: "", category: "", minPrice: "", maxPrice: "", date: "", page: 1 });
  const hasFilters = filters.category || filters.minPrice || filters.maxPrice || filters.date;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search events, artists, venues..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="input pl-11 pr-4"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all ${
            open || hasFilters
              ? "border-primary-500 text-primary-500 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && (
            <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs">
              {[filters.category, filters.minPrice, filters.maxPrice, filters.date].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Active category chips */}
        {filters.category && (
          <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 gap-2">
            {filters.category}
            <button onClick={() => update("category", "")}><X size={12} /></button>
          </span>
        )}
        {hasFilters && (
          <button onClick={clear} className="text-sm text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
        )}
      </div>

      {/* Expanded Filters */}
      {open && (
        <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
            <select
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date</label>
            <input
              type="date"
              value={filters.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => update("date", e.target.value)}
              className="input"
            />
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Min Price (₹)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              placeholder="0"
              min="0"
              className="input"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Max Price (₹)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              placeholder="Any"
              min="0"
              className="input"
            />
          </div>
        </div>
      )}

      {/* Category Quick-select */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => update("category", filters.category === cat ? "" : cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filters.category === cat
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
