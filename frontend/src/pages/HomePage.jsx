import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MENUS = [
  { icon: '🔢', label: 'Dial Pad', desc: 'Masukkan nomor tujuan dan mulai panggilan', path: '/dialpad', grad: 'linear-gradient(135deg,#C8272D,#E8434A)', shadow: 'rgba(200,39,45,.35)' },
  { icon: '📋', label: 'Call Log', desc: 'Lihat riwayat panggilan masuk dan keluar',  path: '/calllog', grad: 'linear-gradient(135deg,#2563EB,#3B82F6)', shadow: 'rgba(37,99,235,.35)' },
  { icon: '👤', label: 'About', desc: 'Informasi pengguna dan aplikasi VoIP', path: '/about', grad: 'linear-gradient(135deg,#059669,#10B981)', shadow: 'rgba(5,150,105,.35)' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('caas_user') || '{}');

  return (
    <div style={s.page}>
      <Navbar />
      <main style={s.main}>
        <div style={s.hero}>
          <div>
            <h1 style={s.ht}>Selamat Datang,<br /><span style={s.hn}>{user.number}</span></h1>
            <p style={s.hs}>Server: <strong>{user.server}</strong></p>
          </div>
          <div style={s.art}>
            <div style={s.r1} /><div style={s.r2} />
            <div style={s.rc}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>

        <h2 style={s.sec}>Menu Utama</h2>
        <div style={s.grid}>
          {MENUS.map(m => (
            <button key={m.path} style={s.card} onClick={() => navigate(m.path)}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${m.shadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}>
              <div style={{ ...s.ci, background: m.grad, boxShadow: `0 4px 16px ${m.shadow}` }}>
                <span style={{ fontSize: 26 }}>{m.icon}</span>
              </div>
              <h3 style={s.cl}>{m.label}</h3>
              <p style={s.cd}>{m.desc}</p>
              <span style={s.arr}>→</span>
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const s = {
  page: { display:'flex', flexDirection:'column', minHeight:'100vh' },
  main: { flex:1, maxWidth:1100, margin:'0 auto', padding:'32px 24px', width:'100%' },
  hero: { background:'linear-gradient(135deg,var(--red-primary),var(--red-dark))', borderRadius:20, padding:'32px 36px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40, overflow:'hidden' },
  badge:{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.15)', color:'white', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600, marginBottom:12 },
  dot: { width:7, height:7, borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 6px #4ADE80', display:'inline-block' },
  ht: { fontSize:28, fontWeight:800, color:'white', lineHeight:1.25, marginBottom:8 },
  hn: { color:'rgba(255,255,255,.8)' },
  hs: { color:'rgba(255,255,255,.65)', fontSize:13 },
  art: { position:'relative', width:110, height:110, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' },
  r1: { position:'absolute', inset:0, borderRadius:'50%', border:'2px solid rgba(255,255,255,.15)', animation:'pulse-ring 3s ease-out infinite' },
  r2: { position:'absolute', inset:15, borderRadius:'50%', border:'2px solid rgba(255,255,255,.2)', animation:'pulse-ring 3s ease-out infinite 1s' },
  rc: { width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' },
  sec: { fontSize:18, fontWeight:700, color:'var(--gray-700)', marginBottom:20 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 },
  card: { background:'white', borderRadius:16, padding:'28px 24px', border:'none', textAlign:'left', cursor:'pointer', boxShadow:'var(--shadow-md)', transition:'transform .2s,box-shadow .2s', display:'flex', flexDirection:'column', gap:10, position:'relative' },
  ci: { width:56, height:56, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 },
  cl: { fontSize:16, fontWeight:700, color:'var(--gray-700)' },
  cd: { fontSize:13, color:'var(--gray-400)', lineHeight:1.5 },
  arr: { position:'absolute', top:24, right:24, fontSize:18, color:'var(--gray-300)' },
};
