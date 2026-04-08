-- 1. Create table for Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create table for Foods
CREATE TABLE foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create table for Orders
-- Status can be: 'pending', 'processed', 'completed', 'cancelled'
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_price numeric NOT NULL CHECK (total_price >= 0),
  status text NOT NULL DEFAULT 'pending',
  shipping_address text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Create table for Order Items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  food_id uuid REFERENCES foods(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_time numeric NOT NULL CHECK (price_at_time >= 0)
);

-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

-- Enable RLS for all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories: Everyone can read
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);

-- Foods: Everyone can read
CREATE POLICY "Foods are viewable by everyone." ON foods FOR SELECT USING (true);

-- Orders: Users can only see and insert their own orders
CREATE POLICY "Users can insert their own orders." ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders." ON orders FOR SELECT USING (auth.uid() = user_id);

-- Order Items: Users can only insert order items for their own orders
CREATE POLICY "Users can insert order items." ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can view their own order items." ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
-- INSERT DUMMY DATA FOR TESTING
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

-- Insert Dummy Categories
INSERT INTO categories (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'Makanan Utama'),
('22222222-2222-2222-2222-222222222222', 'Minuman'),
('33333333-3333-3333-3333-333333333333', 'Snack');

-- Insert Dummy Foods
INSERT INTO foods (category_id, name, description, price, image_url) VALUES 
('11111111-1111-1111-1111-111111111111', 'Nasi Goreng Spesial', 'Nasi goreng dengan telur, sosis, dan ayam suwir.', 25000, 'https://picsum.photos/seed/nasi/400/300'),
('11111111-1111-1111-1111-111111111111', 'Mie Ayam Bakso', 'Mie pangsit dilengkapi bakso urat dan pangsit rebus.', 20000, 'https://picsum.photos/seed/mie/400/300'),
('22222222-2222-2222-2222-222222222222', 'Es Teh Manis', 'Teh melati manis dingin meredakan dahaga.', 5000, 'https://picsum.photos/seed/esteh/400/300'),
('22222222-2222-2222-2222-222222222222', 'Kopi Susu Gula Aren', 'Kopi espresso dengan susu segar dan gula aren asli.', 18000, 'https://picsum.photos/seed/kopi/400/300'),
('33333333-3333-3333-3333-333333333333', 'Kentang Goreng', 'Kentang goreng renyah dengan taburan garam.', 15000, 'https://picsum.photos/seed/kentang/400/300');
