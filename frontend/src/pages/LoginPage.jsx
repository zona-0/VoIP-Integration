import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ number: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [showPass, setShowPass] = useState(false);

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const onEnter  = (e) => { if (e.key === 'Enter') login(); };

  const login = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      localStorage.setItem('caas_token', res.data.token);
      localStorage.setItem('caas_user',  JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.bg1} /><div style={s.bg2} />
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.icon}><div style={s.pulse} />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="white"/>
            </svg>
          </div>
          <h1 style={s.title}>CaaS O2</h1>
          <p style={s.sub}>Masuk dengan nomor SIP terdaftar</p>
        </div>

        <div style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Nomor Handphone / SIP</label>
            <input name="number" type="tel" placeholder="Contoh: 081234567890"
              value={form.number} onChange={onChange} onKeyDown={onEnter} style={s.input} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password SIP</label>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPass ? 'text' : 'password'} placeholder="Password SIP"
                value={form.password} onChange={onChange} onKeyDown={onEnter}
                style={{ ...s.input, paddingRight: 44 }} />
              <button type="button" style={s.eye} onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--gray-400)" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="var(--gray-400)" strokeWidth="2"/></svg>
                }
              </button>
            </div>
          </div>

          {error && (
            <div style={s.err}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#C8272D" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#C8272D" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#C8272D"/>
              </svg>
              {error}
            </div>
          )}

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={login} disabled={loading}>
            {loading
              ? <span style={s.loadRow}><span style={s.spin} />Menghubungkan...</span>
              : 'Masuk'}
          </button>

          <p style={s.note}>Nomor harus terdaftar di server Kamailio (SIP/UDP)</p>
        </div>
      </div>
      <p style={s.foot}>CaaS O2 © {new Date().getFullYear()} — VoIP Kamailio Integration</p>
    </div>
  );
}

const s = {
  page:    { minHeight: '100vh', background: 'linear-gradient(135deg,#FFF0F0 0%,#FAFAFA 50%,#FFF5F5 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden' },
  bg1:     { position: 'absolute', top: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,39,45,.08) 0%,transparent 70%)', pointerEvents: 'none' },
  bg2:     { position: 'absolute', bottom: -100, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,39,45,.06) 0%,transparent 70%)', pointerEvents: 'none' },
  card:    { background: 'white', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,.1),0 2px 8px rgba(200,39,45,.08)', position: 'relative', animation: 'fadeInUp .5s ease' },
  header:  { textAlign: 'center', marginBottom: 32 },
  icon:    { width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg,var(--red-primary),var(--red-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 20px rgba(200,39,45,.35)', position: 'relative' },
  pulse:   { position: 'absolute', inset: 0, borderRadius: 20, background: 'rgba(200,39,45,.3)', animation: 'pulse-ring 2s ease-out infinite' },
  title:   { fontSize: 26, fontWeight: 800, color: 'var(--red-primary)', letterSpacing: '-.5px', marginBottom: 6 },
  sub:     { fontSize: 14, color: 'var(--gray-400)' },
  form:    { display: 'flex', flexDirection: 'column', gap: 18 },
  field:   { display: 'flex', flexDirection: 'column', gap: 6 },
  label:   { fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' },
  input:   { width: '100%', padding: '11px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 10, fontSize: 14, color: 'var(--gray-700)', background: 'var(--gray-50)', boxSizing: 'border-box' },
  eye:     { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  hint:    { fontSize: 11, color: 'var(--gray-400)' },
  err:     { background: '#FFF0F0', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red-primary)', fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: 8 },
  btn:     { background: 'linear-gradient(135deg,var(--red-primary),var(--red-light))', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, width: '100%', boxShadow: 'var(--shadow-red)', cursor: 'pointer', marginTop: 4 },
  loadRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spin:    { width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' },
  note:    { fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' },
  foot:    { marginTop: 24, fontSize: 12, color: 'var(--gray-400)' },
};
