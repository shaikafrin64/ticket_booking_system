import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminEvents, cancelEvent, updateEventStatus } from '../../services/eventService';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle, Play, Calendar, Users, TrendingUp } from 'lucide-react';

const STATUS_COLORS = {
  UPCOMING: '#4CAF50', LIVE: '#ff4444', COMPLETED: '#888', CANCELLED: '#ff6b6b',
};

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(null);

  const load = () => {
    getAdminEvents().then((res) => setEvents(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async () => {
    if (!reason.trim()) { toast.error('Please provide a reason'); return; }
    setProcessing(cancelModal);
    try {
      await cancelEvent(cancelModal, reason);
      toast.success('Event cancelled and all bookings refunded');
      setCancelModal(null);
      setReason('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel event');
    } finally {
      setProcessing(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setProcessing(id);
    try {
      await updateEventStatus(id, status);
      toast.success(`Event marked as ${status}`);
      load();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  const stats = {
    total: events.length,
    upcoming: events.filter((e) => e.status === 'UPCOMING').length,
    live: events.filter((e) => e.status === 'LIVE').length,
    totalBookings: events.reduce((sum, e) => sum + e.bookedSeats, 0),
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.sub}>Manage events at National Cricket Stadium</p>
        </div>
        <Link to="/admin/create-event" style={styles.createBtn}>
          <Plus size={18} /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Events', value: stats.total, icon: <Calendar size={24} />, color: '#4CAF50' },
          { label: 'Upcoming', value: stats.upcoming, icon: <TrendingUp size={24} />, color: '#f0a500' },
          { label: 'Live Now', value: stats.live, icon: <Play size={24} />, color: '#ff4444' },
          { label: 'Tickets Sold', value: stats.totalBookings, icon: <Users size={24} />, color: '#2196F3' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, color }}>{icon}</div>
            <div style={{ ...styles.statValue, color }}>{value}</div>
            <div style={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Events table */}
      <div style={styles.tableCard}>
        <h2 style={styles.tableTitle}>All Events</h2>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                {['Event', 'Type', 'Date & Time', 'Teams', 'Occupancy', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.eventName}>{e.name}</div>
                    <div style={styles.eventId}>#{e.id}</div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeTag}>{e.eventType?.replace('_', ' ')}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ color: '#ccc', fontSize: '0.85rem' }}>
                      {new Date(e.startTime).toLocaleDateString('en-IN')}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                      {new Date(e.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ color: '#ccc', fontSize: '0.85rem' }}>{e.teamA}</div>
                    {e.teamB && <div style={{ color: '#888', fontSize: '0.8rem' }}>vs {e.teamB}</div>}
                  </td>
                  <td style={styles.td}>
                    <div style={{ color: '#ccc', fontSize: '0.85rem' }}>{e.bookedSeats}/{e.totalSeats}</div>
                    <div style={styles.miniBar}>
                      <div style={{
                        ...styles.miniFill,
                        width: `${e.totalSeats ? (e.bookedSeats / e.totalSeats) * 100 : 0}%`,
                        background: e.bookedSeats / e.totalSeats > 0.8 ? '#ff4444' : '#4CAF50',
                      }} />
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: STATUS_COLORS[e.status] || '#888', fontWeight: '600', fontSize: '0.85rem' }}>
                      {e.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {e.status === 'UPCOMING' && (
                        <button
                          onClick={() => handleStatusChange(e.id, 'LIVE')}
                          disabled={processing === e.id}
                          style={{ ...styles.actionBtn, color: '#ff4444', borderColor: 'rgba(255,68,68,0.4)' }}
                        >
                          <Play size={14} /> Live
                        </button>
                      )}
                      {e.status === 'LIVE' && (
                        <button
                          onClick={() => handleStatusChange(e.id, 'COMPLETED')}
                          disabled={processing === e.id}
                          style={{ ...styles.actionBtn, color: '#4CAF50', borderColor: 'rgba(76,175,80,0.4)' }}
                        >
                          <CheckCircle size={14} /> Complete
                        </button>
                      )}
                      {(e.status === 'UPCOMING' || e.status === 'LIVE') && (
                        <button
                          onClick={() => setCancelModal(e.id)}
                          style={{ ...styles.actionBtn, color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.4)' }}
                        >
                          <X size={14} /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Cancel Event</h3>
            <p style={styles.modalSub}>All confirmed bookings will be automatically cancelled.</p>
            <textarea
              style={styles.textarea}
              placeholder="Reason for cancellation (e.g., Weather conditions, Player injury...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <div style={styles.modalActions}>
              <button onClick={() => { setCancelModal(null); setReason(''); }} style={styles.cancelModalBtn}>
                Keep Event
              </button>
              <button onClick={handleCancel} disabled={processing} style={styles.confirmCancelBtn}>
                {processing ? 'Cancelling...' : 'Yes, Cancel Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '#0f0f1a', minHeight: '100vh', padding: '2rem', color: '#fff' },
  loading: { color: '#888', textAlign: 'center', padding: '4rem', background: '#0f0f1a', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  title: { color: '#fff', margin: '0 0 0.5rem', fontSize: '1.8rem' },
  sub: { color: '#888', margin: 0 },
  createBtn: {
    background: 'linear-gradient(135deg, #f0a500, #e09000)',
    color: '#1a1a2e', textDecoration: 'none', padding: '12px 20px',
    borderRadius: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: {
    background: '#1e2235', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '1.5rem', textAlign: 'center',
  },
  statIcon: { marginBottom: '8px' },
  statValue: { fontSize: '2rem', fontWeight: '800', margin: '0 0 4px' },
  statLabel: { color: '#888', fontSize: '0.85rem' },
  tableCard: { background: '#1e2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' },
  tableTitle: { color: '#fff', margin: '0 0 1.5rem', fontSize: '1.1rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { borderBottom: '1px solid rgba(255,255,255,0.1)' },
  th: { color: '#888', fontSize: '0.8rem', fontWeight: '600', textAlign: 'left', padding: '10px 12px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '14px 12px', verticalAlign: 'middle' },
  eventName: { color: '#fff', fontWeight: '600', fontSize: '0.9rem' },
  eventId: { color: '#555', fontSize: '0.75rem' },
  typeTag: {
    background: 'rgba(240,165,0,0.1)', border: '1px solid rgba(240,165,0,0.3)',
    color: '#f0a500', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem',
  },
  miniBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px', width: '80px' },
  miniFill: { height: '100%', borderRadius: '2px' },
  actions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  actionBtn: {
    background: 'none', border: '1px solid', borderRadius: '6px',
    padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: '4px', fontSize: '0.8rem', transition: 'all 0.2s',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  },
  modal: {
    background: '#1e2235', border: '1px solid rgba(255,107,107,0.3)',
    borderRadius: '16px', padding: '2rem', maxWidth: '460px', width: '90%',
  },
  modalTitle: { color: '#ff6b6b', margin: '0 0 0.5rem', fontSize: '1.3rem' },
  modalSub: { color: '#888', margin: '0 0 1.5rem', fontSize: '0.9rem' },
  textarea: {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    color: '#fff', padding: '12px', fontSize: '0.95rem', outline: 'none',
    resize: 'vertical', boxSizing: 'border-box',
  },
  modalActions: { display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' },
  cancelModalBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#aaa', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
  },
  confirmCancelBtn: {
    background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.5)',
    color: '#ff6b6b', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
  },
};
