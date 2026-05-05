import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';

const KEYS = [['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']];

function CallScreen({ number, callType, status, duration, onEnd, onSwitchToVideo, muted, setMuted, speakerOn, setSpeakerOn, videoOn, setVideoOn }) {
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const localRef = useRef(null);

  useEffect(() => {
    if (callType === 'video' && videoOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(stream => { if (localRef.current) localRef.current.srcObject = stream; })
        .catch(() => {});
    }
    return () => {
      localRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    };
  }, [callType, videoOn]);

  return (
    <div style={sc.overlay}>
      {callType === 'video' && (
        <div style={sc.videoWrap}>
          <div style={sc.remoteBox}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ opacity:.35 }}>
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
        <button
          style={{ ...sc.ctrlBtn, background: muted ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.15)' }}
          onClick={() => setMuted(m => !m)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {muted
              ? <><path d="M12 1a3 3 0 013 3v4" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M9 9v3a3 3 0 006 0" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M5 10a7 7 0 0013.3 2.2M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/></>
              : <><path d="M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3z" stroke="white" strokeWidth="2"/><path d="M19 10a7 7 0 01-14 0M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round"/></>
            }
          </svg>
        </button>

        {callType === 'video' && (
          <button
            style={{ ...sc.ctrlBtn, background: !videoOn ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.15)' }}
            onClick={() => setVideoOn(v => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="15" height="10" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {callType === 'voice' && (
          <button
            style={{ ...sc.ctrlBtn, background: 'rgba(59,130,246,.4)' }}
            onClick={onSwitchToVideo}
            title="Switch ke Video Call">
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

        <button
          style={{ ...sc.ctrlBtn, background: speakerOn ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.15)' }}
          onClick={() => setSpeakerOn(sp => !sp)}>
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

export default function DialPadPage() {
  const [number, setNumber] = useState('');
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState('voice');
  const [status, setStatus] = useState('');
  const [duration, setDuration] = useState(0);
  const [callId, setCallId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    if (inCall && status === 'In Call....') {
      timer.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [inCall, status]);

  const startCall = async (type) => {
    if (!number) return;
    setCallType(type); setInCall(true);
    setStatus('Calling....'); setDuration(0);
    setMuted(false); setSpeakerOn(false); setVideoOn(true);
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
        callId, targetNumber: number,
        duration: fmt(duration),
        status: duration > 0 ? 'ended' : 'missed',
        callType: callType,
      });
    } catch {}
    setInCall(false); setStatus(''); setDuration(0);
  };

  return (
    <div style={s.page}>
      <Navbar />

      {inCall && (
        <CallScreen
          number={number} callType={callType} status={status} duration={duration}
          onEnd={endCall} onSwitchToVideo={() => setCallType('video')} muted={muted} setMuted={setMuted}
          speakerOn={speakerOn} setSpeakerOn={setSpeakerOn}
          videoOn={videoOn} setVideoOn={setVideoOn}
        />
      )}

      <main style={s.main}>
        <div style={s.card}>
          <h2 style={s.title}>Dial Pad</h2>
          <p style={s.sub}>Masukkan nomor tujuan panggilan</p>

          <div style={s.disp}>
            <span style={s.dn}>{number || <span style={{ color:'#ccc' }}>—</span>}</span>
            {number && (
              <button style={s.delIcon} onClick={() => setNumber(n => n.slice(0,-1))}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="#bbb" strokeWidth="2" strokeLinejoin="round"/>
                  <line x1="18" y1="9" x2="15" y2="12" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="15" y1="9" x2="18" y2="12" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          <div style={s.pad}>
            {KEYS.map((row, i) => (
              <div key={i} style={s.row}>
                {row.map(k => (
                  <button key={k} style={s.key}
                    onClick={() => number.length < 15 && setNumber(n => n + k)}
                    onMouseEnter={e => e.currentTarget.style.background='#efefef'}
                    onMouseLeave={e => e.currentTarget.style.background='#fafafa'}>
                    {k}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div style={s.btns}>
            <button style={s.bsDel} onClick={() => setNumber(n => n.slice(0,-1))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="#aaa" strokeWidth="2" strokeLinejoin="round"/>
                <line x1="18" y1="9" x2="15" y2="12" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
                <line x1="15" y1="9" x2="18" y2="12" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <button style={{ ...s.voiceBtn, opacity: number?1:.4 }}
              onClick={() => startCall('voice')} disabled={!number} title="Voice Call">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
              </svg>
            </button>

            <button style={{ ...s.videoBtn, opacity: number?1:.4 }}
              onClick={() => startCall('video')} disabled={!number} title="Video Call">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="15" height="10" rx="2" stroke="white" strokeWidth="2"/>
                <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const s = {
  page: { display:'flex', flexDirection:'column', minHeight:'100vh', background:'#f5f5f5' },
  main: { flex:1, display:'flex', justifyContent:'center', padding:'32px 16px' },
  card: { background:'white', borderRadius:24, padding:'28px 24px', width:'100%', maxWidth:360, boxShadow:'0 8px 32px rgba(0,0,0,.10)', height:'fit-content' },
  title: { fontSize:20, fontWeight:800, color:'#222', textAlign:'center', marginBottom:4 },
  sub: { fontSize:13, color:'#aaa', textAlign:'center', marginBottom:20 },
  disp: { background:'#f8f8f8', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:52, marginBottom:16, border:'1.5px solid #eee' },
  dn: { fontSize:28, fontWeight:700, color:'#222', letterSpacing:2, fontVariantNumeric:'tabular-nums' },
  delIcon: { background:'none', border:'none', cursor:'pointer', padding:6, display:'flex' },
  pad: { display:'flex', flexDirection:'column', gap:8, marginBottom:20 },
  row: { display:'flex', gap:8, justifyContent:'center' },
  key: { flex:1, maxWidth:96, height:58, background:'#fafafa', border:'1.5px solid #eee', borderRadius:14, fontSize:22, fontWeight:700, color:'#222', cursor:'pointer', transition:'background .12s', fontFamily:'inherit' },
  btns: { display:'flex', alignItems:'center', justifyContent:'center', gap:16 },
  bsDel: { width:48, height:48, borderRadius:14, background:'#f5f5f5', border:'1.5px solid #eee', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  voiceBtn:{ width:64, height:64, borderRadius:'50%', background:'#22C55E', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(34,197,94,.35)', transition:'opacity .15s' },
  videoBtn:{ width:64, height:64, borderRadius:'50%', background:'#3B82F6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(59,130,246,.35)', transition:'opacity .15s' },
};

const sc = {
  overlay: { position:'fixed', inset:0, background:'linear-gradient(160deg,#7B0000 0%,#C8272D 60%,#8B0000 100%)', zIndex:999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'48px 24px 48px' },
  videoWrap:{ position:'relative', width:'100%', maxWidth:420, height:220, borderRadius:16, overflow:'hidden', background:'rgba(0,0,0,.25)', marginBottom:8 },
  remoteBox:{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' },
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