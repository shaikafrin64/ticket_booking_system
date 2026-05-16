import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SeatMap from '../components/SeatMap';
import { getEvent, getSeatsForEvent } from '../services/eventService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, MapPin, ArrowLeft, Ticket, Minus, Plus } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    Promise.all([getEvent(id), getSeatsForEvent(id)])
      .then(([eventRes, seatsRes]) => {
        setEvent(eventRes.data);
        setSeats(seatsRes.data);
      })
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  // When quantity changes, trim selected seats if over limit
  useEffect(() => {
    if (selectedSeats.length > quantity) {
      setSelectedSeats(prev => prev.slice(0, quantity));
    }
  }, [quantity]);

  const handleSeatSelect = (seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) return prev.filter(s => s.id !== seat.id);
      if (prev.length >= quantity) return [...prev.slice(1), seat]; // replace oldest
      return [...prev, seat];
    });
  };

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (selectedSeats.length === 0) { toast.error('Please select seats'); return; }
    if (selectedSeats.length < quantity) {
      toast.error(`Please select ${quantity} seat${quantity > 1 ? 's' : ''}`);
      return;
    }
    setBooking(true);
    try {
      for (const seat of selectedSeats) {
        await createBooking({ eventId: Number(id), seatId: seat.id });
      }
      toast.success(`${selectedSeats.length} ticket${selectedSeats.length > 1 ? 's' : ''} booked successfully! 🎉`);
      const seatsRes = await getSeatsForEvent(id);
      setSeats(seatsRes.data);
      setSelectedSeats([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!event) return <div style={styles.loading}>Event not found</div>;

  const formatDt = (dt) => new Date(dt).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const isBookable = event.status === 'UPCOMING' || event.status === 'LIVE';
  const totalPrice = selectedSeats.reduce((sum, s) => sum + Number(s.price), 0);

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.back}>
        <ArrowLeft size={18} /> Back
      </button>

      {/* Event header */}
      <div style={styles.header}>
        <div style={styles.matchup}>
          <div style={styles.team}>
            <div style={styles.teamBadge}>{event.teamALogo}</div>
            <span style={styles.teamName}>{event.teamA}</span>
          </div>
          <div>
            <div style={styles.vs}>VS</div>
            <div style={styles.typeTag}>{event.eventType?.replace(/_/g, ' ')}</div>
          </div>
          {event.teamB && (
            <div style={styles.team}>
              <div style={styles.teamBadge}>{event.teamBLogo}</div>
              <span style={styles.teamName}>{event.teamB}</span>
            </div>
          )}
        </div>
        <h2 style={styles.eventName}>{event.name}</h2>
        <div style={styles.metaRow}>
          <div style={styles.metaItem}><Calendar size={15} color="#f0a500" />{formatDt(event.startTime)}</div>
          <div style={styles.metaItem}><MapPin size={15} color="#f0a500" />{event.stadiumName} · {event.stadiumLocation}</div>
        </div>
        {event.status === 'CANCELLED' && (
          <div style={styles.cancelledBanner}>
            ❌ Cancelled: {event.cancellationReason}
          </div>
        )}
      </div>

      {/* Seat selection */}
      {isBookable ? (
        <div style={styles.seatSection}>
          {/* Title + quantity picker on same row */}
          <div style={styles.topBar}>
            <h3 style={styles.sectionTitle}>
              <Ticket size={18} color="#f0a500" /> Select Seats
              <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'normal' }}>
                ({event.totalSeats - event.bookedSeats} available)
              </span>
            </h3>

            {/* Quantity selector */}
            <div style={styles.quantityBox}>
              <span style={styles.quantityLabel}>Tickets</span>
              <div style={styles.quantityControls}>
                <button
                  style={styles.qBtn}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span style={styles.quantityNum}>{quantity}</span>
                <button
                  style={styles.qBtn}
                  onClick={() => setQuantity(q => Math.min(8, q + 1))}
                  disabled={quantity >= 8}
                >
                  <Plus size={14} />
                </button>
              </div>
              <span style={{ color: '#666', fontSize: '0.75rem' }}>max 8</span>
            </div>
          </div>

          {/* Hint */}
          <div style={styles.hint}>
            Click a stand section → pick {quantity} seat{quantity > 1 ? 's' : ''} from the panel
          </div>

          <SeatMap
            seats={seats}
            selectedSeats={selectedSeats}
            quantity={quantity}
            onSeatSelect={handleSeatSelect}
          />

          {/* Booking panel — always visible below the map */}
          <div style={styles.bookingPanel}>
            {selectedSeats.length === 0 ? (
              <div style={styles.bookingEmpty}>
                <span style={{ fontSize: '1.5rem' }}>🎟️</span>
                <span>Click a stand section above, then pick your seat{quantity > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div style={styles.bookingLeft}>
                <div style={styles.bookingSeats}>
                  {selectedSeats.map(s => (
                    <span key={s.id} style={styles.seatTag}>
                      {s.seatNumber}
                      <button style={styles.removeTag} onClick={() => handleSeatSelect(s)}>×</button>
                    </span>
                  ))}
                  {Array.from({ length: quantity - selectedSeats.length }).map((_, i) => (
                    <span key={`empty-${i}`} style={styles.seatTagEmpty}>+ select</span>
                  ))}
                </div>
                <div style={styles.bookingPrice}>
                  {selectedSeats.length}/{quantity} seat{quantity > 1 ? 's' : ''} ·&nbsp;
                  <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
                  {selectedSeats.length < quantity && (
                    <span style={{ color: '#ff9800', fontSize: '0.8rem' }}>
                      &nbsp;— select {quantity - selectedSeats.length} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={handleBook}
              disabled={booking || selectedSeats.length < quantity}
              style={{
                ...styles.confirmBtn,
                opacity: selectedSeats.length < quantity ? 0.45 : 1,
                cursor: selectedSeats.length < quantity ? 'not-allowed' : 'pointer',
              }}
            >
              {booking
                ? 'Booking...'
                : selectedSeats.length === 0
                ? 'Select Seats'
                : selectedSeats.length < quantity
                ? `Select ${quantity - selectedSeats.length} More`
                : `Book ${quantity} Ticket${quantity > 1 ? 's' : ''} · ₹${totalPrice.toLocaleString('en-IN')}`}
            </button>
          </div>

        </div>
      ) : (
        <div style={styles.unavailable}>
          Bookings not available for this event ({event.status})
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '#0f0f1a', minHeight: '100vh', padding: '1rem 1.5rem 2rem', color: '#fff', maxWidth: '1100px', margin: '0 auto' },
  loading: { color: '#888', textAlign: 'center', padding: '4rem', background: '#0f0f1a', minHeight: '100vh' },
  back: {
    background: 'none', border: 'none', color: '#f0a500',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '1rem', marginBottom: '1rem',
  },
  header: {
    background: 'linear-gradient(135deg, #1e2235, #1a1a2e)',
    border: '1px solid rgba(240,165,0,0.2)',
    borderRadius: '16px', padding: '1rem 1.5rem', marginBottom: '1rem',
  },
  matchup: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.5rem' },
  team: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  teamBadge: {
    width: '52px', height: '52px',
    background: 'rgba(240,165,0,0.1)', border: '2px solid rgba(240,165,0,0.4)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: 'bold', color: '#f0a500',
  },
  teamName: { color: '#fff', fontWeight: '700', fontSize: '1rem' },
  vs: { color: '#f0a500', fontWeight: 'bold', fontSize: '1.4rem', textAlign: 'center' },
  typeTag: {
    color: '#888', fontSize: '0.75rem', textAlign: 'center',
    background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2px 10px',
  },
  eventName: { color: '#fff', textAlign: 'center', margin: '0.3rem 0', fontSize: '1.2rem' },
  metaRow: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '0.85rem' },
  cancelledBanner: {
    background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.4)',
    color: '#ff6b6b', borderRadius: '8px', padding: '10px 14px', marginTop: '0.8rem',
  },
  seatSection: {
    background: '#1e2235', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '1rem 1.2rem',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.5rem',
  },
  sectionTitle: {
    color: '#f0a500', display: 'flex', alignItems: 'center', gap: '8px',
    margin: 0, fontSize: '1rem',
  },
  quantityBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '8px 14px',
  },
  quantityLabel: { color: '#aaa', fontSize: '0.85rem' },
  quantityControls: { display: 'flex', alignItems: 'center', gap: '10px' },
  qBtn: {
    background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)',
    color: '#f0a500', width: '28px', height: '28px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  quantityNum: { color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', minWidth: '20px', textAlign: 'center' },
  hint: { color: '#666', fontSize: '0.78rem', marginBottom: '0.8rem' },
  bookingPanel: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '1rem',
    background: 'rgba(240,165,0,0.06)',
    border: '1px solid rgba(240,165,0,0.25)',
    borderRadius: '14px', padding: '1rem 1.4rem',
    marginTop: '1rem',
  },
  bookingEmpty: {
    display: 'flex', alignItems: 'center', gap: '10px',
    color: '#666', fontSize: '0.9rem',
  },
  bookingLeft: { display: 'flex', flexDirection: 'column', gap: '6px' },
  bookingSeats: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  seatTag: {
    background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.4)',
    color: '#f0a500', borderRadius: '6px', padding: '4px 8px',
    fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
  },
  removeTag: {
    background: 'none', border: 'none', color: '#f0a500',
    cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0,
  },
  seatTagEmpty: {
    background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)',
    color: '#555', borderRadius: '6px', padding: '4px 8px', fontSize: '0.82rem',
  },
  bookingPrice: { color: '#aaa', fontSize: '0.88rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
  confirmBtn: {
    background: 'linear-gradient(135deg, #f0a500, #e09000)',
    color: '#1a1a2e', border: 'none', padding: '13px 28px',
    borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem',
    whiteSpace: 'nowrap',
  },
  unavailable: {
    background: '#1e2235', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#888',
  },
};
