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
      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .nav-right { display: none !important; }
          .nav-burger { display: flex !important; }
        }
        @media (min-width: 641px) {
          .nav-mobile { display: none !important; }
          .nav-burger { display: none !important; }
        }
      `}</style>

      <div style={s.wrap}>
        <div style={s.brand}>
          <div style={s.logo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
            </svg>
          </div>
          <span style={s.brandTxt}>CaaS O2</span>
        </div>

        <div className="nav-links" style={s.links}>
          {NAV.map(n => (
            <NavLink key={n.path} to={n.path} end={n.path === '/'}
              style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })}>
              {n.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-right" style={s.right}>
          <span style={s.num}>{user.number}</span>
          <button style={s.out} onClick={logout}>Keluar</button>
        </div>

        <button className="nav-burger" style={s.burger} onClick={() => setOpen(!open)}>
          {open
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="20" y1="4" x2="4" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            : [0,1,2].map(i => <span key={i} style={s.bar}/>)
          }
        </button>
      </div>

      {open && (
        <div className="nav-mobile" style={s.mobile}>
          <div style={s.mUser}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ color:'rgba(255,255,255,.7)', fontSize:13 }}>{user.number}</span>
          </div>
          <div style={s.mDivider}/>
          {NAV.map(n => (
            <NavLink key={n.path} to={n.path} end={n.path === '/'}
              style={({ isActive }) => ({ ...s.mLink, ...(isActive ? s.mActive : {}) })}
              onClick={() => setOpen(false)}>
              {n.label}
            </NavLink>
          ))}
          <div style={s.mDivider}/>
          <button style={s.mOut} onClick={logout}>Keluar</button>
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: { background: 'var(--red-primary, #C8272D)', boxShadow: '0 2px 12px rgba(200,39,45,.3)', position: 'sticky', top: 0, zIndex: 100 },
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 16 },
  brand: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  logo: { width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brandTxt: { color: 'white', fontWeight: 700, fontSize: 15 },
  links: { display: 'flex', gap: 2, flex: 1 },
  link: { color: 'rgba(255,255,255,.8)', padding: '6px 12px', borderRadius: 8, fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' },
  active: { color: 'white', background: 'rgba(255,255,255,.2)', fontWeight: 600 },
  right: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  num: { color: 'rgba(255,255,255,.8)', fontSize: 13, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  out: { background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  burger: { display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'none', border: 'none', padding: 6, cursor: 'pointer', marginLeft: 'auto', minWidth: 32, minHeight: 32 },
  bar: { width: 20, height: 2, background: 'white', borderRadius: 2, display: 'block' },
  mobile: { background: 'rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', padding: '8px 12px 12px', gap: 2 },
  mUser: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' },
  mDivider: { height: 1, background: 'rgba(255,255,255,.15)', margin: '4px 0' },
  mLink: { color: 'rgba(255,255,255,.85)', padding: '10px 12px', borderRadius: 8, fontWeight: 500, fontSize: 15, display: 'block' },
  mActive: { background: 'rgba(255,255,255,.15)', color: 'white', fontWeight: 600 },
  mOut: { background: 'rgba(255,255,255,.1)', color: 'white', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginTop: 4 },
};