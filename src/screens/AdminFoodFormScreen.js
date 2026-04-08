import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AdminFoodFormScreen({ route, navigation }) {
  const { mode, foodData } = route.params; // mode: 'create' or 'edit'

  const [name, setName] = useState(foodData?.name || '');
  const [description, setDescription] = useState(foodData?.description || '');
  const [price, setPrice] = useState(foodData?.price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(foodData?.image_url || '');
  const [categoryId, setCategoryId] = useState(foodData?.category_id || null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!name || !price || !categoryId) {
      Alert.alert('Error', 'Nama, Harga, dan Kategori Wajib Diisi!');
      return;
    }

    setLoading(true);
    const payload = {
      name,
      description,
      price: parseInt(price, 10),
      image_url: imageUrl,
      category_id: categoryId,
    };

    if (mode === 'create') {
      const { error } = await supabase.from('foods').insert([payload]);
      if (error) Alert.alert('Gagal Simpan', error.message);
      else navigation.goBack();
    } else {
      const { error } = await supabase.from('foods').update(payload).eq('id', foodData.id);
      if (error) Alert.alert('Gagal Update', error.message);
      else navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Pilih Kategori Makanan *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catContainer}>
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={[styles.catPill, categoryId === cat.id && styles.catPillActive]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text style={[styles.catText, categoryId === cat.id && styles.catTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Nama Makanan / Minuman *</Text>
      <TextInput style={styles.input} placeholder="Cth: Nasi Goreng Spesial" value={name} onChangeText={setName} />

      <Text style={styles.label}>Harga (Rupiah) *</Text>
      <TextInput style={styles.input} placeholder="Cth: 20000" keyboardType="numeric" value={price} onChangeText={setPrice} />

      <Text style={styles.label}>Link URL Foto (Opsional)</Text>
      <TextInput style={styles.input} placeholder="Cth: https://imgur.../image.png" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />

      <Text style={styles.label}>Deskripsi (Opsional)</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="Tulis deskripsi hidangan..." 
        value={description} 
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Simpan Menu</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#2f3542', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f1f2f6', borderRadius: 8, padding: 16, fontSize: 16, color: '#2f3542' },
  textArea: { height: 100, textAlignVertical: 'top' },
  catContainer: { flexDirection: 'row', marginBottom: 8 },
  catPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#f1f2f6', marginRight: 8 },
  catPillActive: { backgroundColor: '#ff4757' },
  catText: { color: '#57606f', fontWeight: 'bold' },
  catTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#2ed573', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
