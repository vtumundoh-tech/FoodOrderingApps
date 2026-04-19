-- Menambahkan Policy agar pelanggan baru bisa memasukkan profil dan nomor HP mereka sendiri saat registrasi
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
