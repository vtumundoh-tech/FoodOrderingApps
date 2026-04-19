import { createClient } from '@supabase/supabase-js';

// Baca file src/lib/supabase.js untuk mendapatkan URL dan KEY 
import fs from 'fs';
const supabaseCode = fs.readFileSync('c:/FoodOrderingApps/src/lib/supabase.js', 'utf8');
const urlMatch = supabaseCode.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = supabaseCode.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  
  async function check() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, foods(name))')
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (error) {
      console.log('Error:', error);
      return;
    }
    
    orders.forEach(order => {
      console.log('\n--- Order ID:', order.id);
      console.log('User ID:', order.user_id);
      console.log('Total Price:', order.total_price);
      
      let rawSubtotal = 0;
      if (order.order_items) {
        rawSubtotal = order.order_items.reduce((sum, oi) => sum + (oi.price_at_time * oi.quantity), 0);
        console.log('Calculated rawSubtotal:', rawSubtotal);
        console.log('Points Used Logic:', rawSubtotal > order.total_price ? rawSubtotal - order.total_price : 0);
      } else {
        console.log('No order_items found inside this order!');
      }
    });
  }
  
  check();
} else {
  console.log('Failed to parse supabaseUrl/supabaseAnonKey from supabase.js');
}
