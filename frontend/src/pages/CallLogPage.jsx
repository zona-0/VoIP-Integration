import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api';

const STATUS_CONFIG = {
  missed:   { label: 'Tidak Terjawab', color: '#DC2626', bg: '#FEF2F2', icon: '↙' },
  received: { label: 'Diterima',       color: '#059669', bg: '#F0FDF4', icon: '↙' },
  ended:    { label: 'Selesai',        color: '#2563EB', bg: '#EFF6FF', icon: '↗' },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function CallLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/api/calls/log')
      .then((res) => setLogs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.status === filter);

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Riwayat Panggilan</h2>
            <p style={styles.sub}>{filtered.length} panggilan ditemukan</p>
          </div>
          {/* Filter tabs */}
          <div style={styles.filters}>
            {['all', 'missed', 'received', 'ended'].map((f) => (
              <button
                key={f}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f ? styles.filterActive : {}),
                }}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Semua' : STATUS_CONFIG[f]?.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={styles.empty}>
            <div style={styles.spinner} />
            <p>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="var(--gray-400)" strokeWidth="2" fill="none"/>
            </svg>
            <p style={{ color: 'var(--gray-400)', marginTop: 12 }}>Tidak ada riwayat panggilan</p>
          </div>
        ) : (
          <div style={styles.list}>
            {filtered.map((log) => {
              const sc = STATUS_CONFIG[log.status] || STATUS_CONFIG.ended;
              return (
                <div key={log.id} style={styles.item}>
                  <div style={{ ...styles.iconBox, background: sc.bg }}>
                    <span style={{ fontSize: 18, color: sc.color }}>{sc.icon}</span>
                  </div>
                  <div style={styles.info}>
                    <div style={styles.number}>{log.number}</div>
                    <div style={styles.meta}>
                      <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                      <span style={styles.metaDot}>·</span>
                      <span style={styles.metaText}>{log.type === 'video call' ? '📹 Video' : '📞 Suara'}</span>
                    </div>
                    <div style={styles.time}>{formatDate(log.timestamp)}</div>
                  </div>
                  <div style={styles.right}>
                    <div style={styles.duration}>{log.duration}</div>
                    <div style={styles.callStatusLabel}>{log.callStatus}</div>
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

const styles = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--gray-50)' },
  main: { flex: 1, maxWidth: 700, margin: '0 auto', padding: '32px 24px', width: '100%' },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: 800, color: 'var(--gray-700)', marginBottom: 2 },
  sub: { fontSize: 13, color: 'var(--gray-400)' },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1.5px solid var(--gray-200)',
    background: 'white',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--gray-500)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    fontFamily: 'var(--font)',
  },
  filterActive: {
    background: 'var(--red-primary)',
    color: 'white',
    border: '1.5px solid var(--red-primary)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: {
    background: 'white',
    borderRadius: 16,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--gray-100)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1 },
  number: { fontSize: 15, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 4 },
  meta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  statusBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 20,
  },
  metaDot: { color: 'var(--gray-300)', fontSize: 12 },
  metaText: { fontSize: 12, color: 'var(--gray-400)' },
  time: { fontSize: 11, color: 'var(--gray-400)' },
  right: { textAlign: 'right', flexShrink: 0 },
  duration: { fontSize: 14, fontWeight: 700, color: 'var(--gray-600)', fontVariantNumeric: 'tabular-nums' },
  callStatusLabel: { fontSize: 11, color: 'var(--gray-400)', marginTop: 2 },
  empty: {
    textAlign: 'center',
    padding: '60px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'var(--gray-400)',
    fontSize: 14,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid var(--gray-200)',
    borderTopColor: 'var(--red-primary)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    marginBottom: 12,
  },
};
