import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Ticket, User, LayoutDashboard, Calendar } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <span style={styles.brandIcon}>🏏</span>
        <span>StadiumBook</span>
      </Link>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>
          <Calendar size={16} /> Events
        </Link>

        {user ? (
          <>
            {isAdmin ? (
              <Link to="/admin" style={styles.link}>
                <LayoutDashboard size={16} /> Admin
              </Link>
            ) : (
              <Link to="/my-bookings" style={styles.link}>
                <Ticket size={16} /> My Tickets
              </Link>
            )}
            <div style={styles.userInfo}>
              <User size={16} />
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    color: '#f0a500',
    textDecoration: 'none',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandIcon: { fontSize: '1.6rem' },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  userInfo: {
    color: '#f0a500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
  },
  logoutBtn: {
    background: 'rgba(255,80,80,0.15)',
    border: '1px solid rgba(255,80,80,0.4)',
    color: '#ff6b6b',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
  },
  registerBtn: {
    background: 'linear-gradient(135deg, #f0a500, #e09000)',
    color: '#1a1a2e',
    textDecoration: 'none',
    padding: '8px 18px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
};
