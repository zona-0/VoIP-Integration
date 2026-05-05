export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.left}>
          <div style={styles.logoRow}>
            <div style={styles.icon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
              </svg>
            </div>
            <span style={styles.brand}>CaaS O2</span>
          </div>
          <p style={styles.desc}>Komunikasi suara berbasis VoIP dengan server Kamailio menggunakan protokol UDP/SIP.</p>
        </div>
        <div style={styles.right}>
          <p style={styles.copy}>© {new Date().getFullYear()} CaaS O2. Semua hak dilindungi.</p>
          <p style={styles.protocol}>SIP/UDP • Port 5060 • Kamailio Server</p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'var(--gray-700)',
    color: 'white',
    marginTop: 'auto',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '24px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },
  left: {},
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    background: 'var(--red-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontWeight: 700,
    fontSize: 15,
  },
  desc: {
    color: 'var(--gray-400)',
    fontSize: 13,
    maxWidth: 320,
    lineHeight: 1.6,
  },
  right: {
    textAlign: 'right',
  },
  copy: {
    fontSize: 13,
    color: 'var(--gray-300)',
    marginBottom: 4,
  },
  protocol: {
    fontSize: 12,
    color: 'var(--gray-400)',
  },
};
