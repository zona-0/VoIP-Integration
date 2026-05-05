import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const menuCards = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="2"/>
        <path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Dial Pad',
    desc: 'Masukkan nomor tujuan dan mulai panggilan',
    path: '/dialpad',
    color: 'linear-gradient(135deg, #C8272D, #E8434A)',
    shadow: 'rgba(200,39,45,0.35)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
      </svg>
    ),
    label: 'Call Log',
    desc: 'Lihat riwayat panggilan masuk dan keluar',
    path: '/calllog',
    color: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    shadow: 'rgba(37,99,235,0.35)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    label: 'About',
    desc: 'Informasi pengguna dan aplikasi VoIP',
    path: '/about',
    color: 'linear-gradient(135deg, #059669, #10B981)',
    shadow: 'rgba(5,150,105,0.35)',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('caas_user') || '{}');

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              Terhubung ke Kamailio
            </div>
            <h1 style={styles.heroTitle}>
              Selamat Datang, <br />
              <span style={styles.heroNumber}>{user.number}</span>
            </h1>
            <p style={styles.heroSub}>
              Server: <strong>{user.server}</strong> • Protokol SIP/UDP
            </p>
          </div>
          <div style={styles.heroArt}>
            <div style={styles.artRing1} />
            <div style={styles.artRing2} />
            <div style={styles.artCenter}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Menu Utama</h2>
          <div style={styles.cards}>
            {menuCards.map((card) => (
              <button
                key={card.path}
                style={styles.card}
                onClick={() => navigate(card.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${card.shadow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${card.shadow}`;
                }}
              >
                <div style={{ ...styles.cardIcon, background: card.color, boxShadow: `0 4px 16px ${card.shadow}` }}>
                  {card.icon}
                </div>
                <h3 style={styles.cardLabel}>{card.label}</h3>
                <p style={styles.cardDesc}>{card.desc}</p>
                <span style={styles.cardArrow}>→</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  main: { flex: 1, maxWidth: 1100, margin: '0 auto', padding: '32px 24px', width: '100%' },
  hero: {
    background: 'linear-gradient(135deg, var(--red-primary) 0%, #A01E23 100%)',
    borderRadius: 20,
    padding: '32px 36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {},
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#4ADE80',
    boxShadow: '0 0 6px #4ADE80',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: 'white',
    lineHeight: 1.25,
    marginBottom: 8,
    letterSpacing: '-0.5px',
  },
  heroNumber: { color: 'rgba(255,255,255,0.8)', fontWeight: 700 },
  heroSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  heroArt: {
    position: 'relative',
    width: 110,
    height: 110,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artRing1: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.15)',
    animation: 'pulse-ring 3s ease-out infinite',
  },
  artRing2: {
    position: 'absolute',
    inset: 15,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.2)',
    animation: 'pulse-ring 3s ease-out infinite 1s',
  },
  artCenter: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  },
  section: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--gray-700)',
    marginBottom: 20,
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '28px 24px',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-md)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    position: 'relative',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--gray-700)',
  },
  cardDesc: {
    fontSize: 13,
    color: 'var(--gray-400)',
    lineHeight: 1.5,
  },
  cardArrow: {
    position: 'absolute',
    top: 24,
    right: 24,
    fontSize: 18,
    color: 'var(--gray-300)',
  },
};
