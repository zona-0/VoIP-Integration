import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const user = JSON.parse(localStorage.getItem('caas_user') || '{}');
  const specs = [
    { label:'Aplikasi',     value:'VoIP CaaS-02' },
    { label:'Versi',        value:'1.0.0' },
    { label:'Protokol',     value:'SIP/UDP' },
    { label:'Port',         value:'8080' },
    { label:'Server',       value: user.server || '-' },
    { label:'Nomor Aktif',  value: user.number || '-' },
  ];
  const features = [
    { icon:'📞', label:'Voice Call',    desc:'Panggilan suara real-time via Kamailio' },
    { icon:'📹', label:'Video Call',    desc:'Video call berbasis WebRTC' },
    { icon:'🔢', label:'Dial Pad',      desc:'Keypad untuk input nomor tujuan' },
    { icon:'📋', label:'Call Log',      desc:'Riwayat panggilan tersimpan di Supabase' },
  ];

  return (
    <div style={s.page}>
      <Navbar />
      <main style={s.main}>
        <div style={s.profile}>
          <div style={s.avatar}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 style={s.uName}>{user.number || 'Pengguna'}</h2>
            {/* <p style={s.uRole}>SIP User — Kamailio VoIP</p> */}
          </div>
        </div>

        <div style={s.grid}>
          <div style={s.section}>
            <h3 style={s.secTitle}>Spesifikasi Koneksi</h3>
            {specs.map(sp => (
              <div key={sp.label} style={s.specRow}>
                <span style={s.specLabel}>{sp.label}</span>
                <span style={s.specVal}>{sp.value}</span>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <h3 style={s.secTitle}>Fitur Aplikasi</h3>
            {features.map(f => (
              <div key={f.label} style={s.featRow}>
                <span style={{ fontSize:20 }}>{f.icon}</span>
                <div>
                  <div style={s.featLabel}>{f.label}</div>
                  <div style={s.featDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.note}>
          Nomor SIP harus terdaftar di server Kamailio
        </div>
      </main>
      <Footer />
    </div>
  );
}

const s = {
  page:      { display:'flex', flexDirection:'column', minHeight:'100vh', background:'#f5f5f5' },
  main:      { flex:1, maxWidth:900, margin:'0 auto', padding:'28px 20px', width:'100%' },
  profile:   { background:'linear-gradient(135deg,#C8272D,#A01E23)', borderRadius:18, padding:'24px 28px', display:'flex', alignItems:'center', gap:18, marginBottom:24, boxShadow:'0 4px 20px rgba(200,39,45,.25)' },
  avatar:    { width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(255,255,255,.3)', flexShrink:0 },
  uName:     { fontSize:20, fontWeight:800, color:'white', marginBottom:4 },
  uRole:     { fontSize:13, color:'rgba(255,255,255,.7)' },
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:16 },
  section:   { background:'white', borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:'1px solid #f0f0f0' },
  secTitle:  { fontSize:14, fontWeight:700, color:'#222', marginBottom:14 },
  specRow:   { display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:10, borderBottom:'1px solid #f5f5f5', marginBottom:10 },
  specLabel: { fontSize:13, color:'#aaa', fontWeight:500 },
  specVal:   { fontSize:13, fontWeight:700, color:'#222' },
  featRow:   { display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 },
  featLabel: { fontSize:13, fontWeight:700, color:'#222', marginBottom:2 },
  featDesc:  { fontSize:12, color:'#aaa' },
  note:      { background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#92400E', lineHeight:1.6 },
};
