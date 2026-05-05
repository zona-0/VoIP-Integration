export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.wrap}>
        <div style={s.left}>
          <div style={s.brand}>
            <div style={s.icon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
              </svg>
            </div>
            <span style={s.brandTxt}>CaaS-02</span>
          </div>
          {/* <p style={s.desc}>Komunikasi suara berbasis VoIP dengan server Kamailio menggunakan protokol UDP/SIP.</p> */}
        </div>
        <p style={s.copy}>© {new Date().getFullYear()} CaaS-02. Semua hak dilindungi.</p>
      </div>
    </footer>
  );
}

const s = {
  footer: { background: '#1a1a1a', color: 'white', marginTop: 'auto' },
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  left: { display: 'flex', alignItems: 'center', gap: 16 },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  icon: { width: 28, height: 28, borderRadius: 8, background: '#C8272D', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandTxt: { fontWeight: 700, fontSize: 14, color: 'white' },
  desc: { color: '#888', fontSize: 12, maxWidth: 280 },
  copy: { fontSize: 12, color: '#888' },
};
