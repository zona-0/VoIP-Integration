import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';
import { initSIP, makeCall, endCall, toggleMute, toggleCamera } from '../sip';

const KEYS = [['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']];

function IncomingCallDialog({ caller, onAnswer, onAnswerVideo, onReject }) {
  return (
    <div style={ic.overlay}>
      <div style={ic.card}>
        <div style={ic.avatar}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={ic.label}>Panggilan Masuk</p>
        <p style={ic.number}>{caller}</p>
        <div style={ic.btns}>
          <button style={ic.rejectBtn} onClick={onReject}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white" transform="rotate(135 12 12)"/>
            </svg>
          </button>
          <button style={ic.answerBtn} onClick={onAnswer}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
            </svg>
          </button>
          <button style={ic.videoAnswerBtn} onClick={onAnswerVideo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="15" height="10" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p style={ic.hint}>Tolak · Angkat · Video</p>
      </div>
    </div>
  );
}

function CallScreen({ number, callType, status, duration, onEnd, onSwitchToVideo, muted, setMuted, speakerOn, setSpeakerOn, videoOn, setVideoOn, remoteVideoRef, localVideoRef }) {
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const handleMute = () => { const n = !muted; setMuted(n); toggleMute(n); };
  const handleVideo = () => { const n = !videoOn; setVideoOn(n); toggleCamera(n); };

  return (
    <div style={sc.overlay}>
      {callType === 'video' && (
        <div style={sc.videoWrap}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          <div style={sc.localBox}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover', transform:'scaleX(-1)' }}/>
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
        <button style={{ ...sc.ctrlBtn, background: muted ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.15)' }} onClick={handleMute}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {muted
              ? <><path d="M12 1a3 3 0 013 3v4" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M9 9v3a3 3 0 006 0" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M5 10a7 7 0 0013.3 2.2M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/></>
              : <><path d="M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3z" stroke="white" strokeWidth="2"/><path d="M19 10a7 7 0 01-14 0M12 19v4M8 23h8" stroke="white" strokeWidth="2" strokeLinecap="round"/></>
            }
          </svg>
        </button>

        {callType === 'voice' && (
          <button style={{ ...sc.ctrlBtn, background:'rgba(59,130,246,.4)' }} onClick={onSwitchToVideo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="15" height="10" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M17 9l5-3v12l-5-3V9z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {callType === 'video' && (
          <button style={{ ...sc.ctrlBtn, background: !videoOn ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.15)' }} onClick={handleVideo}>
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

export default function DialPadPage() {
  const [number, setNumber] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState('voice');
  const [status, setStatus] = useState('');
  const [duration, setDuration] = useState(0);
  const [callId, setCallId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [sipStatus, setSipStatus] = useState('');
  const [incomingCall, setIncomingCall] = useState(null);

  const timer = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('caas_user') || '{}');

  useEffect(() => {
    if (user.number) {
      const savedPassword = sessionStorage.getItem('caas_password') || 'test1234';
      console.log('[SIP] Init for:', user.number);
      initSIP({
        number: user.number,
        password: savedPassword,
        onStatus: ({ type, message }) => {
          setSipStatus(message);
          console.log('[SIP] Status:', type, message);
        },
        onIncoming: (callInfo) => {
          setIncomingCall(callInfo);
          console.log('[SIP] Incoming from:', callInfo.number);
        },
      });
    }
  }, []);

  useEffect(() => {
    if (inCall && status === 'In Call....') {
      timer.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [inCall, status]);

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const startCall = async (type) => {
    if (!number) return;
    setCallType(type);
    setInCall(true);
    setStatus('Calling....');
    setDuration(0);
    setMuted(false);
    setSpeakerOn(false);
    setVideoOn(true);

    console.log(`[DB] Saving call log... target=${number} type=${type}`);
    try {
      const res = await api.post('/api/calls/start', { targetNumber: number, callType: type });
      setCallId(res.data.callId);
      console.log(`[DB] SUCCESS: Call log saved | ID=${res.data.callId} | target=${number} | type=${type}`);

      makeCall({
        targetNumber: number,
        isVideo: type === 'video',
        remoteVideoRef,
        localVideoRef,
        onCallStatus: (newStatus) => {
          setStatus(newStatus);
          console.log('[CALL] Status changed:', newStatus);
          if (newStatus === 'Call Ended' || newStatus.startsWith('Call Failed')) {
            setTimeout(() => { setInCall(false); setStatus(''); setDuration(0); }, 2000);
          }
        },
      });
    } catch (err) {
      console.error(`[DB] FAILED: Save call log | error=${err.message}`);
      setTimeout(() => setStatus('Ringing....'), 1500);
      setTimeout(() => setStatus('In Call....'), 4000);
    }
  };

  const handleEndCall = async () => {
    const d = fmt(duration);
    const sts = duration > 0 ? 'ended' : 'missed';
    endCall();
    console.log(`[DB] Updating call log... ID=${callId} duration=${d} status=${sts}`);
    try {
      await api.post('/api/calls/end', {
        callId,
        targetNumber: number,
        duration: d,
        status: sts,
        callType,
      });
      console.log(`[DB] SUCCESS: Call log updated | ID=${callId} | duration=${d} | status=${sts}`);
    } catch (err) {
      console.error(`[DB] FAILED: Update call log | error=${err.message}`);
    }
    setInCall(false);
    setStatus('');
    setDuration(0);
  };

  const handleAnswerVoice = () => {
    incomingCall?.answer(false);
    setCallNumber(incomingCall?.number);
    setCallType('voice');
    setInCall(true);
    setStatus('In Call....');
    setIncomingCall(null);
  };

  const handleAnswerVideo = () => {
    incomingCall?.answer(true);
    setCallNumber(incomingCall?.number);
    setCallType('video');
    setInCall(true);
    setStatus('In Call....');
    setIncomingCall(null);
  };

  const handleReject = () => {
    incomingCall?.reject();
    setIncomingCall(null);
  };

  return (
    <div style={s.page}>
      <Navbar />

      {incomingCall && (
        <IncomingCallDialog
          caller={incomingCall.number}
          onAnswer={handleAnswerVoice}
          onAnswerVideo={handleAnswerVideo}
          onReject={handleReject}
        />
      )}

      {inCall && (
        <CallScreen
          number={number || callNumber}
          callType={callType} status={status} duration={duration}
          onEnd={handleEndCall} onSwitchToVideo={() => setCallType('video')}
          muted={muted} setMuted={setMuted}
          speakerOn={speakerOn} setSpeakerOn={setSpeakerOn}
          videoOn={videoOn} setVideoOn={setVideoOn}
          remoteVideoRef={remoteVideoRef} localVideoRef={localVideoRef}
        />
      )}

      <main style={s.main}>
        <div style={s.card}>
          <h2 style={s.title}>Dial Pad</h2>
          <p style={s.sub}>Masukkan nomor tujuan panggilan</p>

          {sipStatus && (
            <div style={{
              ...s.sipStatus,
              background: sipStatus.includes('Terdaftar') ? '#F0FDF4' : '#FFF7ED',
              color: sipStatus.includes('Terdaftar') ? '#166534' : '#92400E',
            }}>
              {sipStatus}
            </div>
          )}

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
              onClick={() => startCall('voice')} disabled={!number}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
              </svg>
            </button>
            <button style={{ ...s.videoBtn, opacity: number?1:.4 }}
              onClick={() => startCall('video')} disabled={!number}>
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
  sub: { fontSize:13, color:'#aaa', textAlign:'center', marginBottom:12 },
  sipStatus: { borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:600, textAlign:'center', marginBottom:12 },
  disp: { background:'#f8f8f8', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:52, marginBottom:16, border:'1.5px solid #eee' },
  dn: { fontSize:28, fontWeight:700, color:'#222', letterSpacing:2, fontVariantNumeric:'tabular-nums' },
  delIcon: { background:'none', border:'none', cursor:'pointer', padding:6, display:'flex' },
  pad: { display:'flex', flexDirection:'column', gap:8, marginBottom:20 },
  row: { display:'flex', gap:8, justifyContent:'center' },
  key: { flex:1, maxWidth:96, height:58, background:'#fafafa', border:'1.5px solid #eee', borderRadius:14, fontSize:22, fontWeight:700, color:'#222', cursor:'pointer', transition:'background .12s', fontFamily:'inherit' },
  btns: { display:'flex', alignItems:'center', justifyContent:'center', gap:16 },
  bsDel: { width:48, height:48, borderRadius:14, background:'#f5f5f5', border:'1.5px solid #eee', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  voiceBtn: { width:64, height:64, borderRadius:'50%', background:'#22C55E', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(34,197,94,.35)', transition:'opacity .15s' },
  videoBtn: { width:64, height:64, borderRadius:'50%', background:'#3B82F6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(59,130,246,.35)', transition:'opacity .15s' },
};

const sc = {
  overlay: { position:'fixed', inset:0, background:'linear-gradient(160deg,#7B0000 0%,#C8272D 60%,#8B0000 100%)', zIndex:999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', padding:'clamp(24px,5vw,48px) clamp(16px,4vw,24px)', boxSizing:'border-box' },
  videoWrap: { position:'relative', width:'100%', maxWidth:'min(420px,90vw)', height:'clamp(160px,30vh,260px)', borderRadius:16, overflow:'hidden', background:'rgba(0,0,0,.25)', flexShrink:0 },
  localBox: { position:'absolute', bottom:10, right:10, width:'clamp(60px,15vw,90px)', height:'clamp(60px,15vw,90px)', borderRadius:12, overflow:'hidden', background:'rgba(0,0,0,.4)', border:'2px solid rgba(255,255,255,.25)' },
  avatarWrap: { display:'flex', flexDirection:'column', alignItems:'center', gap:14 },
  avatar: { width:'clamp(72px,20vw,96px)', height:'clamp(72px,20vw,96px)', borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid rgba(255,255,255,.2)' },
  badge: { background:'rgba(255,255,255,.2)', color:'white', borderRadius:20, padding:'5px 16px', fontSize:'clamp(11px,3vw,13px)', fontWeight:600, display:'flex', alignItems:'center', gap:6 },
  info: { textAlign:'center', padding:'0 16px' },
  num: { fontSize:'clamp(18px,5vw,26px)', fontWeight:700, color:'white', marginBottom:6, wordBreak:'break-all' },
  stat: { fontSize:'clamp(13px,3.5vw,15px)', color:'rgba(255,255,255,.8)', marginBottom:4 },
  time: { fontSize:'clamp(16px,4vw,20px)', fontWeight:600, color:'white', fontVariantNumeric:'tabular-nums' },
  ctrlRow: { display:'flex', alignItems:'center', justifyContent:'center', gap:'clamp(12px,4vw,20px)', flexWrap:'wrap', padding:'0 16px', width:'100%' },
  ctrlBtn: { width:'clamp(44px,12vw,56px)', height:'clamp(44px,12vw,56px)', borderRadius:'50%', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s', flexShrink:0 },
  endBtn: { width:'clamp(52px,14vw,66px)', height:'clamp(52px,14vw,66px)', borderRadius:'50%', background:'#FF3B30', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(255,59,48,.5)', flexShrink:0 },
};

const ic = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' },
  card: { background:'white', borderRadius:24, padding:'clamp(20px,5vw,32px) clamp(16px,5vw,28px)', width:'min(300px,90vw)', textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,.3)', boxSizing:'border-box' },
  avatar: { width:'clamp(56px,15vw,72px)', height:'clamp(56px,15vw,72px)', borderRadius:'50%', background:'linear-gradient(135deg,#C8272D,#E8434A)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' },
  label: { fontSize:'clamp(11px,3vw,13px)', color:'#aaa', marginBottom:4 },
  number: { fontSize:'clamp(16px,5vw,22px)', fontWeight:800, color:'#222', marginBottom:24, wordBreak:'break-all' },
  btns: { display:'flex', justifyContent:'center', gap:'clamp(10px,4vw,16px)', marginBottom:8 },
  rejectBtn: { width:'clamp(44px,12vw,56px)', height:'clamp(44px,12vw,56px)', borderRadius:'50%', background:'#FF3B30', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(255,59,48,.4)' },
  answerBtn: { width:'clamp(44px,12vw,56px)', height:'clamp(44px,12vw,56px)', borderRadius:'50%', background:'#22C55E', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(34,197,94,.4)' },
  videoAnswerBtn: { width:'clamp(44px,12vw,56px)', height:'clamp(44px,12vw,56px)', borderRadius:'50%', background:'#3B82F6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(59,130,246,.4)' },
  hint: { fontSize:'clamp(10px,2.5vw,11px)', color:'#bbb' },
};