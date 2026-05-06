require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto  = require('crypto');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');

const app  = express();
const PORT = process.env.PORT || 5000;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

const MOCK_USERS = {
  '081234567890': 'test1234',
  '082111222333': 'test1234',
  '085999888777': 'test1234',
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
  console.log('[DB] Connecting to Supabase...');
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
    CREATE INDEX IF NOT EXISTS idx_call_logs_user ON call_logs(user_number);
    CREATE INDEX IF NOT EXISTS idx_call_logs_time ON call_logs(started_at DESC);
  `);
  console.log('[DB] Supabase tables ready');
}
initDB().catch(err => console.error('[DB] Init error:', err.message));

async function validateKamailio(number, password) {
  let conn;
  const apiUrl = process.env.KAMAILIO_API_URL
  console.log(`[KAMAILIO] Validating: ${number}`);
  console.log(`[KAMAILIO] Host: ${process.env.KAMAILIO_HOST}:${process.env.KAMAILIO_MYSQL_PORT || 3306}`);
  try {
    conn = await mysql.createConnection({
      host    : process.env.KAMAILIO_HOST     || '192.168.56.10',
      port    : parseInt(process.env.KAMAILIO_MYSQL_PORT) || 3306,
      user    : process.env.KAMAILIO_MYSQL_USER || 'kamailio_read',
      password: process.env.KAMAILIO_MYSQL_PASS || 'kamailio_read_pass',
      database: 'kamailio',
    });
    console.log('[KAMAILIO] MySQL connected');
    const [rows] = await conn.execute(
      'SELECT username FROM subscriber WHERE username = ? AND password = ?',
      [number, password]
    );
    console.log(`[KAMAILIO] Result: ${rows.length} row(s)`);
    return rows.length > 0;
  } catch (e) {
    console.error('[KAMAILIO] Error:', e.message);
    return false;
  } finally {
    if (conn) await conn.end();
    console.log('[KAMAILIO] Connection closed');
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (origin.includes('localhost')) return callback(null, true);
    const allowed = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
      : [];
    if (allowed.includes(origin)) return callback(null, true);
    console.warn('[CORS] Blocked:', origin);
    callback(new Error('CORS not allowed'));
  },
  credentials: true,
}));
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

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    console.log('[HEALTH] OK');
    res.json({
      status    : 'OK',
      db        : 'connected',
      mode      : MOCK_MODE ? 'mock' : 'production',
      kamailio  : process.env.KAMAILIO_HOST,
      timestamp : new Date().toISOString(),
    });
  } catch (e) {
    console.error('[HEALTH] Error:', e.message);
    res.status(500).json({ status: 'ERROR', db: e.message });
  }
});

app.get('/api/dev/users', (_req, res) => {
  if (!MOCK_MODE)
    return res.status(404).json({ message: 'Hanya tersedia saat MOCK_MODE=true' });
  res.json({
    mock_mode: true,
    users: Object.keys(MOCK_USERS).map(n => ({ number: n, password: MOCK_USERS[n] })),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { number, password } = req.body;
  console.log(`[LOGIN] number=${number} | MOCK_MODE=${MOCK_MODE}`);

  if (!number || !password) {
    console.warn('[LOGIN] Missing fields');
    return res.status(400).json({ success: false, message: 'Nomor dan password harus diisi' });
  }

  if (!/^[0-9]{4,15}$/.test(number)) {
    console.warn('[LOGIN] Invalid format:', number);
    return res.status(400).json({ success: false, message: 'Format nomor tidak valid' });
  }

  if (MOCK_MODE) {
    if (!MOCK_USERS[number] || MOCK_USERS[number] !== password) {
      console.warn('[LOGIN] Mock failed:', number);
      return res.status(401).json({
        success: false,
        message: `[MOCK] Salah. Coba: ${Object.keys(MOCK_USERS)[0]} / test1234`,
      });
    }
    console.log('[LOGIN] Mock success:', number);
  } else {
    const valid = await validateKamailio(number, password);
    if (!valid) {
      console.warn('[LOGIN] Kamailio failed:', number);
      return res.status(401).json({
        success: false,
        message: 'Nomor atau password salah. Pastikan terdaftar di Kamailio.',
      });
    }
    console.log('[LOGIN] Kamailio success:', number);
  }

  try {
    const server = `${process.env.KAMAILIO_HOST || '192.168.56.10'}:${process.env.KAMAILIO_PORT || '5060'}`;
    await pool.query(
      `INSERT INTO users (number, server, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (number) DO UPDATE SET server = EXCLUDED.server, updated_at = NOW()`,
      [number, server]
    );
    const token = signToken({ number, server });
    console.log('[LOGIN] Token issued for:', number);
    res.json({ success: true, message: 'Login berhasil', token, user: { number, server } });
  } catch (e) {
    console.error('[LOGIN] Error:', e.message);
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

app.get('/api/auth/verify', auth, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/calls/log', auth, async (req, res) => {
  console.log('[CALLS] Get log:', req.user.number);
  try {
    const { rows } = await pool.query(
      `SELECT id, type, target AS number, status,
              call_status AS "callStatus", duration, started_at AS timestamp
       FROM call_logs WHERE user_number = $1
       ORDER BY started_at DESC LIMIT 100`,
      [req.user.number]
    );
    console.log(`[CALLS] ${rows.length} logs found`);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('[CALLS] Get error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/calls/start', auth, async (req, res) => {
  const { targetNumber, callType } = req.body;
  console.log(`[CALLS] Start: ${req.user.number} -> ${targetNumber} [${callType}]`);
  if (!targetNumber)
    return res.status(400).json({ success: false, message: 'Nomor tujuan harus diisi' });
  try {
    const type = callType === 'video' ? 'video call' : 'call';
    const { rows } = await pool.query(
      `INSERT INTO call_logs (user_number, type, target, status, call_status, duration)
       VALUES ($1, $2, $3, 'calling', 'Calling', '00:00:00') RETURNING id`,
      [req.user.number, type, targetNumber]
    );
    console.log('[CALLS] Started, id:', rows[0].id);
    res.json({ success: true, callId: rows[0].id, status: 'Calling' });
  } catch (e) {
    console.error('[CALLS] Start error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/calls/end', auth, async (req, res) => {
  const { callId, targetNumber, duration, status } = req.body;
  console.log(`[CALLS] End: id=${callId} status=${status} duration=${duration}`);
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
    console.log('[CALLS] Ended ok');
    res.json({ success: true, message: 'Panggilan selesai' });
  } catch (e) {
    console.error('[CALLS] End error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/calls/log/:id', auth, async (req, res) => {
  console.log('[CALLS] Delete log:', req.params.id);
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM call_logs WHERE id=$1 AND user_number=$2',
      [req.params.id, req.user.number]
    );
    if (rowCount === 0)
      return res.status(404).json({ success: false, message: 'Log tidak ditemukan' });
    console.log('[CALLS] Deleted ok');
    res.json({ success: true, message: 'Log dihapus' });
  } catch (e) {
    console.error('[CALLS] Delete error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.listen(PORT, () => {
  console.log('================================');
  console.log(`CaaS O2 Backend | Port: ${PORT}`);
  console.log(`Mode | ${MOCK_MODE ? 'MOCK' : 'PRODUCTION'}`);
  console.log(`Kamailio | ${process.env.KAMAILIO_HOST}:${process.env.KAMAILIO_PORT}`);
  console.log(`Kamailio MySQL | ${process.env.KAMAILIO_HOST}:${process.env.KAMAILIO_MYSQL_PORT || 3306}`);
  console.log(`Supabase DB | ${process.env.DATABASE_URL ? 'configured' : 'NOT SET'}`);
  console.log('================================');
});