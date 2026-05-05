const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── PostgreSQL (Supabase) ──────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Init tabel
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      number     TEXT NOT NULL UNIQUE,
      server     TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS call_logs (
      id          SERIAL PRIMARY KEY,
      user_number TEXT NOT NULL,
      type        TEXT NOT NULL DEFAULT 'call',
      target      TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'ended',
      call_status TEXT NOT NULL DEFAULT 'End',
      duration    TEXT NOT NULL DEFAULT '00:00:00',
      started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log('✅ Database tables ready');
}

initDB().catch(console.error);

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ─── JWT ────────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'caas-02_@CPSLAB@2025@KELOMPOK2@ADA6ORANG';

function generateToken(payload) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 86400000 });
  const hash = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + hash;
}

function verifyToken(token) {
  try {
    const [b64, hash] = token.split('.');
    const data = Buffer.from(b64, 'base64').toString();
    const ok = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (hash !== ok) return null;
    const p = JSON.parse(data);
    return p.exp < Date.now() ? null : p;
  } catch { return null; }
}

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  const p = verifyToken(h.split(' ')[1]);
  if (!p) return res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
  req.user = p;
  next();
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// Dev helper: lihat daftar mock users (hanya aktif saat MOCK_MODE=true)
app.get('/api/dev/users', (_req, res) => {
  if (!MOCK_MODE)
    return res.status(404).json({ message: 'Endpoint ini hanya tersedia saat MOCK_MODE=true' });
  res.json({
    mock_mode: true,
    users: Object.keys(MOCK_USERS).map(number => ({ number, password: MOCK_USERS[number] })),
    hint: 'Gunakan nomor dan password di atas untuk login testing',
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', db: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'ERROR', db: e.message });
  }
});

// ─── Mock mode (aktif saat MOCK_MODE=true di .env) ──────────────────────────
// Daftar user test — nomor:password
// Tambah/hapus bebas, hapus bagian ini saat Kamailio sudah siap
const MOCK_USERS = {
  '081234567890': 'test1234',
  '082111222333': 'test1234',
  '085999888777': 'test1234',
};
const MOCK_MODE = process.env.MOCK_MODE === 'true';

if (MOCK_MODE) {
  console.log('⚠️  MOCK MODE aktif — validasi login tanpa Kamailio');
  console.log('   User tersedia:', Object.keys(MOCK_USERS).join(', '));
}

// Login
app.post('/api/auth/login', async (req, res) => {
  const { number, password, server } = req.body;
  if (!number || !password || !server)
    return res.status(400).json({ success: false, message: 'Semua field harus diisi' });
  if (!/^[0-9]{9,15}$/.test(number))
    return res.status(400).json({ success: false, message: 'Format nomor tidak valid' });

  // ── Validasi login ──────────────────────────────────────────────────────
  if (MOCK_MODE) {
    // Mode testing: cek dari daftar MOCK_USERS di atas
    if (!MOCK_USERS[number] || MOCK_USERS[number] !== password) {
      return res.status(401).json({
        success: false,
        message: `[MOCK] Nomor tidak terdaftar atau password salah. User test: ${Object.keys(MOCK_USERS).join(', ')} | Password: test1234`,
      });
    }
  } else {
    // Mode production: validasi ke Kamailio (implementasi SIP REGISTER di sini)
    // Sementara: validasi minimal password >= 4 karakter
    if (password.length < 4) {
      return res.status(401).json({
        success: false,
        message: 'Password salah atau nomor tidak terdaftar di Kamailio',
      });
    }
  }

  try {
    await pool.query(
      `INSERT INTO users (number, server) VALUES ($1, $2)
       ON CONFLICT (number) DO UPDATE SET server = EXCLUDED.server`,
      [number, server]
    );
    const token = generateToken({ number, server });
    res.json({ success: true, message: 'Login berhasil', token, user: { number, server } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

// Verify
app.get('/api/auth/verify', auth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Get call log
app.get('/api/calls/log', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, target AS number, status,
              call_status AS "callStatus", duration,
              started_at AS timestamp
       FROM call_logs WHERE user_number = $1
       ORDER BY started_at DESC LIMIT 100`,
      [req.user.number]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Start call
app.post('/api/calls/start', auth, async (req, res) => {
  const { targetNumber } = req.body;
  if (!targetNumber)
    return res.status(400).json({ success: false, message: 'Nomor tujuan harus diisi' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO call_logs (user_number, type, target, status, call_status, duration)
       VALUES ($1, 'call', $2, 'calling', 'Calling', '00:00:00') RETURNING id`,
      [req.user.number, targetNumber]
    );
    res.json({ success: true, callId: rows[0].id, status: 'Calling' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// End call
app.post('/api/calls/end', auth, async (req, res) => {
  const { callId, targetNumber, duration, status } = req.body;
  try {
    if (callId) {
      await pool.query(
        `UPDATE call_logs SET status=$1, call_status='End', duration=$2
         WHERE id=$3 AND user_number=$4`,
        [status || 'ended', duration || '00:00:00', callId, req.user.number]
      );
    } else {
      await pool.query(
        `INSERT INTO call_logs (user_number, type, target, status, call_status, duration)
         VALUES ($1, 'call', $2, $3, 'End', $4)`,
        [req.user.number, targetNumber || 'unknown', status || 'ended', duration || '00:00:00']
      );
    }
    res.json({ success: true, message: 'Panggilan selesai' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Delete log
app.delete('/api/calls/log/:id', auth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM call_logs WHERE id=$1 AND user_number=$2',
      [req.params.id, req.user.number]
    );
    if (rowCount === 0)
      return res.status(404).json({ success: false, message: 'Log tidak ditemukan' });
    res.json({ success: true, message: 'Log dihapus' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.listen(PORT, () => console.log(`✅ CaaS O2 Backend → port ${PORT}`));
