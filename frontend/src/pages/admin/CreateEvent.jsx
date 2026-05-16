import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../services/eventService';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'T20_MATCH', label: 'T20 Match' },
  { value: 'ODI_MATCH', label: 'ODI Match' },
  { value: 'TEST_MATCH', label: 'Test Match' },
  { value: 'IPL_MATCH', label: 'IPL Match' },
  { value: 'INTERNATIONAL_MATCH', label: 'International Match' },
  { value: 'CONCERT', label: 'Concert' },
  { value: 'OTHER', label: 'Other' },
];

const TEAM_PRESETS = [
  'India', 'Australia', 'England', 'South Africa', 'Pakistan',
  'New Zealand', 'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan',
  'Delhi Capitals', 'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore',
  'Kolkata Knight Riders', 'Sunrisers Hyderabad', 'Punjab Kings', 'Rajasthan Royals',
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    eventType: 'T20_MATCH',
    teamA: '',
    teamB: '',
    teamALogo: '',
    teamBLogo: '',
    startTime: '',
    endTime: '',
  });

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate name when teams change
      if ((field === 'teamA' || field === 'teamB') && updated.eventType) {
        const typeLabel = EVENT_TYPES.find((t) => t.value === updated.eventType)?.label || '';
        if (updated.teamA && updated.teamB) {
          updated.name = `${updated.teamA} vs ${updated.teamB} - ${typeLabel}`;
        }
      }
      // Auto-generate logos (abbreviations)
      if (field === 'teamA') updated.teamALogo = value.slice(0, 3).toUpperCase();
      if (field === 'teamB') updated.teamBLogo = value.slice(0, 3).toUpperCase();
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        startTime: form.startTime,
        endTime: form.endTime || null,
      };
      await createEvent(payload);
      toast.success('Event created successfully! 🎉');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <button onClick={() => navigate('/admin')} style={styles.back}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}><Plus size={24} color="#f0a500" /> Create New Event</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Event Type */}
          <div style={styles.field}>
            <label style={styles.label}>Event Type *</label>
            <div style={styles.typeGrid}>
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value} type="button"
                  onClick={() => setForm({ ...form, eventType: t.value })}
                  style={{
                    ...styles.typeBtn,
                    ...(form.eventType === t.value ? styles.typeBtnActive : {}),
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Team A *</label>
              <input
                list="teams-a" required style={styles.input}
                placeholder="Select or type team"
                value={form.teamA} onChange={set('teamA')}
              />
              <datalist id="teams-a">
                {TEAM_PRESETS.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div style={styles.vsDiv}>VS</div>
            <div style={styles.field}>
              <label style={styles.label}>Team B</label>
              <input
                list="teams-b" style={styles.input}
                placeholder="Select or type team"
                value={form.teamB} onChange={set('teamB')}
              />
              <datalist id="teams-b">
                {TEAM_PRESETS.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>

          {/* Event Name */}
          <div style={styles.field}>
            <label style={styles.label}>Event Name *</label>
            <input
              required style={styles.input}
              placeholder="India vs Australia - 1st T20I"
              value={form.name} onChange={set('name')}
            />
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea} rows={3}
              placeholder="Brief description about the event..."
              value={form.description} onChange={set('description')}
            />
          </div>

          {/* Date/Time */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Start Date & Time *</label>
              <input
                type="datetime-local" required style={styles.input}
                value={form.startTime} onChange={set('startTime')}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>End Date & Time</label>
              <input
                type="datetime-local" style={styles.input}
                value={form.endTime} onChange={set('endTime')}
                min={form.startTime}
              />
            </div>
          </div>

          {/* Preview */}
          {form.teamA && (
            <div style={styles.preview}>
              <div style={styles.previewTitle}>Preview</div>
              <div style={styles.previewTeams}>
                <div style={styles.previewBadge}>{form.teamALogo || form.teamA.slice(0, 3).toUpperCase()}</div>
                <span style={{ color: '#f0a500', fontWeight: 'bold' }}>VS</span>
                {form.teamB && <div style={styles.previewBadge}>{form.teamBLogo || form.teamB.slice(0, 3).toUpperCase()}</div>}
              </div>
              <div style={{ color: '#fff', fontWeight: '600', textAlign: 'center', marginTop: '8px' }}>{form.name}</div>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#0f0f1a', minHeight: '100vh', padding: '2rem', color: '#fff' },
  back: {
    background: 'none', border: 'none', color: '#f0a500', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '1.5rem',
  },
  card: {
    background: '#1e2235', border: '1px solid rgba(240,165,0,0.2)',
    borderRadius: '20px', padding: '2rem', maxWidth: '750px', margin: '0 auto',
  },
  title: {
    color: '#fff', margin: '0 0 2rem',
    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  label: { color: '#aaa', fontSize: '0.9rem', fontWeight: '500' },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '12px 16px',
    color: '#fff', fontSize: '1rem', outline: 'none',
  },
  textarea: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '12px 16px',
    color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'vertical',
  },
  typeGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  typeBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#aaa', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
  },
  typeBtnActive: {
    background: 'rgba(240,165,0,0.15)',
    border: '1px solid #f0a500',
    color: '#f0a500',
  },
  row: { display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  vsDiv: { color: '#f0a500', fontWeight: 'bold', fontSize: '1.2rem', paddingBottom: '12px', flexShrink: 0 },
  preview: {
    background: 'rgba(240,165,0,0.05)', border: '1px solid rgba(240,165,0,0.2)',
    borderRadius: '12px', padding: '1.5rem',
  },
  previewTitle: { color: '#888', fontSize: '0.8rem', marginBottom: '12px', textAlign: 'center', textTransform: 'uppercase' },
  previewTeams: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
  previewBadge: {
    width: '50px', height: '50px',
    background: 'rgba(240,165,0,0.1)', border: '2px solid rgba(240,165,0,0.4)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#f0a500', fontWeight: 'bold', fontSize: '0.85rem',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #f0a500, #e09000)',
    color: '#1a1a2e', border: 'none', padding: '14px',
    borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
  },
};
