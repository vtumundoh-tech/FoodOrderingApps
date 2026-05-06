# 🏗️ Backend & Ngrok Architecture Guide

## 📚 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Backend Explanation](#backend-explanation)
4. [Ngrok Explanation](#ngrok-explanation)
5. [Data Flow](#data-flow)
6. [API Endpoints](#api-endpoints)
7. [Setup Instructions](#setup-instructions)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Sistem Anda terdiri dari beberapa komponen yang bekerja bersama untuk memungkinkan **OpenClaw AI Agent di VPS** mengambil data pesanan melalui **Telegram**:

```
User (Telegram) ←→ Telegram Bot ←→ VPS (OpenClaw) ←→ Ngrok ←→ Backend (Lokal)
```

---

## System Architecture

### 🎯 Komponen Utama

```
┌─────────────────────────────────────────────────────────────┐
│                   INTERNET / CLOUD                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐           ┌──────────────────┐  │
│  │  VPS (Hosted)        │           │  Telegram API    │  │
│  │  ├─ OpenClaw Agent   │◄─────────►│  ├─ Bot          │  │
│  │  ├─ HTTP Skill       │           │  └─ User Chat    │  │
│  │  └─ Google Sheets    │           └──────────────────┘  │
│  │                      │                                   │
│  │  Ingin akses data:   │                                   │
│  │  GET /api/orders/... │                                   │
│  └──────────┬───────────┘                                   │
│             │ HTTP Request ke                               │
│             │ https://rejoicing-flint-ninetieth...          │
│             │                                               │
│             ▼                                               │
│  ┌──────────────────────────┐                               │
│  │  Ngrok Tunnel            │                               │
│  │  Public URL:             │                               │
│  │  https://rejoicing-      │                               │
│  │  flint-ninetieth...      │                               │
│  │                          │                               │
│  │  ◄─ Forward request ke   │                               │
│  └──────────┬───────────────┘                               │
└─────────────┼────────────────────────────────────────────────┘
              │
              │ (Lokal Network)
              │
        ┌─────▼──────────────┐
        │  Komputer Anda     │
        │  (Windows/Local)   │
        │                    │
        │  ┌──────────────┐  │
        │  │ Backend      │  │
        │  │ npm start    │  │
        │  │ Port 8000    │  │
        │  │              │  │
        │  │ Endpoints:   │  │
        │  │ /api/orders  │  │
        │  │ /api/health  │  │
        │  └──────────────┘  │
        │                    │
        │  ┌──────────────┐  │
        │  │ Ngrok Agent  │  │
        │  │ (CLI)        │  │
        │  │ Port 8000→   │  │
        │  │ Internet     │  │
        │  └──────────────┘  │
        └────────────────────┘
```

---

## Backend Explanation

### ❓ Apa itu Backend?

**Backend** adalah aplikasi server yang:
- ✅ Menyimpan data orders/pesanan
- ✅ Menyediakan API endpoints
- ✅ Memproses HTTP requests
- ✅ Return JSON responses

### 📍 Lokasi & Port

```
Folder: c:\FoodOrderingApps\backend
File utama: server.js
Port: 8000
URL Lokal: http://localhost:8000
```

### 🚀 Cara Menjalankan

```bash
# Metode 1: Dari dalam folder
cd c:\FoodOrderingApps\backend
npm start

# Metode 2: Dari root folder
cd c:\FoodOrderingApps
npm start --prefix backend

# Output jika berhasil:
# 🚀 Backend server running on http://localhost:8000
```

### ✅ Status Backend

Untuk cek apakah backend berjalan:

```bash
# Method 1: Cek port
netstat -ano | findstr :8000
# Output: TCP 0.0.0.0:8000 LISTENING

# Method 2: Test endpoint
curl http://localhost:8000/api/health
# Output: {"status":"ok","timestamp":"..."}

# Method 3: Browser
# Buka: http://localhost:8000/api/health
```

### 📊 Data yang Backend Sediakan

```json
{
  "date": "2026-04-27",
  "totalOrders": 5,
  "totalRevenue": 250000,
  "orders": [
    {
      "orderId": "ORD-001",
      "customerName": "John Doe",
      "totalPrice": 50000,
      "items": [
        {
          "foodName": "Nasi Goreng",
          "quantity": 2,
          "subtotal": 50000
        }
      ]
    }
  ]
}
```

---

## Ngrok Explanation

### ❓ Apa itu Ngrok?

**Ngrok** adalah tool yang:
- ✅ Membuat **tunnel** dari internet ke server lokal
- ✅ Expose `http://localhost:8000` ke internet publik
- ✅ Memberikan URL publik yang dapat diakses dari mana saja
- ✅ Forwards HTTP requests ke local backend

### 🌐 Mengapa Perlu Ngrok?

**Masalah tanpa Ngrok:**
```
VPS (di cloud) ingin akses http://localhost:8000 (komputer lokal)
❌ TIDAK BISA! (localhost hanya bisa diakses dari komputer yang sama)
```

**Solusi dengan Ngrok:**
```
VPS akses https://rejoicing-flint-ninetieth.ngrok-free.dev
✅ BISA! (Ngrok forward ke localhost:8000)
```

### 📍 Lokasi Ngrok

```
Software: Ngrok CLI
Port untuk tunnel: 8000 (backend)
Port web interface: 4040
Public URL: https://rejoicing-flint-ninetieth.ngrok-free.dev
```

### 🚀 Cara Menjalankan

```bash
# Start ngrok tunnel
ngrok http 8000

# Output:
# Session Status        online
# Forwarding           https://rejoicing-flint-ninetieth.ngrok-free.dev -> http://localhost:8000
```

### ✅ Status Ngrok

```bash
# Cek port ngrok
netstat -ano | findstr :4040
# Output: TCP 127.0.0.1:4040 LISTENING

# Cek proses ngrok
tasklist | findstr ngrok
# Output: ngrok.exe ... Console

# Web Interface
# Buka: http://127.0.0.1:4040
```

### 🛑 Cara Matikan Ngrok

**Method 1: Tekan Ctrl+C di terminal ngrok**

**Method 2: Matikan via taskkill**
```bash
taskkill /IM ngrok.exe /F
# Output: SUCCESS: The process with PID ... has been terminated.
```

---

## Data Flow

### 📨 Alur Lengkap: User Kirim `!laporan` di Telegram

```
STEP 1: User mengirim pesan
┌─────────────────────┐
│ User (Telegram)     │
│ Kirim: "!laporan"   │
└────────────┬────────┘
             │
             ▼

STEP 2: Telegram meneruskan ke VPS
┌─────────────────────┐
│ Telegram Bot API    │
│ Forward message     │
└────────────┬────────┘
             │
             ▼

STEP 3: OpenClaw Agent di VPS menerima trigger
┌──────────────────────────────┐
│ VPS (OpenClaw)               │
│ Trigger: Keyword "!laporan"  │
│ Action: Execute HTTP Skill   │
└────────────┬─────────────────┘
             │
             ▼

STEP 4: OpenClaw HTTP Skill membuat request
┌────────────────────────────────────────────┐
│ HTTP GET Request                           │
│ URL: https://rejoicing-flint-ninetieth...  │
│      /api/orders/summary                   │
│                                            │
│ Headers: Accept: application/json          │
└────────────┬───────────────────────────────┘
             │
             ▼

STEP 5: Ngrok menerima request
┌────────────────────────────────────────────┐
│ Ngrok Tunnel (Internet)                    │
│ ◄─ Receive HTTPS request                   │
│ Forward ► HTTP localhost:8000               │
└────────────┬───────────────────────────────┘
             │
             ▼

STEP 6: Backend lokal memproses request
┌────────────────────────────────────────────┐
│ Backend (localhost:8000)                   │
│ Endpoint: GET /api/orders/summary          │
│ Query Database ► Ambil data orders         │
│ Return JSON response                       │
└────────────┬───────────────────────────────┘
             │
             ▼

STEP 7: Response kembali ke VPS
┌────────────────────────────────────────────┐
│ JSON Response (via Ngrok)                  │
│ {                                          │
│   "date": "2026-04-27",                    │
│   "totalOrders": 5,                        │
│   "orders": [...]                          │
│ }                                          │
└────────────┬───────────────────────────────┘
             │
             ▼

STEP 8: OpenClaw Agent memproses data
┌────────────────────────────────────────────┐
│ OpenClaw (VPS)                             │
│ ✅ Parse JSON response                     │
│ ✅ Extract orders data                     │
│ ✅ Create Google Sheet                     │
│ ✅ Add headers & data rows                 │
│ ✅ Add summary section                     │
└────────────┬───────────────────────────────┘
             │
             ▼

STEP 9: OpenClaw mengirim hasil ke Telegram
┌────────────────────────────────────────────┐
│ Telegram Bot                               │
│ Send: Google Sheet link + Summary          │
│ To: User chat                              │
└────────────┬───────────────────────────────┘
             │
             ▼

STEP 10: User menerima hasil
┌────────────────────────────────────────────┐
│ User (Telegram)                            │
│ ✅ Terima sheet link                       │
│ ✅ Terima summary data                     │
│ ✅ Done!                                   │
└────────────────────────────────────────────┘
```

---

## API Endpoints

### 🔗 Available Endpoints

| Endpoint | Method | Lokal | Ngrok | Purpose |
|----------|--------|-------|-------|---------|
| `/api/health` | GET | ✅ | ✅ | Check server status |
| `/api/orders/summary` | GET | ✅ | ✅ | Get today's orders |
| `/api/orders/summary?date=YYYY-MM-DD` | GET | ✅ | ✅ | Get specific date orders |
| `/api/trigger/report` | POST | ✅ | ✅ | Manual trigger report |

### 📝 Contoh Request & Response

#### Health Check
```bash
# Request
GET http://localhost:8000/api/health

# Response
{
  "status": "ok",
  "timestamp": "2026-04-27T06:15:32.438Z",
  "orderCounter": 0
}
```

#### Orders Summary (Today)
```bash
# Request
GET http://localhost:8000/api/orders/summary

# Response
{
  "date": "2026-04-27",
  "totalOrders": 5,
  "totalRevenue": 250000,
  "orders": [
    {
      "orderId": "ORD-001",
      "customerName": "John Doe",
      "totalPrice": 50000,
      "items": [
        {
          "foodName": "Nasi Goreng",
          "quantity": 2,
          "subtotal": 50000
        }
      ]
    }
  ]
}
```

#### Orders Summary (Specific Date)
```bash
# Request
GET http://localhost:8000/api/orders/summary?date=2026-04-19

# Response
{
  "date": "2026-04-19",
  "totalOrders": 3,
  "totalRevenue": 150000,
  "orders": [...]
}
```

---

## Setup Instructions

### 📋 Complete Setup Checklist

#### Prerequisites
- [ ] Node.js installed
- [ ] Ngrok installed
- [ ] Backend code ready (`c:\FoodOrderingApps\backend`)
- [ ] OpenClaw installed di VPS
- [ ] Telegram bot configured

### Step-by-Step Setup

#### Step 1: Start Backend
```bash
cd c:\FoodOrderingApps\backend
npm start

# Verify: 🚀 Backend server running on http://localhost:8000
```

#### Step 2: Verify Backend Works (Lokal)
```bash
# Method 1: Browser
# Buka: http://localhost:8000/api/health

# Method 2: PowerShell
Invoke-WebRequest -Uri http://localhost:8000/api/health -UseBasicParsing

# Expected response:
# {"status":"ok","timestamp":"..."}
```

#### Step 3: Start Ngrok
Di terminal baru:
```bash
ngrok http 8000

# Verify output:
# Forwarding    https://rejoicing-flint-ninetieth.ngrok-free.dev -> http://localhost:8000
```

#### Step 4: Verify Ngrok Works (Publik)
```bash
# Method 1: Browser
# Buka: https://rejoicing-flint-ninetieth.ngrok-free.dev/api/health

# Method 2: PowerShell
Invoke-WebRequest -Uri https://rejoicing-flint-ninetieth.ngrok-free.dev/api/health -UseBasicParsing

# Expected response: Same as Step 2
```

#### Step 5: Configure OpenClaw di VPS

**Create HTTP Skill:**
```
Type: HTTP
Method: GET
URL: https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary
Save Response: orders_data
```

**Create Telegram Listener:**
```
Trigger Type: Telegram Message
Keyword: !laporan
Action: Call HTTP Skill (dari step 5)
```

**Create Google Sheet Workflow:**
```
After HTTP response:
1. Parse JSON → extract orders array
2. Create Google Sheet
3. Add headers: Order ID | Customer | Total | Items
4. Loop orders → add data rows
5. Add summary section
6. Send sheet link ke Telegram
```

#### Step 6: Test Integration
```
1. Kirim "!laporan" di Telegram
2. Tunggu agent process (5-10 detik)
3. Cek hasil:
   ✅ Sheet dibuat dengan data
   ✅ Link sheet dikirim ke Telegram
   ✅ Summary terlihat benar
```

---

## Troubleshooting

### ❌ Problem: Backend tidak berjalan

**Error:** `Port 8000 already in use`

**Solution:**
```bash
# Cari process yang pakai port 8000
netstat -ano | findstr :8000

# Matikan process (ganti XXXX dengan PID)
taskkill /PID XXXX /F

# Start backend lagi
npm start --prefix backend
```

---

### ❌ Problem: Ngrok tidak bisa connect ke backend

**Error:** `ERR_NGROK_8012 - No connection could be made`

**Penyebab:** Backend tidak running

**Solution:**
```bash
# 1. Verifikasi backend running
netstat -ano | findstr :8000
# Harus ada output

# 2. Jika tidak ada, start backend
npm start --prefix backend

# 3. Coba Ngrok lagi
ngrok http 8000
```

---

### ❌ Problem: Ngrok URL berubah setiap kali restart

**Kenyataan:** Ngrok free plan menggunakan random subdomain setiap kali start

**Solution:**
1. Use ngrok dashboard untuk check URL terbaru
2. Update URL di OpenClaw setiap kali ngrok restart
3. Atau upgrade ke ngrok paid plan untuk static domain

**Cara check URL Ngrok:**
```bash
# Web interface
http://127.0.0.1:4040

# Status API
curl http://127.0.0.1:4040/api/tunnels
```

---

### ❌ Problem: Agent tidak bisa akses API via Ngrok

**Error:** `Connection refused` atau `404 Not Found`

**Solution:**
```bash
# 1. Verifikasi Ngrok forwarding benar
# Buka: http://127.0.0.1:4040
# Lihat URL yang aktif di "Forwarding"

# 2. Test URL via curl
curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/health

# 3. Jika error, check logs di:
# http://127.0.0.1:4040/inspect/http

# 4. Restart both backend & ngrok
# Terminal 1: Stop backend (Ctrl+C)
# Terminal 2: Stop ngrok (Ctrl+C)
# Terminal 1: npm start --prefix backend
# Terminal 2: ngrok http 8000
```

---

### ❌ Problem: Google Sheet tidak tercreate

**Error:** `Google Sheets API error`

**Solution:**
1. Verify Google service account credentials
2. Check if account punya permission create sheets
3. Verify scopes include `https://www.googleapis.com/auth/spreadsheets`

---

### ❌ Problem: Telegram tidak terima hasil

**Error:** `Agent tidak send pesan ke Telegram`

**Solution:**
1. Verify Telegram bot token valid
2. Verify bot sudah di-add ke chat
3. Check OpenClaw logs untuk error
4. Test API endpoint manual dulu:
   ```bash
   curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary
   ```

---

## 🎯 Summary

| Komponen | Port | Fungsi | Startup |
|----------|------|--------|---------|
| **Backend** | 8000 | Sumber data pesanan | `npm start --prefix backend` |
| **Ngrok** | 4040 (web) | Expose ke internet | `ngrok http 8000` |
| **VPS (OpenClaw)** | Cloud | Agent AI, process data | Sudah running (assumed) |
| **Telegram** | Cloud | User interface | Sudah setup (assumed) |

### ✅ Untuk System Berjalan:

1. ✅ **WAJIB**: Backend running (`npm start`)
2. ✅ **WAJIB**: Ngrok running (`ngrok http 8000`)
3. ✅ **Asumsi**: OpenClaw di VPS sudah dikonfigurasi
4. ✅ **Asumsi**: Telegram bot sudah connected

---

## 📚 Next Steps

- Review [QUICK_START.md](QUICK_START.md) untuk integration steps
- Review [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) untuk detailed setup
- Review [OPENCLAW_SETUP.md](OPENCLAW_SETUP.md) untuk OpenClaw configuration

---

**Last Updated:** 2026-04-27  
**Status:** ✅ Ready for Integration
