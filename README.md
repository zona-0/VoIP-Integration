# CaaS O2 — Deploy Global Guide

Stack: React (Vercel) + Express.js (Railway) + PostgreSQL (Supabase) + Kamailio (VPS)

---

## LANGKAH 1 — Setup Supabase (Database Gratis)

1. Daftar di https://supabase.com (gratis, 500MB)
2. Klik "New Project" → beri nama "caas-o2" → set password DB yang kuat
3. Tunggu ~2 menit sampai project selesai dibuat
4. Buka Settings → Database → Connection String → pilih "URI"
5. Salin connection string, bentuknya:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
   ```
6. Simpan string ini — akan dipakai di Railway nanti

Tidak perlu buat tabel manual. Backend akan otomatis buat tabel saat pertama kali jalan.

---

## LANGKAH 2 — Deploy Backend ke Railway

1. Push project ke GitHub dulu:
   ```bash
   cd caas-o2
   git init
   git add .
   git commit -m "initial commit"
   # Buat repo di github.com lalu:
   git remote add origin https://github.com/USERNAME/caas-o2.git
   git push -u origin main
   ```

2. Buka https://railway.app → Login dengan GitHub
3. New Project → Deploy from GitHub repo → pilih repo "caas-o2"
4. Railway akan detect folder — pilih "backend" sebagai root directory
5. Setelah deploy, buka tab "Variables" → tambahkan:
   ```
   DATABASE_URL    = postgresql://postgres:...@db....supabase.co:5432/postgres
   JWT_SECRET      = buat_string_acak_panjang_minimal_32_karakter
   FRONTEND_URL    = https://caas-o2.vercel.app   (isi setelah deploy Vercel)
   PORT            = 5000
   ```
6. Klik "Deploy" → tunggu ~1-2 menit
7. Salin URL Railway, contoh: https://caas-o2-backend.up.railway.app

Test backend hidup:
```bash
curl https://caas-o2-backend.up.railway.app/api/health
```
Harus return: {"status":"OK","db":"connected"}

---

## LANGKAH 3 — Deploy Frontend ke Vercel

1. Buka https://vercel.com → Login dengan GitHub
2. New Project → Import repo "caas-o2"
3. Set Root Directory ke "frontend"
4. Di bagian Environment Variables, tambahkan:
   ```
   VITE_API_URL = https://caas-o2-backend.up.railway.app
   ```
5. Klik Deploy → tunggu ~1 menit
6. Salin URL Vercel, contoh: https://caas-o2.vercel.app

---

## LANGKAH 4 — Update CORS di Railway

Setelah dapat URL Vercel, kembali ke Railway:
- Buka Variables → ubah FRONTEND_URL:
  ```
  FRONTEND_URL = https://caas-o2.vercel.app
  ```
- Redeploy backend

---

## LANGKAH 5 — Testing Global

```bash
# 1. Health check
curl https://caas-o2-backend.up.railway.app/api/health

# 2. Login (pastikan nomor sudah terdaftar di Kamailio)
curl -X POST https://caas-o2-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"number":"081234567890","password":"passwordkamu","server":"IP_KAMAILIO:5060"}'

# 3. Cek call log
curl https://caas-o2-backend.up.railway.app/api/calls/log \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Cek data di Supabase:
- Buka https://supabase.com → project → Table Editor
- Lihat tabel "call_logs" dan "users"

---

## LANGKAH 6 — Tambah User di Kamailio

Di server VPS Kamailio kamu:
```bash
kamctl add 081234567890 passwordkamu
kamctl db show subscriber
```

---

## Ringkasan Biaya

| Layanan   | Plan     | Biaya         |
|-----------|----------|---------------|
| Supabase  | Free     | Gratis selamanya (500MB) |
| Vercel    | Hobby    | Gratis selamanya         |
| Railway   | Free     | $5 credit/bln (cukup untuk testing) |
| Kamailio  | VPS kamu | Tergantung provider VPS  |

---

## Environment Variables Lengkap

### backend/.env (local)
```
PORT=5000
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECTID.supabase.co:5432/postgres
JWT_SECRET=string_acak_minimal_32_karakter
FRONTEND_URL=http://localhost:3000
```

### frontend/.env (local)
```
VITE_API_URL=http://localhost:5000
```

### Railway (production)
```
DATABASE_URL    = <dari Supabase>
JWT_SECRET      = <string acak kuat>
FRONTEND_URL    = <URL Vercel>
PORT            = 5000
```

### Vercel (production)
```
VITE_API_URL = <URL Railway>
```

---

## Menjalankan Lokal

```bash
npm install && npm run install:all
npm run dev
```

Buka: http://localhost:3000
