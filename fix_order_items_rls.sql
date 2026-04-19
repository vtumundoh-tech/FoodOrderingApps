-- Perbaiki izin supaya Admin bisa melihat isi dari order_items
DROP POLICY IF EXISTS "Users can view their own order items." ON order_items;

CREATE POLICY "Users and Admin can view order items." ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  OR auth.jwt() ->> 'email' = 'adminbranch@gmail.com'
);
