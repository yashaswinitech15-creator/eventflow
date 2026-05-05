import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import EventCard, { EventCardSkeleton } from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      params.set('limit', '12');
      const res = await api.get(`/events?${params}`);
      setEvents(res.data.events);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const setPage = (p) => setFilters(f => ({ ...f, page: p }));

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Discover Events</h1>
          <p className="text-gray-500 dark:text-gray-400">Find your next unforgettable experience</p>
        </div>

        <EventFilters filters={filters} onChange={setFilters} />

        <div className="mt-6 flex items-center justify-between">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {loading ? 'Loading...' : `${total} event${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(12).fill(0).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No events found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={() => setFilters({ page: 1 })} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map(e => <EventCard key={e._id} event={e} />)}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            <button onClick={() => setPage(filters.page - 1)} disabled={filters.page === 1} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-500 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors text-sm font-medium">Previous</button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              let page;
              if (pages <= 7) page = i + 1;
              else if (filters.page <= 4) page = i + 1;
              else if (filters.page >= pages - 3) page = pages - 6 + i;
              else page = filters.page - 3 + i;
              return (
                <button key={page} onClick={() => setPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${filters.page === page ? 'bg-primary-500 text-white' : 'border border-gray-200 dark:border-dark-500 hover:bg-gray-50 dark:hover:bg-dark-600'}`}>
                  {page}
                </button>
              );
            })}
            <button onClick={() => setPage(filters.page + 1)} disabled={filters.page === pages} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-500 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors text-sm font-medium">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
