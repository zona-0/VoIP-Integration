import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const NAV = [
  { label: 'Beranda', path: '/' },
  { label: 'Dial Pad', path: '/dialpad' },
  { label: 'Call Log', path: '/calllog' },
  { label: 'Tentang', path: '/about' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('caas_user') || '{}');
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('caas_token');
    localStorage.removeItem('caas_user');
    navigate('/login');
  };

  return (
    <nav style={s.nav}>
      <div style={s.wrap}>
        <div style={s.brand}>
          <div style={s.logo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
            </svg>
          </div>
          <span style={s.brandTxt}>CaaS O2</span>
        </div>

        <div style={s.links}>
          {NAV.map(n => (
            <NavLink key={n.path} to={n.path} end={n.path === '/'}
              style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })}>
              {n.label}
            </NavLink>
          ))}
        </div>

        <div style={s.right}>
          <span style={s.num}>{user.number}</span>
          <button style={s.out} onClick={logout}>Keluar</button>
        </div>

        <button style={s.burger} onClick={() => setOpen(!open)}>
          {[0,1,2].map(i => <span key={i} style={s.bar} />)}
        </button>
      </div>

      {open && (
        <div style={s.mobile}>
          {NAV.map(n => (
            <NavLink key={n.path} to={n.path} end={n.path === '/'}
              style={({ isActive }) => ({ ...s.mLink, ...(isActive ? s.mActive : {}) })}
              onClick={() => setOpen(false)}>
              {n.label}
            </NavLink>
          ))}
          <button style={s.mOut} onClick={logout}>Keluar</button>
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: { background: 'var(--red-primary)', boxShadow: '0 2px 12px rgba(200,39,45,.3)', position: 'sticky', top: 0, zIndex: 100 },
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 24 },
  brand: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  logo: { width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandTxt:{ color: 'white', fontWeight: 700, fontSize: 16 },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: { color: 'rgba(255,255,255,.8)', padding: '6px 14px', borderRadius: 8, fontWeight: 500, fontSize: 14 },
  active: { color: 'white', background: 'rgba(255,255,255,.2)', fontWeight: 600 },
  right: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  num: { color: 'rgba(255,255,255,.8)', fontSize: 13, fontWeight: 500 },
  out: { background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  burger: { display: 'none', flexDirection: 'column', gap: 5, background: 'none', padding: 4, cursor: 'pointer', marginLeft: 'auto' },
  bar: { width: 22, height: 2, background: 'white', borderRadius: 2, display: 'block' },
  mobile: { background: 'var(--red-dark)', display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: 4 },
  mLink: { color: 'rgba(255,255,255,.85)', padding: '10px 14px', borderRadius: 8, fontWeight: 500, fontSize: 15 },
  mActive: { background: 'rgba(255,255,255,.15)', color: 'white', fontWeight: 600 },
  mOut: { background: 'rgba(255,255,255,.15)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginTop: 8 },
};
