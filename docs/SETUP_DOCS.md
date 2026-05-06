# Backend + OpenClaw Agent Setup Guide

## 📋 Daftar Isi
1. [Overview](#overview)
2. [Backend Setup](#backend-setup)
3. [Ngrok Setup](#ngrok-setup)
4. [OpenClaw Agent Setup](#openclaw-agent-setup)
5. [API Endpoints](#api-endpoints)
6. [Testing](#testing)
7. [Next Steps](#next-steps)

---

## Overview

Dokumen ini menjelaskan cara menyiapkan backend `c:\FoodOrderingApps\backend`, menyalakan ngrok, dan menghubungkan agent OpenClaw supaya bisa membaca data Supabase dan membuat laporan di Google Sheets.

---

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Buat file environment `.env`

Contoh isi `.env`:

```env
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

PORT=8000
```

- `SUPABASE_SERVICE_KEY` penting jika ingin mengakses data order penuh
- `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` hanya diperlukan jika agent menggunakan Telegram

### 3. Jalankan server

```bash
node server.js
```

Server akan berjalan di:

- `http://localhost:8000`

---

## Ngrok Setup

### 1. Jalankan ngrok

Buka terminal baru dan jalankan:

```bash
gnrok http 8000
```

### 2. Salin public URL

Ngrok akan memberi URL publik, contohnya:

- `https://rejoicing-flint-ninetieth.ngrok-free.dev`

Gunakan URL ini untuk agent atau integrasi eksternal.

### 3. Pastikan ngrok aktif

Cek endpoint health:

```bash
curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/health
```

Jika sukses, backend sudah bisa diakses dari internet.

---

## OpenClaw Agent Setup

Agent perlu dua hal:

1. `GET /api/orders/summary` untuk membaca data order
2. `POST /api/trigger/report` untuk memicu pembuatan laporan

### 1. HTTP Skill untuk membaca order

Gunakan URL public ngrok:

```text
GET https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary
```

Opsional jika ingin data tanggal tertentu:

```text
GET https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary?date=2026-04-19
```

### 2. Konten response yang diharapkan

Response akan berisi:

- `date`
- `totalOrders`
- `totalRevenue`
- `averageOrderValue`
- `orders` (daftar order)
- `summary` (ringkasan dan top items)

Contoh terkait agent:

```json
{
  "date": "2026-04-19",
  "totalOrders": 10,
  "totalRevenue": 988700,
  "averageOrderValue": 98870,
  "orders": [
    {
      "orderId": "543e7279-...",
      "userId": "...",
      "totalPrice": 25000,
      "status": "pending",
      "createdAt": "2026-04-08T06:27:32.597154+00:00",
      "items": [
        {
          "foodName": "Nasi Goreng Spesial",
          "quantity": 1,
          "pricePerUnit": 25000,
          "subtotal": 25000
        }
      ]
    }
  ],
  "summary": {
    "orderCount": 10,
    "revenue": 988700,
    "averageOrderValue": 98870,
    "topItems": [
      {
        "name": "Nasi Goreng Spesial",
        "totalQty": 5,
        "totalRevenue": 125000
      }
    ]
  }
}
```

### 3. Trigger agent membuat laporan

Gunakan endpoint manual trigger:

```text
POST https://rejoicing-flint-ninetieth.ngrok-free.dev/api/trigger/report
```

Body contoh:

```json
{
  "dataSinceDays": 1
}
```

Agent akan menerima instruksi untuk membaca data dari:

- `https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary`

Dan membuat Google Sheet berdasarkan data tersebut.

### 4. Flow Telegram Command (opsional)

Jika agent pakai Telegram:

- User kirim `!laporan` atau `/laporan`
- Bot memanggil `POST /api/trigger/report`
- Agent baca data orders
- Agent buat Google Sheet dan kirim hasil link

---

## API Endpoints

### 1. Orders Summary

```http
GET /api/orders/summary?date=YYYY-MM-DD&limit=100
```

**Query params:**
- `date` (optional): `YYYY-MM-DD`
- `limit` (optional): jumlah maksimal order

Jika `date` tidak diberikan, backend menggunakan tanggal hari ini.

### 2. Trigger Report

```http
POST /api/trigger/report
Content-Type: application/json

{
  "dataSinceDays": 1
}
```

### 3. Health Check

```http
GET /api/health
```

### 4. Webhook Orders (future)

```http
POST /api/webhook/orders
```

Digunakan untuk event order baru dari Supabase.

---

## Testing

### Cek backend lokal

```bash
curl http://localhost:8000/api/health
```

### Cek via ngrok

```bash
curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/health
```

### Baca data order hari ini

```bash
curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary
```

### Baca data order tanggal tertentu

```bash
curl "https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary?date=2026-04-19"
```

### Kirim trigger laporan

```bash
curl -X POST https://rejoicing-flint-ninetieth.ngrok-free.dev/api/trigger/report \
  -H "Content-Type: application/json" \
  -d '{"dataSinceDays": 1}'
```

---

## Next Steps

1. Pastikan agent sudah bisa memanggil URL ngrok
2. Pastikan agent bisa akses `GET /api/orders/summary`
3. Pastikan agent bisa membuat Google Sheet dari response
4. Jika sukses, tambahkan otomatisasi schedule harian atau webhook order baru
