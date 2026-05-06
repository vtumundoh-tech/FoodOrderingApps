# Integration Guide: Backend API + OpenClaw Agent

## 📋 Daftar Isi
1. [Backend Setup](#backend-setup)
2. [OpenClaw Agent Configuration](#openclaw-agent-configuration)
3. [API Endpoints](#api-endpoints)
4. [Testing](#testing)
5. [Next Steps: Production](#next-steps-production)

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

File `.env` sudah dibuat dengan template. Update sesuai kebutuhan:

```env
SUPABASE_URL=https://nohticgnlhxvukeulfix.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=your_service_role_key_here  # OPSIONAL saat ini

TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

PORT=8000
```

**Note:** `SUPABASE_SERVICE_KEY` akan diperlukan nanti saat setup webhook production.

### 3. Run Backend Server

```bash
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```

✅ Server akan berjalan di: **http://localhost:8000**

---

## OpenClaw Agent Configuration

### Prerequisites di OpenClaw Agent:
- ✅ Google Sheets credential sudah ada
- ✅ Email skill sudah ada
- ✅ Telegram integration sudah ada

### Apa yang Perlu Disetup di Agent:

#### **1. HTTP Skill untuk Query Orders Data**

**Endpoint:** `GET http://localhost:8000/api/orders/summary`

**Response Format:**
```json
{
  "date": "2024-12-23",
  "totalOrders": 5,
  "totalRevenue": 250000,
  "averageOrderValue": 50000,
  "orders": [
    {
      "orderId": "order_123",
      "customerName": "John Doe",
      "totalPrice": 50000,
      "status": "completed",
      "items": [
        {
          "foodName": "Nasi Goreng",
          "quantity": 2,
          "pricePerUnit": 25000,
          "subtotal": 50000
        }
      ]
    }
  ],
  "summary": {
    "orderCount": 5,
    "revenue": 250000,
    "topItems": [...]
  }
}
```

#### **2. Trigger Workflow untuk Agent**

**Opsi A: Manual Trigger via Telegram Command (Recommended for now)**
- User kirim command: `!laporan` atau `/laporan`
- Agent menerima command → parse perintah → trigger workflow:
  1. `HTTP GET` ke `/api/orders/summary`
  2. Parse JSON response
  3. Create Google Sheet dengan data order
  4. Update sheet sesuai format

**Opsi B: Webhook Trigger dari Backend (Future)**
- Backend akan mengirim POST ke OpenClaw webhook setiap 5 order
- Format yang dikirim: sama seperti response di atas

---

## API Endpoints

### 1. Get Orders Summary
```
GET /api/orders/summary?date=2024-12-23&limit=100
```

**Query Parameters:**
- `date` (optional): Format YYYY-MM-DD, default = today
- `limit` (optional): Max orders to return, default = 100

**Response:** JSON dengan summary + detail per order

---

### 2. Manual Trigger Report Generation
```
POST /api/trigger/report
Content-Type: application/json

{
  "dataSinceDays": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report trigger sent to agent",
  "triggerData": {
    "type": "GENERATE_REPORT",
    "dataUrl": "http://localhost:8000/api/orders/summary"
  }
}
```

---

### 3. Webhook Events (Supabase Integration)
```
POST /api/webhook/orders
Content-Type: application/json

{
  "type": "INSERT",
  "record": { ... },
  "old_record": null
}
```

**Behavior:**
- Setiap order baru → counter +1
- Counter mencapai 5 → auto trigger agent

---

### 4. Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-23T10:30:00Z",
  "orderCounter": 3
}
```

---

## Testing

### Test dari Terminal/Browser

#### 1. Check Backend Health
```bash
curl http://localhost:8000/api/health
```

#### 2. Get Today's Orders
```bash
curl http://localhost:8000/api/orders/summary
```

#### 3. Get Orders dari Tanggal Spesifik
```bash
curl "http://localhost:8000/api/orders/summary?date=2024-12-23&limit=50"
```

#### 4. Manual Trigger Report
```bash
curl -X POST http://localhost:8000/api/trigger/report \
  -H "Content-Type: application/json" \
  -d '{"dataSinceDays": 1}'
```

---

## OpenClaw Agent Setup Instructions

### Langkah 1: Buat HTTP Skill baru

1. Di OpenClaw, buat skill HTTP baru
2. **Method:** GET
3. **URL:** `http://localhost:8000/api/orders/summary`
4. **Parse Response:** JSON
5. **Output Variables:**
   - `orders` → array dari orders
   - `totalRevenue` → total revenue
   - `totalOrders` → jumlah order

### Langkah 2: Buat Telegram Trigger

1. Setup listener untuk Telegram command: `!laporan`
2. Ketika user ketik `!laporan` di Telegram:
   - Trigger HTTP skill dari langkah 1
   - Get data orders
   - Pass data ke Google Sheets skill
   - Create/Update sheet dengan format:
     ```
     | Order ID | Customer | Items | Harga | Status |
     |----------|----------|-------|-------|--------|
     | order_1  | John Doe | ...   | 50k   | Done   |
     ```

### Langkah 3: Google Sheets Integration

1. Gunakan Google Sheets skill yang sudah ada
2. Create sheet baru: `Daily Orders Report - {date}`
3. Format data dari HTTP response ke spreadsheet

### Langkah 4 (Optional): Email Report

Setelah sheet dibuat, email link ke admin via email skill

---

## File Structure

```
backend/
├── server.js          # Main Express server
├── package.json       # Dependencies
├── .env               # Environment variables
└── .env.example       # Template (untuk reference)
```

---

## Next Steps: Production Deployment

Ketika siap production:

1. **Deploy Backend:**
   - Bisa ke Railway, Render, Heroku, atau cloud provider lain
   - Ganti `http://localhost:8000` dengan URL deployment

2. **Setup Supabase Webhook:**
   - Di Supabase dashboard → Database → Webhooks
   - Create webhook untuk table `orders`
   - URL: `https://your-deployed-url/api/webhook/orders`
   - Event: INSERT
   - Payload: Include record

3. **Update OpenClaw Agent:**
   - Ubah HTTP skill URL ke production URL
   - Bisa remove manual trigger, atau keep untuk manual override

---

## Troubleshooting

### Backend tidak start
```bash
# Check apakah port 8000 sudah digunakan
# Windows:
netstat -ano | findstr :8000

# Jika ada yang pakai, ganti PORT di .env
```

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
# Re-install dependencies
cd backend
npm install
```

### API tidak return data
1. Check Supabase credentials di `.env`
2. Check database table names (`orders`, `order_items`)
3. Check logs di terminal backend

---

## Contact & Support

Dokumentasi API lengkap siap. Hubungi jika ada pertanyaan tentang integration!
