-- Script to update RLS policies for admin access

-- 1. Give admin access to read all orders
CREATE POLICY "Admin can view all orders." ON orders FOR SELECT USING (
  auth.jwt() ->> 'email' = 'adminbranch@gmail.com' OR auth.uid() = user_id
);

-- 2. Give admin access to update all orders
CREATE POLICY "Admin can update all orders." ON orders FOR UPDATE USING (
  auth.jwt() ->> 'email' = 'adminbranch@gmail.com'
);

-- Note: In Supabase, if a policy with the same name exists, it might fail.
-- It's safer to drop the old select policy first or just use the new ones.
DROP POLICY IF EXISTS "Users can view their own orders." ON orders;

-- Re-create read policy combining user and admin rule
CREATE POLICY "Users and Admin can view orders." ON orders FOR SELECT USING (
  auth.uid() = user_id OR auth.jwt() ->> 'email' = 'adminbranch@gmail.com'
);
