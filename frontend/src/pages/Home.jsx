import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { getAllEvents } from '../services/eventService';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_TYPES = ['ALL', 'T20_MATCH', 'ODI_MATCH', 'TEST_MATCH', 'IPL_MATCH', 'INTERNATIONAL_MATCH'];
const TYPE_LABELS = {
  ALL: 'All', T20_MATCH: 'T20', ODI_MATCH: 'ODI',
  TEST_MATCH: 'Test', IPL_MATCH: 'IPL', INTERNATIONAL_MATCH: 'International',
};

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    getAllEvents()
      .then((res) => setEvents(res.data))
      .catch(() => toast.error('Failed to load events — is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.teamA?.toLowerCase().includes(search.toLowerCase()) ||
      e.teamB?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || e.eventType === typeFilter;
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🏏 Book Your Cricket Experience</h1>
        <p style={styles.heroSub}>National Cricket Stadium · New Delhi</p>

        <div style={styles.searchBox}>
          <Search size={18} color="#888" />
          <input
            style={styles.searchInput}
            placeholder="Search matches, teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <Filter size={16} color="#f0a500" />
          {EVENT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{ ...styles.filterBtn, ...(typeFilter === t ? styles.filterActive : {}) }}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div style={styles.filterGroup}>
          {['ALL', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{ ...styles.filterBtn, ...(statusFilter === s ? styles.filterActive : {}) }}
            >
              {s === 'ALL' ? 'All Status' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <div style={styles.loading}>Loading events...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>No events found</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f0f1a', paddingBottom: '3rem' },
  hero: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #16213e 100%)',
    padding: '3rem 2rem',
    textAlign: 'center',
    borderBottom: '1px solid rgba(240,165,0,0.2)',
  },
  heroTitle: { color: '#f0a500', fontSize: '2rem', margin: '0 0 0.5rem', fontWeight: '800' },
  heroSub: { color: '#888', margin: '0 0 2rem' },
  searchBox: {
    maxWidth: '500px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    gap: '10px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    flex: 1,
    outline: 'none',
  },
  filters: {
    padding: '1.5rem 2rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  filterBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#aaa',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  filterActive: {
    background: 'rgba(240,165,0,0.15)',
    border: '1px solid #f0a500',
    color: '#f0a500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    padding: '2rem',
  },
  loading: { color: '#888', textAlign: 'center', padding: '4rem' },
  empty: { color: '#666', textAlign: 'center', padding: '4rem' },
};
