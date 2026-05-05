require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const crypto  = require('crypto');
const { Pool } = require('pg');

const app  = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      number     TEXT NOT NULL UNIQUE,
      server     TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

    CREATE INDEX IF NOT EXISTS idx_call_logs_user
      ON call_logs(user_number);
    CREATE INDEX IF NOT EXISTS idx_call_logs_time
      ON call_logs(started_at DESC);
  `);
  console.log('✅ Database tables ready');
}
initDB().catch(err => console.error('❌ DB init error:', err.message));

const origins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'caas_dev_fallback_secret';

function signToken(payload) {
  const data = JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 });
  const sig  = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64') + '.' + sig;
}

function verifyToken(token) {
  try {
    const [b64, sig] = token.split('.');
    const data = Buffer.from(b64, 'base64').toString();
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (sig !== expected) return null;
    const p = JSON.parse(data);
    return p.exp < Date.now() ? null : p;
  } catch { return null; }
}

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  const user = verifyToken(h.split(' ')[1]);
  if (!user)
    return res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
  req.user = user;
  next();
}

const MOCK_USERS = {
  '081234567890': 'test1234',
  '082111222333': 'test1234',
  '085999888777': 'test1234',
};
const MOCK_MODE = process.env.MOCK_MODE === 'true';

if (MOCK_MODE) {
  console.log('⚠️  MOCK MODE aktif — login tanpa Kamailio');
  console.log('   User test:', Object.keys(MOCK_USERS).join(', '));
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', db: 'connected', mode: MOCK_MODE ? 'mock' : 'production', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'ERROR', db: e.message });
  }
});

app.get('/api/dev/users', (_req, res) => {
  if (!MOCK_MODE) return res.status(404).json({ message: 'Hanya tersedia saat MOCK_MODE=true' });
  res.json({
    mock_mode: true,
    users: Object.keys(MOCK_USERS).map(n => ({ number: n, password: MOCK_USERS[n] })),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { number, password } = req.body;

  if (!number || !password)
    return res.status(400).json({ success: false, message: 'Nomor dan password harus diisi' });
  if (!/^[0-9]{9,15}$/.test(number))
    return res.status(400).json({ success: false, message: 'Format nomor tidak valid' });

  if (MOCK_MODE) {
    if (!MOCK_USERS[number] || MOCK_USERS[number] !== password)
      return res.status(401).json({
        success: false,
        message: `[MOCK] Nomor/password salah. Coba: ${Object.keys(MOCK_USERS)[0]} / test1234`,
      });
  } else {
    if (password.length < 4)
      return res.status(401).json({ success: false, message: 'Password salah atau nomor tidak terdaftar di Kamailio' });
  }

  try {
    const server = `${process.env.KAMAILIO_HOST || '192.168.1.100'}:${process.env.KAMAILIO_PORT || '5060'}`;
    await pool.query(
      `INSERT INTO users (number, server, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (number) DO UPDATE SET server = EXCLUDED.server, updated_at = NOW()`,
      [number, server]
    );
    const token = signToken({ number, server });
    res.json({ success: true, message: 'Login berhasil', token, user: { number, server } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

app.get('/api/auth/verify', auth, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/calls/log', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, type, target AS number, status,
              call_status AS "callStatus",
              duration, started_at AS timestamp
       FROM call_logs
       WHERE user_number = $1
       ORDER BY started_at DESC
       LIMIT 100`,
      [req.user.number]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/calls/start', auth, async (req, res) => {
  const { targetNumber, callType } = req.body;
  if (!targetNumber)
    return res.status(400).json({ success: false, message: 'Nomor tujuan harus diisi' });
  try {
    const type = callType === 'video' ? 'video call' : 'call';
    const { rows } = await pool.query(
      `INSERT INTO call_logs (user_number, type, target, status, call_status, duration)
       VALUES ($1, $2, $3, 'calling', 'Calling', '00:00:00')
       RETURNING id`,
      [req.user.number, type, targetNumber]
    );
    res.json({ success: true, callId: rows[0].id, status: 'Calling' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/calls/end', auth, async (req, res) => {
  const { callId, targetNumber, duration, status } = req.body;
  try {
    if (callId) {
      await pool.query(
        `UPDATE call_logs
         SET status = $1, call_status = 'End', duration = $2
         WHERE id = $3 AND user_number = $4`,
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

app.delete('/api/calls/log/:id', auth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM call_logs WHERE id = $1 AND user_number = $2',
      [req.params.id, req.user.number]
    );
    if (rowCount === 0)
      return res.status(404).json({ success: false, message: 'Log tidak ditemukan' });
    res.json({ success: true, message: 'Log dihapus' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`backend port ${PORT}`);
  // console.log(`   Mode: ${MOCK_MODE ? 'MOCK (testing)' : 'PRODUCTION'}`);
});