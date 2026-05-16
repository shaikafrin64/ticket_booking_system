import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/authService';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data);
      toast.success(`Welcome, ${res.data.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🏏</div>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.sub}>Start booking your cricket experience</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Rahul Kumar' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'rahul@example.com' },
            { label: 'Phone', key: 'phone', type: 'tel', placeholder: '9876543210' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                type={type} required={key !== 'phone'}
                style={styles.input} placeholder={placeholder}
                value={form[key]} onChange={set(key)}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account? <Link to="/login" style={styles.switchLink}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#0f0f1a',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
  },
  card: {
    background: 'linear-gradient(135deg, #1e2235, #1a1a2e)',
    border: '1px solid rgba(240,165,0,0.2)',
    borderRadius: '20px', padding: '2.5rem',
    width: '100%', maxWidth: '420px', textAlign: 'center',
  },
  logo: { fontSize: '3rem', marginBottom: '1rem' },
  title: { color: '#fff', margin: '0 0 0.5rem', fontSize: '1.6rem' },
  sub: { color: '#888', margin: '0 0 2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#aaa', fontSize: '0.9rem' },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '12px 16px',
    color: '#fff', fontSize: '1rem', outline: 'none',
  },
  btn: {
    background: 'linear-gradient(135deg, #f0a500, #e09000)',
    color: '#1a1a2e', border: 'none', padding: '14px',
    borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
  },
  switchText: { color: '#888', margin: '1.5rem 0 0', fontSize: '0.9rem' },
  switchLink: { color: '#f0a500', textDecoration: 'none' },
};
