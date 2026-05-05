import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

const STATUS_COLORS = {
  Calling:    { bg: '#FFF7ED', text: '#C2410C', dot: '#FB923C' },
  Ringing:    { bg: '#FFFBEB', text: '#92400E', dot: '#FBBF24' },
  'In Call':  { bg: '#F0FDF4', text: '#166534', dot: '#4ADE80' },
  'Call Ended': { bg: '#F9FAFB', text: '#374151', dot: '#9CA3AF' },
};

export default function DialPadPage() {
  const [number, setNumber] = useState('');
  const [callStatus, setCallStatus] = useState(null);
  const [duration, setDuration] = useState(0);
  const [callId, setCallId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (callStatus === 'In Call') {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const pressKey = (key) => {
    if (number.length < 15) setNumber((n) => n + key);
  };

  const deleteLast = () => setNumber((n) => n.slice(0, -1));

  const startCall = async () => {
    if (!number) return;
    setCallStatus('Calling');
    setDuration(0);
    try {
      const res = await api.post('/api/calls/start', { targetNumber: number }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCallId(res.data.callId);
      setTimeout(() => setCallStatus('Ringing'), 1500);
      setTimeout(() => setCallStatus('In Call'), 4000);
    } catch {
      setCallStatus('Call Ended');
    }
  };

  const endCall = async () => {
    const dur = formatDuration(duration);
    setCallStatus('Call Ended');
    try {
      await api.post('/api/calls/end', {
        callId,
        targetNumber: number,
        duration: dur,
        status: duration > 0 ? 'ended' : 'missed',
      });
    } catch {}
    setTimeout(() => {
      setCallStatus(null);
      setDuration(0);
    }, 2000);
  };

  const statusInfo = callStatus ? STATUS_COLORS[callStatus] : null;

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.pageTitle}>Dial Pad</h2>
          <p style={styles.pageSub}>Masukkan nomor tujuan panggilan</p>

          {/* Call status banner */}
          {callStatus && (
            <div style={{ ...styles.statusBanner, background: statusInfo.bg }}>
              <span style={{ ...styles.statusDot, background: statusInfo.dot }} />
              <span style={{ ...styles.statusText, color: statusInfo.text }}>{callStatus}</span>
              {callStatus === 'In Call' && (
                <span style={{ ...styles.durationText, color: statusInfo.text }}>
                  {formatDuration(duration)}
                </span>
              )}
            </div>
          )}

          {/* Number display */}
          <div style={styles.display}>
            <span style={styles.displayNumber}>{number || <span style={{ color: 'var(--gray-300)' }}>—</span>}</span>
            {number && (
              <button style={styles.deleteBtn} onClick={deleteLast}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="var(--gray-400)" strokeWidth="2" strokeLinejoin="round"/>
                  <line x1="18" y1="9" x2="15" y2="12" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="15" y1="9" x2="18" y2="12" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Keypad */}
          <div style={styles.keypad}>
            {KEYS.map((row, i) => (
              <div key={i} style={styles.keyRow}>
                {row.map((key) => (
                  <button
                    key={key}
                    style={styles.key}
                    onClick={() => pressKey(key)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--gray-100)';
                      e.currentTarget.style.transform = 'scale(0.96)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--gray-50)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Call / End buttons */}
          <div style={styles.actionRow}>
            {!callStatus || callStatus === 'Call Ended' ? (
              <button
                style={{ ...styles.callBtn, opacity: number ? 1 : 0.45 }}
                onClick={startCall}
                disabled={!number || (callStatus === 'Call Ended')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
                </svg>
                Panggil
              </button>
            ) : (
              <button style={styles.endBtn} onClick={endCall}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white" transform="rotate(135 12 12)"/>
                </svg>
                Tutup Panggilan
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--gray-50)' },
  main: { flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 16px' },
  card: {
    background: 'white',
    borderRadius: 24,
    padding: '32px 28px 28px',
    width: '100%',
    maxWidth: 380,
    boxShadow: 'var(--shadow-lg)',
    height: 'fit-content',
  },
  pageTitle: { fontSize: 20, fontWeight: 800, color: 'var(--gray-700)', textAlign: 'center', marginBottom: 4 },
  pageSub: { fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', marginBottom: 20 },
  statusBanner: {
    borderRadius: 12,
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  statusText: { fontWeight: 700, fontSize: 14, flex: 1 },
  durationText: { fontWeight: 600, fontSize: 13, fontVariantNumeric: 'tabular-nums' },
  display: {
    background: 'var(--gray-50)',
    borderRadius: 14,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    marginBottom: 20,
  },
  displayNumber: {
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--gray-700)',
    letterSpacing: 2,
    fontVariantNumeric: 'tabular-nums',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
  },
  keypad: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  keyRow: { display: 'flex', gap: 10, justifyContent: 'center' },
  key: {
    flex: 1,
    maxWidth: 88,
    height: 56,
    background: 'var(--gray-50)',
    border: '1.5px solid var(--gray-200)',
    borderRadius: 14,
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--gray-700)',
    cursor: 'pointer',
    transition: 'background 0.15s, transform 0.1s',
    fontFamily: 'var(--font)',
  },
  actionRow: { display: 'flex', justifyContent: 'center' },
  callBtn: {
    background: 'linear-gradient(135deg, var(--red-primary), var(--red-light))',
    color: 'white',
    border: 'none',
    borderRadius: 16,
    padding: '15px 36px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: 'var(--shadow-red)',
    transition: 'opacity 0.2s',
  },
  endBtn: {
    background: 'linear-gradient(135deg, #374151, #4B5563)',
    color: 'white',
    border: 'none',
    borderRadius: 16,
    padding: '15px 36px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 4px 16px rgba(55,65,81,0.3)',
  },
};
