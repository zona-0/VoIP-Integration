import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    number: '',
    password: '',
    server: '192.168.1.100:5060',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async () => {
    if (!form.number || !form.password || !form.server) {
      setError('Semua field harus diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/login', {
        number: form.number,
        password: form.password,
        server: form.server,
      });

      if (res.data.success) {
        localStorage.setItem('caas_token', res.data.token);
        localStorage.setItem('caas_user', JSON.stringify(res.data.user));
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal terhubung ke server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={styles.page}>
      {/* Background decorations */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <div style={styles.iconPulse} />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
            </svg>
          </div>
          <h1 style={styles.title}>CaaS O2</h1>
          <p style={styles.subtitle}>Masuk dengan nomor SIP terdaftar</p>
        </div>

        {/* Form */}
        <div style={styles.form}>
          {/* SIP Number */}
          <div style={styles.field}>
            <label style={styles.label}>Nomor Handphone / SIP</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="var(--gray-400)"/>
                </svg>
              </span>
              <input
                name="number"
                type="tel"
                placeholder="Contoh: 081234567890"
                value={form.number}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password SIP</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--gray-400)" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Password SIP"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={styles.input}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--gray-400)" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="var(--gray-400)" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Server Kamailio */}
          <div style={styles.field}>
            <label style={styles.label}>Server Kamailio</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="var(--gray-400)" strokeWidth="2"/>
                  <path d="M8 21h8M12 17v4" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                name="server"
                type="text"
                value={form.server}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={styles.input}
              />
            </div>
            <span style={styles.fieldHint}>Format: host:port (contoh: 192.168.1.100:5060)</span>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#C8272D" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#C8272D" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#C8272D"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingRow}>
                <span style={styles.spinner} />
                Menghubungkan...
              </span>
            ) : 'Masuk'}
          </button>

          <p style={styles.note}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" stroke="var(--gray-400)" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="var(--gray-400)"/>
            </svg>
            Nomor harus terdaftar di server Kamailio (SIP/UDP)
          </p>
        </div>
      </div>

      {/* Footer note */}
      <p style={styles.footerNote}>CaaS O2 © {new Date().getFullYear()} — VoIP Kamailio Integration</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFF0F0 0%, #FAFAFA 50%, #FFF5F5 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(200,39,45,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(200,39,45,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'white',
    borderRadius: 24,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(200,39,45,0.08)',
    position: 'relative',
    animation: 'fadeInUp 0.5s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    background: 'linear-gradient(135deg, var(--red-primary), var(--red-light))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 6px 20px rgba(200,39,45,0.35)',
    position: 'relative',
  },
  iconPulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    background: 'rgba(200,39,45,0.3)',
    animation: 'pulse-ring 2s ease-out infinite',
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--red-primary)',
    letterSpacing: '-0.5px',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--gray-400)',
    fontWeight: 400,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--gray-600)',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 16px 11px 38px',
    border: '1.5px solid var(--gray-200)',
    borderRadius: 10,
    fontSize: 14,
    color: 'var(--gray-700)',
    background: 'var(--gray-50)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  fieldHint: {
    fontSize: 11,
    color: 'var(--gray-400)',
  },
  errorBox: {
    background: '#FFF0F0',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: 'var(--red-primary)',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  btn: {
    background: 'linear-gradient(135deg, var(--red-primary), var(--red-light))',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 700,
    width: '100%',
    boxShadow: 'var(--shadow-red)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    marginTop: 4,
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  note: {
    fontSize: 12,
    color: 'var(--gray-400)',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
  },
  footerNote: {
    marginTop: 24,
    fontSize: 12,
    color: 'var(--gray-400)',
  },
};
