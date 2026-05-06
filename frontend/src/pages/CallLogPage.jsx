import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';

const SC = {
  calling: { label:'Memanggil',      color:'#C2410C', bg:'#FFF7ED', icon:'↗' },
  missed: { label:'Tidak Terjawab', color:'#DC2626', bg:'#FEF2F2', icon:'↙' },
  received: { label:'Diterima',       color:'#059669', bg:'#F0FDF4', icon:'↙' },
  ended: { label:'Selesai',        color:'#2563EB', bg:'#EFF6FF', icon:'↗' },
};

const CALL_STATUS = {
  Calling: { bg:'#FFF7ED', text:'#C2410C', dot:'#FB923C' },
  Ringing: { bg:'#FFFBEB', text:'#92400E', dot:'#FBBF24' },
  'In Call....':{ bg:'#F0FDF4', text:'#166534', dot:'#4ADE80' },
  'Call Ended': { bg:'#F9FAFB', text:'#374151', dot:'#9CA3AF' },
};

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) +
    ' ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
}

function CallScreen({ number, callType, status, duration, onEnd, muted, setMuted, speakerOn, setSpeakerOn, videoOn, setVideoOn, onSwitchToVideo }) {
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const localRef = useRef(null);
  const cs = CALL_STATUS[status] || CALL_STATUS['In Call....'];

  useEffect(() => {
    if (callType === 'video' && videoOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(stream => { if (localRef.current) localRef.current.srcObject = stream; })
        .catch(() => {});
    }
    return () => { localRef.current?.srcObject?.getTracks().forEach(t => t.stop()); };
  }, [callType, videoOn]);

  return (
    <div style={sc.overlay}>
      {callType === 'video' && (
        <div style={sc.videoWrap}>
          <div style={sc.remoteBox}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ opacity:.3 }}>
              <rect x="2" y="7" width="15" height="10" rx="2" stroke="white" strokeWidth="1.5"/>
              <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={sc.localBox}>
            <video ref={localRef} autoPlay playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover', transform:'scaleX(-1)' }}/>
          </div>
        </div>
      )}

      {callType === 'voice' && (
        <div style={sc.avatarWrap}>
          <div style={sc.avatar}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="rgba(255,255,255,.7)" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={sc.badge}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
            </svg>
            Voice Call
          </div>
        </div>
      )}

      <div style={sc.info}>
        <p style={sc.num}>{number}</p>
        <p style={sc.stat}>{status}</p>
        <p style={sc.time}>{fmt(duration)}</p>
      </div>

      <div style={sc.ctrlRow}>
        <button style={{ ...sc.ctrlBtn, background: muted ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.15)' }} onClick={() => setMuted(m => !m)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {muted
              ? <><path d="M12 1a3 3 0 013 3v4" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M9 9v3a3 3 0 006 0" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M5 10a7 7 0 0013.3 2.2M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/></>
              : <><path d="M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3z" stroke="white" strokeWidth="2"/><path d="M19 10a7 7 0 01-14 0M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round"/></>
            }
          </svg>
        </button>

        {callType === 'voice' && (
          <button style={{ ...sc.ctrlBtn, background:'rgba(59,130,246,.4)' }} onClick={onSwitchToVideo} title="Switch ke Video">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="15" height="10" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {callType === 'video' && (
          <button style={{ ...sc.ctrlBtn, background: !videoOn ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.15)' }} onClick={() => setVideoOn(v => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="15" height="10" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <button style={sc.endBtn} onClick={onEnd}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white" transform="rotate(135 12 12)"/>
          </svg>
        </button>

        <button style={{ ...sc.ctrlBtn, background: speakerOn ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.15)' }} onClick={() => setSpeakerOn(sp => !sp)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            {speakerOn
              ? <><path d="M19.07 4.93a10 10 0 010 14.14" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M15.54 8.46a5 5 0 010 7.07" stroke="white" strokeWidth="2" strokeLinecap="round"/></>
              : <path d="M15.54 8.46a5 5 0 010 7.07" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function CallLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [inCall, setInCall] = useState(false);
  const [callNumber, setCallNumber]= useState('');
  const [callType, setCallType]  = useState('voice');
  const [status, setStatus] = useState('Calling....');
  const [duration, setDuration] = useState(0);
  const [callId, setCallId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    api.get('/api/calls/log')
      .then(res => setLogs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (inCall && status === 'In Call....') {
      timer.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [inCall, status]);

  const startCall = async (number, type) => {
    setCallNumber(number);
    setCallType(type);
    setInCall(true);
    setStatus('Calling....');
    setDuration(0);
    setMuted(false);
    setSpeakerOn(false);
    setVideoOn(true);
    try {
      const res = await api.post('/api/calls/start', { targetNumber: number, callType: type });
      setCallId(res.data.callId);
      setTimeout(() => setStatus('Ringing....'), 1500);
      setTimeout(() => setStatus('In Call....'), 4000);
    } catch {
      setStatus('In Call....');
    }
  };

  const endCall = async () => {
    const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    try {
      await api.post('/api/calls/end', {
        callId, targetNumber: callNumber,
        duration: fmt(duration),
        status: duration > 0 ? 'ended' : 'missed',
        callType,
      });
      const res = await api.get('/api/calls/log');
      setLogs(res.data.data || []);
    } catch {}
    setInCall(false); setStatus(''); setDuration(0);
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/api/calls/log/${id}`); } catch {}
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter);

  return (
    <div style={s.page}>
      <Navbar />

      {inCall && (
        <CallScreen
          number={callNumber} callType={callType} status={status} duration={duration}
          onEnd={endCall} onSwitchToVideo={() => setCallType('video')}
          muted={muted} setMuted={setMuted}
          speakerOn={speakerOn} setSpeakerOn={setSpeakerOn}
          videoOn={videoOn} setVideoOn={setVideoOn}
        />
      )}

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
            {/* <p style={{ fontSize:40, marginBottom:8 }}>📵</p> */}
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
                      <span style={s.metaTxt}>{log.type === 'video call' ? '📹 Video' : '📞 Suara'}</span>
                    </div>
                    <div style={s.time}>{fmtDate(log.timestamp)}</div>
                  </div>

                  <div style={s.right}>
                    <div style={s.dur}>{log.duration}</div>
                    <div style={s.callBtns}>

                      <button
                        style={s.voiceBack}
                        onClick={() => startCall(log.number, 'voice')}
                        title="Panggil Suara">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
                        </svg>
                      </button>

                      <button
                        style={s.videoBack}
                        onClick={() => startCall(log.number, 'video')}
                        title="Panggil Video">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="7" width="15" height="10" rx="2" stroke="white" strokeWidth="2"/>
                          <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button style={s.delBtn} onClick={() => handleDelete(log.id)}>✕</button>
                    </div>
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
  page: { display:'flex', flexDirection:'column', minHeight:'100vh', background:'#f5f5f5' },
  main: { flex:1, maxWidth:740, margin:'0 auto', padding:'28px 20px', width:'100%' },
  header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 },
  title: { fontSize:20, fontWeight:800, color:'#222', marginBottom:2 },
  sub: { fontSize:13, color:'#aaa' },
  filters: { display:'flex', gap:6, flexWrap:'wrap' },
  fBtn: { padding:'5px 12px', borderRadius:20, border:'1.5px solid #ddd', background:'white', fontSize:12, fontWeight:600, color:'#666', cursor:'pointer', fontFamily:'inherit' },
  fActive: { background:'#C8272D', color:'white', border:'1.5px solid #C8272D' },
  list: { display:'flex', flexDirection:'column', gap:10 },
  item: { background:'white', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:'1px solid #f0f0f0' },
  iconBox: { width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  info: { flex:1 },
  num: { fontSize:15, fontWeight:700, color:'#222', marginBottom:4 },
  meta: { display:'flex', alignItems:'center', gap:6, marginBottom:3 },
  badge: { fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20 },
  dot: { color:'#ddd', fontSize:12 },
  metaTxt: { fontSize:12, color:'#aaa' },
  time: { fontSize:11, color:'#bbb' },
  right: { textAlign:'right', flexShrink:0 },
  dur: { fontSize:13, fontWeight:700, color:'#555', fontVariantNumeric:'tabular-nums', marginBottom:6 },
  callBtns: { display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' },
  voiceBack: { width:30, height:30, borderRadius:'50%', background:'#22C55E', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(34,197,94,.35)' },
  videoBack: { width:30, height:30, borderRadius:'50%', background:'#3B82F6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(59,130,246,.35)' },
  delBtn: { background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:12, padding:'2px 6px', borderRadius:4 },
  empty: { textAlign:'center', padding:'60px 0', display:'flex', flexDirection:'column', alignItems:'center', color:'#aaa', fontSize:14, gap:8 },
  spin: { width:28, height:28, border:'3px solid #eee', borderTopColor:'#C8272D', borderRadius:'50%', animation:'spin .7s linear infinite' },
};

const sc = {
  overlay: { position:'fixed', inset:0, background:'linear-gradient(160deg,#7B0000 0%,#C8272D 60%,#8B0000 100%)', zIndex:999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'48px 24px' },
  videoWrap: { position:'relative', width:'100%', maxWidth:420, height:220, borderRadius:16, overflow:'hidden', background:'rgba(0,0,0,.25)' },
  remoteBox: { width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' },
  localBox: { position:'absolute', bottom:10, right:10, width:80, height:80, borderRadius:12, overflow:'hidden', background:'rgba(0,0,0,.4)', border:'2px solid rgba(255,255,255,.25)' },
  avatarWrap:{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 },
  avatar: { width:96, height:96, borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(255,255,255,.2)' },
  badge: { background:'rgba(255,255,255,.2)', color:'white', borderRadius:20, padding:'5px 16px', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 },
  info: { textAlign:'center' },
  num: { fontSize:26, fontWeight:700, color:'white', marginBottom:6 },
  stat: { fontSize:15, color:'rgba(255,255,255,.8)', marginBottom:4 },
  time: { fontSize:20, fontWeight:600, color:'white', fontVariantNumeric:'tabular-nums' },
  ctrlRow: { display:'flex', alignItems:'center', justifyContent:'center', gap:20 },
  ctrlBtn: { width:56, height:56, borderRadius:'50%', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s' },
  endBtn: { width:66, height:66, borderRadius:'50%', background:'#FF3B30', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(255,59,48,.5)' },
};