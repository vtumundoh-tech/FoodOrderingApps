import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// In-memory counter for orders (for webhook tracking)
let orderCounter = 0;
const TRIGGER_THRESHOLD = 5;

/**
 * GET /api/orders/summary
 * Returns daily summary and detailed order information
 * Query params:
 *   - date: YYYY-MM-DD (optional, defaults to today)
 *   - limit: number of recent orders (optional, default 100)
 */
app.get('/api/orders/summary', async (req, res) => {
  try {
    const { date, limit = 100 } = req.query;

    // For debugging - get all orders first
    const { data: allOrders, error: allError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Build date filter (use UTC to match database timestamps)
    let dateFilter;
    if (date) {
      // Parse date as UTC: "2026-04-19" -> 2026-04-19T00:00:00.000Z
      const [year, month, day] = date.split('-').map(Number);
      dateFilter = new Date(Date.UTC(year, month - 1, day));
    } else {
      // For today, use current UTC date
      const now = new Date();
      dateFilter = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    const endDate = new Date(dateFilter);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    console.log(`[API] Fetching orders summary for date: ${dateFilter.toISOString()}`);

    // Query orders with details
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(
        `
        id,
        user_id,
        total_price,
        status,
        created_at,
        order_items(
          id,
          food_id,
          quantity,
          price_at_time,
          foods(id, name, price)
        )
      `
      )
      .gte('created_at', dateFilter.toISOString())
      .lt('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (ordersError) {
      console.error('Supabase error:', ordersError);
      return res.status(400).json({ error: ordersError.message });
    }

    console.log(`[DEBUG] Orders found for date filter: ${orders?.length || 0}`);

    if (!orders || orders.length === 0) {
      return res.json({
        date: dateFilter.toISOString().split('T')[0], // Use UTC date for response
        totalOrders: 0,
        totalRevenue: 0,
        orders: [],
        summary: {
          orderCount: 0,
          revenue: 0,
          averageOrderValue: 0,
        },
      });
    }

    // Calculate summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const averageOrderValue = totalRevenue / totalOrders;

    // Format response for agent
    const formattedOrders = orders.map((order) => ({
      orderId: order.id,
      userId: order.user_id,
      totalPrice: order.total_price,
      status: order.status,
      createdAt: order.created_at,
      items: order.order_items.map((item) => ({
        foodName: item.foods?.name || 'Unknown',
        quantity: item.quantity,
        pricePerUnit: item.price_at_time,
        subtotal: item.price_at_time * item.quantity,
      })),
    }));

    const response = {
      date: dateFilter.toISOString().split('T')[0], // Use UTC date for response
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      orders: formattedOrders,
      summary: {
        orderCount: totalOrders,
        revenue: totalRevenue,
        averageOrderValue,
        topItems: getTopItems(orders),
      },
    };

    res.json(response);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/webhook/orders
 * Receives webhook from Supabase when new order is created
 * Body: { order: {...} }
 */
app.post('/api/webhook/orders', async (req, res) => {
  try {
    const { record, old_record, type } = req.body;

    console.log(`[WEBHOOK] Order event received: ${type}`, record);

    if (type === 'INSERT') {
      orderCounter++;
      console.log(`[WEBHOOK] Order counter: ${orderCounter}/${TRIGGER_THRESHOLD}`);

      if (orderCounter >= TRIGGER_THRESHOLD) {
        console.log(`[WEBHOOK] Trigger threshold reached! Sending notification to agent...`);
        await notifyAgentViaWebhook();
        orderCounter = 0; // Reset counter
      }
    }

    res.json({ success: true, counter: orderCounter });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/trigger/report
 * Manual trigger to notify agent to create report
 * Body: { dataSinceDays: 1 } (optional)
 */
app.post('/api/trigger/report', async (req, res) => {
  try {
    const { dataSinceDays = 1 } = req.body;

    console.log(`[MANUAL TRIGGER] Report generation requested for last ${dataSinceDays} day(s)`);

    const triggerData = {
      type: 'GENERATE_REPORT',
      timestamp: new Date().toISOString(),
      dataSinceDays,
      dataUrl: `http://localhost:${PORT}/api/orders/summary`,
      instruction: `Fetch data from ${`http://localhost:${PORT}/api/orders/summary`} and create a Google Sheet with today's order summary and details.`,
    };

    console.log('[MANUAL TRIGGER] Trigger data ready:', triggerData);

    // TODO: Send to agent via Telegram or API
    // Example: await sendToTelegramAgent(triggerData);

    res.json({
      success: true,
      message: 'Report trigger sent to agent',
      triggerData,
    });
  } catch (err) {
    console.error('Error triggering report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    orderCounter,
  });
});

/**
 * Helper function: Get top items by quantity
 */
function getTopItems(orders) {
  const itemMap = {};

  orders.forEach((order) => {
    order.order_items.forEach((item) => {
      const name = item.foods?.name || 'Unknown';
      if (!itemMap[name]) {
        itemMap[name] = { name, totalQty: 0, totalRevenue: 0 };
      }
      itemMap[name].totalQty += item.quantity;
      itemMap[name].totalRevenue += item.price_at_time * item.quantity;
    });
  });

  return Object.values(itemMap)
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);
}

/**
 * Helper function: Notify agent via webhook
 * TODO: Implement based on OpenClaw webhook endpoint
 */
async function notifyAgentViaWebhook() {
  try {
    const summaryData = await getSummarySinceLastTrigger();
    console.log('[WEBHOOK] Summary data prepared for agent');
    // TODO: POST to OpenClaw webhook endpoint
    // await fetch(OPENCLAW_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(summaryData)
    // });
  } catch (err) {
    console.error('Error notifying agent:', err);
  }
}

/**
 * Helper function: Get summary since last trigger
 */
async function getSummarySinceLastTrigger() {
  const { data } = await supabase
    .from('orders')
    .select('id, total_price')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    orderCount: data?.length || 0,
    totalRevenue: data?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/orders/summary`);
  console.log(`   POST http://localhost:${PORT}/api/trigger/report`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
});
