# 🚀 QUICK REFERENCE: Agent Integration Setup

## ⚡ 5-Minute Setup Guide untuk OpenClaw

### What's Available Now
- ✅ Backend API running: `http://localhost:8000`
- ✅ Ngrok tunnel active: `https://rejoicing-flint-ninetieth.ngrok-free.dev`
- ✅ 4 endpoints siap digunakan
- ✅ Supabase connected
- ✅ Documentation lengkap

---

## 🎯 3 Steps untuk Agent Integration

### STEP 1: Create HTTP Skill (5 min)

Di OpenClaw, buat skill baru:
- **Type:** HTTP
- **Method:** GET  
- **URL:** `http://localhost:8000/api/orders/summary`
- **Save response variables:** `orders_data`

Test: Pastikan skill bisa receive response ✅

---

### STEP 2: Create Telegram Listener (5 min)

Di OpenClaw, buat trigger baru:
- **Type:** Telegram Message
- **Keyword:** `!laporan`
- **Action:** Panggil HTTP Skill dari STEP 1

Test: Kirim `!laporan` ke Telegram, verify agent terima ✅

---

### STEP 3: Create Google Sheet (10 min)

Di agent workflow:
```
After HTTP skill response:
  1. Parse response → extract orders array
  2. Create Google Sheet baru
  3. Add header row: Order ID | Customer | Total | Items
  4. Loop orders → add data rows
  5. Add summary section di bawah
  6. Send sheet link ke Telegram
```

Test: `!laporan` → Sheet dibuat dengan data ✅

---

## 📊 Data Structure untuk Agent

```
Response dari /api/orders/summary:
{
  "date": "2024-12-23",
  "totalOrders": 5,
  "totalRevenue": 250000,
  "orders": [
    {
      "orderId": "...",
      "totalPrice": 50000,
      "items": [
        {"foodName": "Nasi Goreng", "quantity": 2, "subtotal": 50000}
      ]
    }
  ]
}
```

Agent extract:
- `${response.date}` → sheet name
- `${response.totalOrders}` → summary
- `${response.orders[*]}` → loop untuk data rows

---

## 🧪 Manual Testing

### Test 1: API (Local)
```bash
curl http://localhost:8000/api/health
# Response: {"status": "ok", ...}
```

### Test 2: API (Public via Ngrok)
```bash
curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/health
# Response: {"status": "ok", ...}
```

### Test 3: Orders Data
```bash
curl http://localhost:8000/api/orders/summary
# OR
curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary
# Response: JSON dengan orders detail
```

### Test 4: Agent
- Kirim `!laporan` di Telegram
- Verify response + sheet created

---

## 🔗 API Endpoints Reference

| URL | Method | Purpose |
|-----|--------|---------|
| `http://localhost:8000/api/health` | GET | Check server status |
| `http://localhost:8000/api/orders/summary` | GET | Get today's orders |
| `http://localhost:8000/api/orders/summary?date=YYYY-MM-DD` | GET | Get specific date |
| `http://localhost:8000/api/trigger/report` | POST | Manual trigger |
| `https://rejoicing-flint-ninetieth.ngrok-free.dev/api/health` | GET | Public health check |
| `https://rejoicing-flint-ninetieth.ngrok-free.dev/api/orders/summary` | GET | Public orders API |
| `https://rejoicing-flint-ninetieth.ngrok-free.dev/api/trigger/report` | POST | Public trigger |

---

## ✅ Checklist

- [ ] HTTP Skill di agent bisa call `/api/orders/summary`
- [ ] Response JSON bisa di-parse
- [ ] Telegram `!laporan` command bisa trigger agent
- [ ] Google Sheet dibuat otomatis
- [ ] Sheet punya format yang benar
- [ ] Notification terkirim ke Telegram

---

## ❓ Common Issues

**Issue:** "Cannot connect to localhost:8000"
- **Solution:** Run `npm start` di folder `/backend`

**Issue:** "JSON parse error"
- **Solution:** Verify endpoint return valid JSON (test with curl first)

**Issue:** "Google Sheets API error"
- **Solution:** Verify service account credentials valid

**Issue:** "Telegram command tidak trigger"
- **Solution:** Verify keyword exact match + bot connected

---

## 📚 Full Documentation

- See: `INTEGRATION_GUIDE.md` - detailed backend setup
- See: `OPENCLAW_SETUP.md` - detailed agent configuration

---

## 🎬 Running Backend

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start ngrok (if needed for external access)
ngrok http 8000

# Terminal 3: Test endpoints
curl http://localhost:8000/api/health
curl https://rejoicing-flint-ninetieth.ngrok-free.dev/api/health
```

Backend running ✅  
Ngrok tunnel active ✅

---

**Status:** Ready untuk agent configuration!  
**Time to setup:** ~20 minutes  
**Complexity:** Low - just HTTP + Google Sheets
