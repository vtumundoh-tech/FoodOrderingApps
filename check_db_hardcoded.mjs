import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nohticgnlhxvukeulfix.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaHRpY2dubGh4dnVrZXVsZml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTc5ODUsImV4cCI6MjA5MTE5Mzk4NX0.d_YFm_BR7xeygFVUtYJvw1CYOqTRud0cCagdXlZnCfs'
);

async function check() {
  console.log('Querying supabase...');
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (error) {
    console.log('Error:', error);
    return;
  }
  
  orders.forEach(order => {
    let rawSubtotal = 0;
    if (order.order_items) {
      rawSubtotal = order.order_items.reduce((sum, oi) => sum + (oi.price_at_time * oi.quantity), 0);
    }
    const pointsUsed = rawSubtotal > order.total_price ? rawSubtotal - order.total_price : 0;
    
    console.log(`[ID] ${order.id}`);
    console.log(`  Raw: ${rawSubtotal} | Total: ${order.total_price} | PointsUsed: ${pointsUsed}`);
  });
}
check();
