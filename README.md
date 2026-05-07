# 📞 VoIP Integration — Kamailio + React + Node.js

Website berbasis VoIP yang terintegrasi dengan server **Kamailio SIP** untuk melakukan panggilan suara melalui protokol UDP/WebRTC. Dibangun menggunakan React (Vite) untuk frontend dan Node.js (Express) untuk backend, dengan database Supabase (PostgreSQL).

---

## 🚀 Fitur Utama

- 🔐 **Login** menggunakan nomor handphone yang terdaftar di server Kamailio
- 📞 **Dial Pad** untuk memasukkan nomor tujuan panggilan
- 🎙️ **Panggilan Suara & Video** melalui jaringan VoIP Kamailio (SIP over WebSocket + WebRTC)
- 📋 **Riwayat Panggilan (Call Log)** — jenis, waktu, status, dan durasi panggilan
- 📡 **Status Panggilan Real-time** — Calling → Ringing → In Call → Call Ended
- 👤 **Halaman About** — informasi pengguna yang sedang login
- 🔔 **Incoming Call** — notifikasi dan kemampuan menjawab/menolak panggilan masuk

---

## 🏗️ Arsitektur Sistem

```
[Browser / React App]
        │
        │  SIP over WebSocket (WSS)
        ▼
[Kamailio SIP Server]  ←──── Autentikasi & Routing Panggilan
        │
        │  UDP
        ▼
[Endpoint Tujuan (SIP Client)]

[React App] ──── REST API (HTTPS) ────► [Node.js Backend (Railway)]
                                                │
                                                ▼
                                        [Supabase PostgreSQL]
```

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | 18 | UI Framework |
| Vite | 5 | Build Tool |
| React Router DOM | 6 | Client-side Routing |
| JsSIP | 3.13 | SIP Client (WebRTC) |
| Axios | 1.6 | HTTP Client |

### Backend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 4.18 | Web Framework |
| PostgreSQL (via `pg`) | — | Database |
| Supabase | — | Database Host |
| dotenv | — | Environment Config |
| cors | — | Cross-Origin Handler |

### Infrastructure
| Komponen | Platform |
|---|---|
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| Database | Supabase |
| SIP Server | Kamailio (self-hosted, `192.168.56.10`) |

---

## 📁 Struktur Proyek

```
VoIP-Integration/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Halaman login dengan nomor HP
│   │   │   ├── HomePage.jsx        # Halaman utama (menu navigasi)
│   │   │   ├── DialPadPage.jsx     # Dial pad & inisiasi panggilan
│   │   │   ├── CallLogPage.jsx     # Riwayat panggilan
│   │   │   └── AboutPage.jsx       # Info pengguna
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   └── Footer.jsx          # Footer
│   │   ├── sip.js                  # Logika SIP (JsSIP): register, call, answer
│   │   ├── api.js                  # Axios instance ke backend
│   │   └── App.jsx                 # Routing utama (Private Routes)
│   ├── vercel.json                 # Konfigurasi deploy Vercel
│   └── package.json
│
├── backend/
│   ├── server.js                   # Express server + semua REST API endpoint
│   ├── railway.json                # Konfigurasi deploy Railway
│   └── package.json
│
└── README.md
```

---

## ⚙️ Konfigurasi Environment

### Frontend — `.env` (di dalam folder `frontend/`)

```env
VITE_API_URL=https://your-backend.up.railway.app
VITE_KAMAILIO_HOST=192.168.56.10
VITE_KAMAILIO_WS=wss://your-kamailio-ws-proxy:9080
```

### Backend — `.env` (di dalam folder `backend/`)

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_jwt_secret_key
KAMAILIO_HOST=192.168.56.10
KAMAILIO_PORT=5060
KAMAILIO_API_URL=http://your-kamailio-api/validate
FRONTEND_URL=https://your-frontend.vercel.app
MOCK_MODE=false
```

> **MOCK_MODE=true** — mengaktifkan login tanpa Kamailio menggunakan akun dummy bawaan (untuk testing).

---

## 🖥️ Cara Menjalankan Lokal

### 1. Clone Repository

```bash
git clone https://github.com/username/VoIP-Integration.git
cd VoIP-Integration
```

### 2. Jalankan Backend

```bash
cd backend
npm install
cp .env.example .env   # isi variabel environment
npm run dev            # menggunakan nodemon
```

Backend berjalan di `http://localhost:5000`

### 3. Jalankan Frontend

```bash
cd frontend
npm install
cp .env.example .env   # isi variabel environment
npm run dev
```

Frontend berjalan di `http://localhost:5173`

---

## 🌐 API Endpoint

Base URL: `https://voip-integration-production.up.railway.app`

### Auth

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/login` | Login dengan nomor HP & password Kamailio |
| `POST` | `/api/auth/logout` | Logout & invalidasi sesi |
| `GET` | `/api/auth/verify` | Verifikasi token JWT |

**Contoh Request Login:**
```json
POST /api/auth/login
{
  "number": "081234567890",
  "password": "test1234"
}
```

### Call Log

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/calls/log` | Ambil riwayat panggilan (maks. 100 terakhir) |
| `POST` | `/api/calls/start` | Catat panggilan dimulai |
| `POST` | `/api/calls/end` | Update status & durasi panggilan |
| `DELETE` | `/api/calls/log/:id` | Hapus log panggilan |

### Health Check

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/health` | Cek status server & koneksi database |

---

## 📊 Skema Database

### Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | SERIAL | Primary key |
| `number` | TEXT | Nomor HP (unique) |
| `server` | TEXT | Alamat Kamailio server |
| `session_id` | TEXT | ID sesi aktif |
| `last_login` | TIMESTAMPTZ | Waktu login terakhir |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu diperbarui |

### Tabel `call_logs`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | SERIAL | Primary key |
| `user_number` | TEXT | Nomor pengguna |
| `type` | TEXT | `call` / `video call` |
| `target` | TEXT | Nomor tujuan |
| `status` | TEXT | `calling`, `missed`, `received`, `ended` |
| `call_status` | TEXT | `Calling`, `Ringing`, `Start`, `End` |
| `duration` | TEXT | Format `HH:MM:SS` |
| `started_at` | TIMESTAMPTZ | Waktu mulai panggilan |

---

## 🚀 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build   # output ke folder dist/
```
Push ke GitHub dan hubungkan ke Vercel. Konfigurasi sudah ada di `vercel.json`.

### Backend → Railway

Push folder `backend/` ke Railway. Konfigurasi deploy sudah ada di `railway.json`.
Railway akan otomatis menjalankan `node server.js`.

---

## 🔧 Konfigurasi Kamailio

Server Kamailio dikonfigurasi sebagai **SIP Proxy** dengan:
- **Protokol**: UDP (port 5060) + WebSocket Secure (WSS) untuk browser
- **Autentikasi**: Digest Authentication (validasi via API endpoint)
- **Domain**: `192.168.56.10`

**Contoh user yang terdaftar di Kamailio:**

| Username | Domain | Password |
|---|---|---|
| `081355696481` | `192.168.56.10` | `papas1` |
| `081243658709` | `192.168.56.10` | `papas` |
| `081918171615` | `192.168.56.10` | `12345` |

---

## 📌 Catatan Pengembangan

- **ICE Servers** menggunakan STUN Google (`stun.l.google.com`) dan TURN `openrelay.metered.ca` untuk memastikan koneksi WebRTC menembus NAT.
- **Session Management** — setiap login menghasilkan `session_id` baru; login dari perangkat lain akan menginvalidasi sesi sebelumnya.
- **Auto-reject** — panggilan masuk yang tidak dijawab dalam **30 detik** akan otomatis ditolak.

---

## 👥 Tim Pengembang

> Proyek ini dikembangkan sebagai bagian dari tugas cyber recruitment **Integrasi Aplikasi Mobile dengan VoIP**.

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik.
