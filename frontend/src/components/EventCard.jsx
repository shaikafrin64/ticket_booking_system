import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const EVENT_TYPE_LABELS = {
  T20_MATCH: 'T20',
  ODI_MATCH: 'ODI',
  TEST_MATCH: 'Test',
  IPL_MATCH: 'IPL',
  INTERNATIONAL_MATCH: 'International',
  CONCERT: 'Concert',
  OTHER: 'Event',
};

const STATUS_COLORS = {
  UPCOMING: { bg: '#1a3a1a', border: '#4CAF50', text: '#4CAF50' },
  LIVE: { bg: '#3a1a1a', border: '#ff4444', text: '#ff4444' },
  COMPLETED: { bg: '#2a2a2a', border: '#888', text: '#888' },
  CANCELLED: { bg: '#3a1a1a', border: '#ff6b6b', text: '#ff6b6b' },
};

export default function EventCard({ event }) {
  const statusStyle = STATUS_COLORS[event.status] || STATUS_COLORS.UPCOMING;
  const typeLabel = EVENT_TYPE_LABELS[event.eventType] || 'Event';
  const available = event.totalSeats - event.bookedSeats;
  const fillPercent = event.totalSeats ? (event.bookedSeats / event.totalSeats) * 100 : 0;

  const formatDate = (dt) => {
    const d = new Date(dt);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (dt) => {
    const d = new Date(dt);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={{ ...styles.typeBadge }}>{typeLabel}</span>
        <span style={{ ...styles.statusBadge, background: statusStyle.bg, borderColor: statusStyle.border, color: statusStyle.text }}>
          {event.status === 'LIVE' ? '🔴 LIVE' : event.status}
        </span>
      </div>

      <div style={styles.matchup}>
        <div style={styles.team}>
          <div style={styles.teamFlag}>{event.teamALogo}</div>
          <div style={styles.teamName}>{event.teamA}</div>
        </div>
        <div style={styles.vsBlock}>
          <span style={styles.vs}>VS</span>
        </div>
        {event.teamB && (
          <div style={styles.team}>
            <div style={styles.teamFlag}>{event.teamBLogo}</div>
            <div style={styles.teamName}>{event.teamB}</div>
          </div>
        )}
      </div>

      <div style={styles.name}>{event.name}</div>

      <div style={styles.meta}>
        <div style={styles.metaRow}>
          <Calendar size={14} color="#f0a500" />
          <span>{formatDate(event.startTime)}</span>
        </div>
        <div style={styles.metaRow}>
          <Clock size={14} color="#f0a500" />
          <span>{formatTime(event.startTime)}</span>
        </div>
        <div style={styles.metaRow}>
          <MapPin size={14} color="#f0a500" />
          <span>{event.stadiumName}</span>
        </div>
        <div style={styles.metaRow}>
          <Users size={14} color="#f0a500" />
          <span>{available} seats left</span>
        </div>
      </div>

      <div style={styles.fillBar}>
        <div style={{ ...styles.fillFill, width: `${fillPercent}%`, background: fillPercent > 80 ? '#ff4444' : '#4CAF50' }} />
      </div>

      {event.status === 'UPCOMING' || event.status === 'LIVE' ? (
        <Link to={`/event/${event.id}`} style={styles.bookBtn}>
          Book Tickets
        </Link>
      ) : (
        <div style={styles.disabledBtn}>{event.status === 'CANCELLED' ? 'Cancelled' : 'Completed'}</div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'linear-gradient(135deg, #1e2235 0%, #1a1a2e 100%)',
    border: '1px solid rgba(240,165,0,0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: {
    background: 'rgba(240,165,0,0.15)',
    border: '1px solid rgba(240,165,0,0.4)',
    color: '#f0a500',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    border: '1px solid',
  },
  matchup: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
  team: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 },
  teamFlag: {
    width: '50px', height: '50px',
    background: 'rgba(240,165,0,0.1)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: 'bold', color: '#f0a500',
    border: '2px solid rgba(240,165,0,0.3)',
  },
  teamName: { color: '#fff', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' },
  vsBlock: { color: '#f0a500', fontWeight: 'bold', fontSize: '1.1rem' },
  vs: {},
  name: { color: '#ccc', fontSize: '0.9rem', textAlign: 'center', lineHeight: '1.4' },
  meta: { display: 'flex', flexDirection: 'column', gap: '6px' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.85rem' },
  fillBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' },
  fillFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s' },
  bookBtn: {
    background: 'linear-gradient(135deg, #f0a500, #e09000)',
    color: '#1a1a2e',
    textDecoration: 'none',
    padding: '10px',
    borderRadius: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
  disabledBtn: {
    background: 'rgba(255,255,255,0.05)',
    color: '#666',
    padding: '10px',
    borderRadius: '10px',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
};
