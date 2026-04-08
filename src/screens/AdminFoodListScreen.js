import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Edit, Trash2 } from 'lucide-react-native';

export default function AdminFoodListScreen({ navigation }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('foods').select('*, categories(name)').order('created_at', { ascending: false });
    if (!error) {
      setFoods(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchFoods();
    }, [])
  );

  const handleDelete = (id, name) => {
    Alert.alert('Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus menu "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase.from('foods').delete().eq('id', id);
          if (error) Alert.alert('Gagal Hapus', error.message);
          fetchFoods();
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url || 'https://picsum.photos/400/300' }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.catName}>{item.categories?.name || 'Tanpa Kategori'}</Text>
        <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtnEdit} onPress={() => navigation.navigate('AdminFoodForm', { mode: 'edit', foodData: item })}>
          <Edit color="#fff" size={16} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDel} onPress={() => handleDelete(item.id, item.name)}>
          <Trash2 color="#fff" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.floatingBtn} onPress={() => navigation.navigate('AdminFoodForm', { mode: 'create' })}>
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#ff4757" style={{ marginTop: 50 }} />
      ) : foods.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada menu makanan katalog.</Text>
      ) : (
        <FlatList
          data={foods}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f2f6' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#2f3542', marginBottom: 4 },
  catName: { fontSize: 12, color: '#747d8c', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#ff4757' },
  actions: { padding: 12, justifyContent: 'space-around' },
  actionBtnEdit: { backgroundColor: '#1e90ff', padding: 8, borderRadius: 8 },
  actionBtnDel: { backgroundColor: '#ff4757', padding: 8, borderRadius: 8 },
  floatingBtn: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#ff4757', justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#747d8c' }
});
