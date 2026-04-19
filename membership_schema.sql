s-- A. Create Profiles Table for Points & Phone Number
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE,
  points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Admin can manage all profiles
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
CREATE POLICY "Admin can update all profiles" ON profiles FOR UPDATE USING (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
CREATE POLICY "Admin can insert profiles" ON profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');


-- B. Alter Orders Table to support Guest Info and Payment
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_table text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'paid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_claimed text; -- To track if points were already claimed for this order


-- C. Create Promotions Table
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  promo_code text UNIQUE NOT NULL,
  discount_percent integer NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promotions are viewable by everyone" ON promotions FOR SELECT USING (true);
CREATE POLICY "Admin can insert promotions" ON promotions FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
CREATE POLICY "Admin can update promotions" ON promotions FOR UPDATE USING (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
CREATE POLICY "Admin can delete promotions" ON promotions FOR DELETE USING (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
