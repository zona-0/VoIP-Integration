import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { label: 'Beranda', path: '/' },
  { label: 'Dial Pad', path: '/dialpad' },
  { label: 'Call Log', path: '/calllog' },
  { label: 'About', path: '/about' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('caas_user') || '{}');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('caas_token');
    localStorage.removeItem('caas_user');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.brand}>
          <div style={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
            </svg>
          </div>
          <span style={styles.brandName}>CaaS O2</span>
        </div>

        {/* Desktop nav */}
        <div style={styles.links}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* User info + logout */}
        <div style={styles.userArea}>
          <span style={styles.userNum}>{user.number || ''}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Keluar</button>
        </div>

        {/* Mobile hamburger */}
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} />
          <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...styles.mobileLink,
                ...(isActive ? styles.mobileLinkActive : {}),
              })}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <button style={styles.mobileLogout} onClick={handleLogout}>Keluar</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    background: 'var(--red-primary)',
    boxShadow: '0 2px 12px rgba(200,39,45,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: 'white',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: '-0.3px',
  },
  links: {
    display: 'flex',
    gap: 4,
    flex: 1,
  },
  link: {
    color: 'rgba(255,255,255,0.8)',
    padding: '6px 14px',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 14,
    transition: 'var(--transition)',
  },
  linkActive: {
    color: 'white',
    background: 'rgba(255,255,255,0.2)',
    fontWeight: 600,
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  userNum: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: 500,
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: 5,
    background: 'none',
    padding: 4,
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  bar: {
    width: 22,
    height: 2,
    background: 'white',
    borderRadius: 2,
    display: 'block',
    transition: 'all 0.3s ease',
  },
  mobileMenu: {
    background: 'var(--red-dark)',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 16px',
    gap: 4,
  },
  mobileLink: {
    color: 'rgba(255,255,255,0.85)',
    padding: '10px 14px',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 15,
  },
  mobileLinkActive: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontWeight: 600,
  },
  mobileLogout: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    marginTop: 8,
  },
};
