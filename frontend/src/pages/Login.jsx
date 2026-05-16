import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/authService';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate(res.data.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🏏</div>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.sub}>Sign in to book your seats</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email" required style={styles.input}
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" required style={styles.input}
              placeholder="••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.hints}>
          <p style={styles.hintTitle}>Demo accounts:</p>
          <p style={styles.hint}>Admin: admin@stadium.com / admin123</p>
          <p style={styles.hint}>User: user@stadium.com / user123</p>
        </div>

        <p style={styles.switchText}>
          Don't have an account? <Link to="/register" style={styles.switchLink}>Register</Link>
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
    width: '100%', maxWidth: '420px',
    textAlign: 'center',
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
    borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem',
    cursor: 'pointer', marginTop: '0.5rem',
  },
  hints: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', padding: '1rem', margin: '1.5rem 0 0',
  },
  hintTitle: { color: '#f0a500', margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: '600' },
  hint: { color: '#777', margin: '0.2rem 0', fontSize: '0.8rem' },
  switchText: { color: '#888', margin: '1.5rem 0 0', fontSize: '0.9rem' },
  switchLink: { color: '#f0a500', textDecoration: 'none' },
};
