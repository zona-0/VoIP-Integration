import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const user = JSON.parse(localStorage.getItem('caas_user') || '{}');

  const specs = [
    { label: 'Aplikasi', value: 'CaaS O2 Web' },
    { label: 'Versi', value: '1.0.0' },
    { label: 'Protokol', value: 'SIP/UDP' },
    { label: 'Port', value: '5060' },
    { label: 'Server', value: user.server || '-' },
    { label: 'Nomor Aktif', value: user.number || '-' },
  ];

  const features = [
    { icon: '📞', label: 'Panggilan Suara', desc: 'Panggilan real-time via VoIP Kamailio' },
    { icon: '🔢', label: 'Dial Pad', desc: 'Tombol angka untuk input nomor tujuan' },
    { icon: '📋', label: 'Call Log', desc: 'Riwayat lengkap semua panggilan' },
    { icon: '🔒', label: 'Autentikasi SIP', desc: 'Login aman via server Kamailio' },
  ];

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.userName}>{user.number || 'Pengguna'}</h2>
            <p style={styles.userRole}>SIP User — Kamailio VoIP</p>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Spesifikasi */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Spesifikasi Koneksi</h3>
            <div style={styles.specList}>
              {specs.map((s) => (
                <div key={s.label} style={styles.specItem}>
                  <span style={styles.specLabel}>{s.label}</span>
                  <span style={styles.specValue}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fitur */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Fitur Aplikasi</h3>
            <div style={styles.featureList}>
              {features.map((f) => (
                <div key={f.label} style={styles.featureItem}>
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <div>
                    <div style={styles.featureLabel}>{f.label}</div>
                    <div style={styles.featureDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div style={styles.infoBox}>
          <strong>ℹ️ Catatan:</strong> Nomor SIP harus terdaftar di server Kamailio oleh administrator.
          Aplikasi ini menggunakan protokol SIP/UDP untuk semua komunikasi suara real-time.
        </div>
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--gray-50)' },
  main: { flex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 24px', width: '100%' },
  profileCard: {
    background: 'linear-gradient(135deg, var(--red-primary), var(--red-dark))',
    borderRadius: 20,
    padding: '28px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 28,
    boxShadow: 'var(--shadow-red)',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.3)',
  },
  userName: { fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 },
  userRole: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 },
  section: {
    background: 'white',
    borderRadius: 16,
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--gray-100)',
  },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 16 },
  specList: { display: 'flex', flexDirection: 'column', gap: 12 },
  specItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottom: '1px solid var(--gray-100)',
  },
  specLabel: { fontSize: 13, color: 'var(--gray-400)', fontWeight: 500 },
  specValue: { fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' },
  featureList: { display: 'flex', flexDirection: 'column', gap: 14 },
  featureItem: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  featureIcon: {
    fontSize: 22,
    width: 40,
    height: 40,
    background: 'var(--red-pale)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureLabel: { fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 2 },
  featureDesc: { fontSize: 12, color: 'var(--gray-400)' },
  infoBox: {
    background: '#FFF7ED',
    border: '1px solid #FED7AA',
    borderRadius: 12,
    padding: '14px 18px',
    fontSize: 13,
    color: '#92400E',
    lineHeight: 1.6,
  },
};
