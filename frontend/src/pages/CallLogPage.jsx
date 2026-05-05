import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';

const SC = {
  calling:  { label:'Memanggil',      color:'#C2410C', bg:'#FFF7ED', icon:'↗' },
  missed:   { label:'Tidak Terjawab', color:'#DC2626', bg:'#FEF2F2', icon:'↙' },
  received: { label:'Diterima',       color:'#059669', bg:'#F0FDF4', icon:'↙' },
  ended:    { label:'Selesai',        color:'#2563EB', bg:'#EFF6FF', icon:'↗' },
};

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) +
    ' ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
}

export default function CallLogPage() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    api.get('/api/calls/log')
      .then(res => setLogs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try { await api.delete(`/api/calls/log/${id}`); } catch {}
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter);

  return (
    <div style={s.page}>
      <Navbar />
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Riwayat Panggilan</h2>
            <p style={s.sub}>{filtered.length} panggilan</p>
          </div>
          <div style={s.filters}>
            {['all','missed','received','ended'].map(f => (
              <button key={f}
                style={{ ...s.fBtn, ...(filter===f ? s.fActive : {}) }}
                onClick={() => setFilter(f)}>
                {f==='all' ? 'Semua' : SC[f]?.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={s.empty}><div style={s.spin}/><p>Memuat...</p></div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize:40, marginBottom:8 }}>📵</p>
            <p style={{ color:'#aaa' }}>Tidak ada riwayat panggilan</p>
          </div>
        ) : (
          <div style={s.list}>
            {filtered.map(log => {
              const sc = SC[log.status] || SC.ended;
              return (
                <div key={log.id} style={s.item}>
                  <div style={{ ...s.iconBox, background: sc.bg }}>
                    <span style={{ fontSize:16, color:sc.color }}>{sc.icon}</span>
                  </div>
                  <div style={s.info}>
                    <div style={s.num}>{log.number}</div>
                    <div style={s.meta}>
                      <span style={{ ...s.badge, background:sc.bg, color:sc.color }}>{sc.label}</span>
                      <span style={s.dot}>·</span>
                      <span style={s.metaTxt}>{log.callStatus === 'video' ? '📹 Video' : '📞 Suara'}</span>
                    </div>
                    <div style={s.time}>{fmtDate(log.timestamp)}</div>
                  </div>
                  <div style={s.right}>
                    <div style={s.dur}>{log.duration}</div>
                    <button style={s.delBtn} onClick={() => handleDelete(log.id)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const s = {
  page:    { display:'flex', flexDirection:'column', minHeight:'100vh', background:'#f5f5f5' },
  main:    { flex:1, maxWidth:700, margin:'0 auto', padding:'28px 20px', width:'100%' },
  header:  { display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 },
  title:   { fontSize:20, fontWeight:800, color:'#222', marginBottom:2 },
  sub:     { fontSize:13, color:'#aaa' },
  filters: { display:'flex', gap:6, flexWrap:'wrap' },
  fBtn:    { padding:'5px 12px', borderRadius:20, border:'1.5px solid #ddd', background:'white', fontSize:12, fontWeight:600, color:'#666', cursor:'pointer', fontFamily:'inherit' },
  fActive: { background:'#C8272D', color:'white', border:'1.5px solid #C8272D' },
  list:    { display:'flex', flexDirection:'column', gap:10 },
  item:    { background:'white', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:'1px solid #f0f0f0' },
  iconBox: { width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  info:    { flex:1 },
  num:     { fontSize:15, fontWeight:700, color:'#222', marginBottom:4 },
  meta:    { display:'flex', alignItems:'center', gap:6, marginBottom:3 },
  badge:   { fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20 },
  dot:     { color:'#ddd', fontSize:12 },
  metaTxt: { fontSize:12, color:'#aaa' },
  time:    { fontSize:11, color:'#bbb' },
  right:   { textAlign:'right', flexShrink:0 },
  dur:     { fontSize:13, fontWeight:700, color:'#555', fontVariantNumeric:'tabular-nums', marginBottom:4 },
  delBtn:  { background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:12, padding:'2px 6px', borderRadius:4 },
  empty:   { textAlign:'center', padding:'60px 0', display:'flex', flexDirection:'column', alignItems:'center', color:'#aaa', fontSize:14, gap:8 },
  spin:    { width:28, height:28, border:'3px solid #eee', borderTopColor:'#C8272D', borderRadius:'50%', animation:'spin .7s linear infinite' },
};
