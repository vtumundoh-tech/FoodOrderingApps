-- Script Lanjutan: Memberikan izin Admin mengelola Kategori dan Makanan

-- 1. Izin CRUD Kategori untuk Admin
CREATE POLICY "Admin can insert categories" ON categories FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
CREATE POLICY "Admin can update categories" ON categories FOR UPDATE USING (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
CREATE POLICY "Admin can delete categories" ON categories FOR DELETE USING (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');

-- 2. Izin CRUD Makanan untuk Admin
CREATE POLICY "Admin can insert foods" ON foods FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
CREATE POLICY "Admin can update foods" ON foods FOR UPDATE USING (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
CREATE POLICY "Admin can delete foods" ON foods FOR DELETE USING (auth.jwt() ->> 'email' = 'adminbranch@gmail.com');
