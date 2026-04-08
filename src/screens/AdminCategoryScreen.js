import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Trash2, Plus } from 'lucide-react-native';

export default function AdminCategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (!error) {
      setCategories(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return Alert.alert('Error', 'Nama kategori tidak boleh kosong.');
    setAdding(true);
    const { error } = await supabase.from('categories').insert([{ name: newCatName.trim() }]);
    setAdding(false);

    if (error) {
      Alert.alert('Gagal Menambah', error.message);
    } else {
      setNewCatName('');
      fetchCategories();
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Konfirmasi Hapus', `Yakin hapus kategori "${name}"? Makanan dengan kategori ini akan kehilangan label kategorinya.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase.from('categories').delete().eq('id', id);
          if (error) Alert.alert('Gagal Hapus', error.message);
          fetchCategories();
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardName}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.delBtn}>
        <Trash2 color="#ff4757" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Nama Kategori Baru..."
          value={newCatName}
          onChangeText={setNewCatName}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory} disabled={adding}>
          {adding ? <ActivityIndicator color="#fff" size="small" /> : <Plus color="#fff" size={24} />}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff4757" style={{ marginTop: 50 }} />
      ) : categories.length === 0 ? (
        <Text style={styles.emptyText}>Tidak ada kategori.</Text>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f2f6' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', marginBottom: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  input: { flex: 1, backgroundColor: '#f1f2f6', borderRadius: 8, padding: 12, marginRight: 12 },
  addBtn: { backgroundColor: '#ff4757', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#2f3542' },
  delBtn: { padding: 4 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#747d8c' }
});
