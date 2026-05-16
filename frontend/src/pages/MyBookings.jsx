import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import toast from 'react-hot-toast';
import { Ticket, X, Calendar, MapPin, Hash } from 'lucide-react';

const STATUS_STYLE = {
  CONFIRMED: { bg: '#1a3a1a', border: '#4CAF50', text: '#4CAF50' },
  CANCELLED: { bg: '#3a1a1a', border: '#ff6b6b', text: '#ff6b6b' },
  PENDING: { bg: '#2a2a1a', border: '#f0a500', text: '#f0a500' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    getMyBookings().then((res) => setBookings(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled successfully');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div style={styles.loading}>Loading your tickets...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}><Ticket size={28} color="#f0a500" /> My Tickets</h1>
        <p style={styles.sub}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🎫</div>
          <p>No bookings yet. Go book your first match!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {bookings.map((b) => {
            const st = STATUS_STYLE[b.status] || STATUS_STYLE.CONFIRMED;
            return (
              <div key={b.id} style={styles.ticket}>
                {/* Ticket left */}
                <div style={styles.ticketLeft}>
                  <div style={styles.ticketRef}>
                    <Hash size={14} color="#888" />
                    <span>{b.bookingReference}</span>
                  </div>
                  <div style={styles.matchTitle}>{b.teamA} vs {b.teamB || b.eventName}</div>
                  <div style={{ ...styles.statusBadge, background: st.bg, borderColor: st.border, color: st.text }}>
                    {b.status}
                  </div>

                  <div style={styles.ticketMeta}>
                    <div style={styles.metaItem}>
                      <Calendar size={14} color="#f0a500" />
                      {new Date(b.eventStartTime).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                    <div style={styles.metaItem}>
                      <MapPin size={14} color="#f0a500" />
                      {b.stadiumName}
                    </div>
                  </div>

                  <div style={styles.typeBadge}>{b.eventType?.replace('_', ' ')}</div>
                </div>

                {/* Divider */}
                <div style={styles.divider}>
                  <div style={styles.notchTop} />
                  <div style={styles.dashes} />
                  <div style={styles.notchBottom} />
                </div>

                {/* Ticket right */}
                <div style={styles.ticketRight}>
                  <div style={styles.seatInfo}>
                    <div style={styles.seatNum}>{b.seatNumber}</div>
                    <div style={styles.seatLabel}>SEAT</div>
                  </div>
                  <div style={styles.section}>{b.section}</div>
                  <div style={styles.row}>Row {b.rowLabel}</div>
                  <div style={styles.category}>{b.categoryName}</div>
                  <div style={styles.price}>₹{b.amountPaid}</div>

                  {b.cancellable && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancelling === b.id}
                      style={styles.cancelBtn}
                    >
                      <X size={14} />
                      {cancelling === b.id ? '...' : 'Cancel'}
                    </button>
                  )}
                  {b.status === 'CANCELLED' && b.cancelledAt && (
                    <div style={styles.cancelledAt}>
                      Cancelled on {new Date(b.cancelledAt).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '#0f0f1a', minHeight: '100vh', padding: '2rem', color: '#fff' },
  loading: { color: '#888', textAlign: 'center', padding: '4rem', background: '#0f0f1a', minHeight: '100vh' },
  header: { marginBottom: '2rem' },
  title: { color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 0.5rem', fontSize: '1.8rem' },
  sub: { color: '#888', margin: 0 },
  empty: { textAlign: 'center', color: '#888', padding: '5rem' },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  ticket: {
    display: 'flex',
    background: 'linear-gradient(135deg, #1e2235, #1a1a2e)',
    border: '1px solid rgba(240,165,0,0.2)',
    borderRadius: '16px',
    overflow: 'hidden',
    maxWidth: '750px',
  },
  ticketLeft: { padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  ticketRef: { display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.8rem' },
  matchTitle: { color: '#fff', fontWeight: '700', fontSize: '1.1rem' },
  statusBadge: {
    alignSelf: 'flex-start', padding: '3px 12px', borderRadius: '20px',
    border: '1px solid', fontSize: '0.75rem', fontWeight: 'bold',
  },
  ticketMeta: { display: 'flex', flexDirection: 'column', gap: '6px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.85rem' },
  typeBadge: {
    alignSelf: 'flex-start',
    background: 'rgba(240,165,0,0.1)',
    border: '1px solid rgba(240,165,0,0.3)',
    color: '#f0a500',
    padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem',
  },
  divider: {
    width: '1px',
    background: 'rgba(255,255,255,0.08)',
    position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
  },
  notchTop: { width: '16px', height: '8px', background: '#0f0f1a', borderRadius: '0 0 8px 8px', marginTop: '-1px' },
  notchBottom: { width: '16px', height: '8px', background: '#0f0f1a', borderRadius: '8px 8px 0 0', marginBottom: '-1px' },
  dashes: { flex: 1, borderLeft: '2px dashed rgba(255,255,255,0.1)' },
  ticketRight: {
    padding: '1.5rem',
    width: '150px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
    borderLeft: '1px solid rgba(255,255,255,0.05)',
  },
  seatInfo: { textAlign: 'center' },
  seatNum: { color: '#f0a500', fontSize: '1.8rem', fontWeight: '800' },
  seatLabel: { color: '#555', fontSize: '0.7rem', letterSpacing: '2px' },
  section: { color: '#ccc', fontSize: '0.85rem' },
  row: { color: '#888', fontSize: '0.8rem' },
  category: { color: '#aaa', fontSize: '0.8rem' },
  price: { color: '#4CAF50', fontWeight: 'bold', fontSize: '1.1rem' },
  cancelBtn: {
    background: 'rgba(255,80,80,0.1)',
    border: '1px solid rgba(255,80,80,0.4)',
    color: '#ff6b6b', borderRadius: '8px', padding: '6px 12px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem',
    marginTop: '4px',
  },
  cancelledAt: { color: '#555', fontSize: '0.75rem', textAlign: 'center' },
};
