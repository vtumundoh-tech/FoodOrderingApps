# OpenClaw Agent Setup untuk Food Ordering App

## 📌 Overview

Ini adalah panduan lengkap untuk mengintegrasikan OpenClaw agent Anda dengan backend API yang sudah dibuat untuk menangani:
- ✅ Query data orders dari Supabase
- ✅ Generate laporan harian di Google Sheets
- ✅ Manual trigger via Telegram command

---

## 🎯 Arsitektur Integrasi

```
[Telegram Command: !laporan]
        ↓
[OpenClaw Agent menerima command]
        ↓
[HTTP GET ke: https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary]
        ↓
[Parse JSON response]
        ↓
[Create/Update Google Sheet dengan data]
        ↓
[Send notification ke Telegram]
```

---

## 🔧 Setup di OpenClaw Agent

### STEP 1: Buat HTTP Skill untuk Query Orders

**Di OpenClaw, buat skill baru:**

1. **Skill Type:** HTTP / REST API
2. **Method:** GET
3. **URL:** `https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary`
4. **Query Parameters (optional):**
   - `date` = format YYYY-MM-DD (untuk query tanggal spesifik)
   - `limit` = jumlah orders (default 100)

**Contoh curl command untuk test:**
```bash
curl "https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary?date=2024-12-23&limit=50"
```

5. **Response Format:** JSON

6. **Output Variables yang extract:**
```
${RESPONSE.date}              # Tanggal laporan
${RESPONSE.totalOrders}       # Total orders
${RESPONSE.totalRevenue}      # Total revenue
${RESPONSE.orders}            # Array of orders detail
${RESPONSE.summary.topItems}  # Top 5 items terlaris
```

---

### STEP 2: Buat Telegram Listener untuk Command `!laporan`

1. **Trigger:** Listen for Telegram message containing `!laporan`
2. **Action:**
   - Call HTTP skill dari STEP 1
   - Store response dalam variables

**Pseudocode Workflow:**
```
IF message contains "!laporan"
  THEN:
    1. Call HTTP_SKILL_GET_ORDERS_SUMMARY
    2. Store: orders_data = response.orders
    3. Store: total_revenue = response.totalRevenue
    4. Continue to STEP 3
```

---

### STEP 3: Create Google Sheet dengan Data Orders

Gunakan **Google Sheets Skill** yang sudah ada untuk:

1. **Create/Update Sheet:**
   - Sheet name: `Daily Orders Report - {date}`
   - Example: `Daily Orders Report - 2024-12-23`

2. **Format Data:**

```
HEADER ROW:
| Order ID | User ID | Total Price | Status | Created At | Items | Items Price |

DATA ROWS:
| order_123 | user_456 | 50000 | completed | 2024-12-23 10:30 | Nasi Goreng x2, Kopi x1 | 25k x2, 18k |
| order_124 | user_789 | 75000 | completed | 2024-12-23 11:00 | Mie Ayam x1, Es Teh x2 | 20k, 5k x2 |
```

3. **Summary Section (at bottom):**
```
Total Orders: ${totalOrders}
Total Revenue: Rp ${totalRevenue}
Average Order: Rp ${avgOrderValue}
Top Items:
  - Item 1: X qty
  - Item 2: Y qty
  - Item 3: Z qty
```

**Tips:**
- Gunakan formatting untuk make it pretty (bold headers, colors, etc)
- Bisa pakai pivot table untuk summary
- Share link ke sheet di response

---

### STEP 4: Send Notification ke Telegram (Optional)

Setelah sheet dibuat:

```
Message to send:
"✅ Laporan harian sudah dibuat!

📊 Ringkasan:
• Total Orders: {totalOrders}
• Revenue: Rp {totalRevenue}
• Rata-rata: Rp {avgOrderValue}

🔗 Link Sheet: [link ke sheet]

🏆 Top Items:
{top_items_list}"
```

---

## 📊 Response Data Format

Ketika agent call `/api/orders/summary`, response akan seperti ini:

```json
{
  "date": "2024-12-23",
  "totalOrders": 5,
  "totalRevenue": 250000,
  "averageOrderValue": 50000,
  "orders": [
    {
      "orderId": "order_123",
      "userId": "user_456",
      "totalPrice": 50000,
      "status": "completed",
      "createdAt": "2024-12-23T10:30:00Z",
      "items": [
        {
          "foodName": "Nasi Goreng",
          "quantity": 2,
          "pricePerUnit": 25000,
          "subtotal": 50000
        },
        {
          "foodName": "Kopi Susu",
          "quantity": 1,
          "pricePerUnit": 18000,
          "subtotal": 18000
        }
      ]
    },
    // ... more orders
  ],
  "summary": {
    "orderCount": 5,
    "revenue": 250000,
    "topItems": [
      {
        "name": "Nasi Goreng Spesial",
        "totalQty": 8,
        "totalRevenue": 200000
      },
      {
        "name": "Kopi Susu Gula Aren",
        "totalQty": 5,
        "totalRevenue": 90000
      }
      // ... more top items
    ]
  }
}
```

---

## 🚀 Testing Agent

### Test 1: Manual API Call
```bash
# Dari terminal, test endpoint
curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary

# Atau dengan date spesifik
curl "https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary?date=2024-12-23"
```

### Test 2: Trigger Agent Manual
- Kirim Telegram command: `!laporan`
- Check apakah agent:
  - ✅ Receive command
  - ✅ Call HTTP endpoint
  - ✅ Get response
  - ✅ Create sheet
  - ✅ Send notification

---

## 🔄 Advanced: Automatic Trigger (Untuk Produksi)

Nanti ketika production, bisa setup automatic trigger:

**Option A: Webhook dari Backend**
- Backend akan auto-send message ke agent setiap 5 order baru
- Endpoint: `POST /api/webhook/orders` (sudah tersedia)

**Option B: Polling**
- Agent check endpoint `/api/health` setiap X menit
- Jika `orderCounter >= 5`, trigger laporan

**Implementation nanti:** Hubungi untuk setup webhook OpenClaw endpoint.

---

## ⚙️ Environment Configuration

Di agent OpenClaw, configure:

1. **Base URL:** `http://localhost:8000` (saat testing)
2. **Timeout:** 30 detik
3. **Retry:** 2x jika error
4. **Error Handling:**
   - Jika API error → send message ke Telegram "Error fetching data"
   - Jika Sheet error → send message "Error creating sheet"

---

## 📝 Checklist Setup

- [ ] HTTP Skill sudah dibuat untuk GET `/api/orders/summary`
- [ ] Telegram listener untuk `!laporan` command sudah active
- [ ] Google Sheets Skill sudah configured dengan credentials
- [ ] Test manual: `!laporan` → sheet dibuat ✅
- [ ] Error handling sudah setup
- [ ] Telegram notification sudah active

---

## 🆘 Troubleshooting

### Error: "Cannot connect to http://localhost:8000"
**Solution:**
- Pastikan backend server running: `npm start` di folder `/backend`
- Pastikan firewall allow port 8000
- Check: `curl http://localhost:8000/api/health` return `{"status": "ok"}`

### Error: "Invalid JSON response"
**Solution:**
- Check backend logs untuk error message
- Test endpoint di browser/postman: `http://localhost:8000/api/orders/summary`
- Verify Supabase credentials di `.env` file

### Error: "Google Sheets API error"
**Solution:**
- Verify Google Sheets credential masih valid
- Check service account punya akses ke Sheets API
- Test Google Sheets skill dengan dummy data

### Agent tidak menerima Telegram command
**Solution:**
- Verify bot token sudah correct
- Check Telegram chat ID
- Verify keyword match: `!laporan` (case-sensitive)

---

## 📞 Support

Untuk pertanyaan lebih lanjut atau butuh debug:
1. Cek logs di terminal backend
2. Test endpoint manual dengan curl
3. Hubungi developer

---

## 🔮 Future Enhancements

1. **Scheduled Reports:** Daily/weekly auto-generate tanpa manual command
2. **Email Distribution:** Kirim report via email ke stakeholders
3. **Charts & Graphs:** Add visualisasi di Google Sheets
4. **Multi-language:** Support berbagai bahasa untuk report
5. **Custom Filtering:** Agent bisa filter by date range, category, etc

---

**Status:** ✅ Ready untuk testing
**Last Updated:** 2026-04-23
