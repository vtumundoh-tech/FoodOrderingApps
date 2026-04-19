import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Trash2, Plus } from 'lucide-react-native';

export default function AdminPromoScreen() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (!error) {
      setPromos(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchPromos();
    }, [])
  );

  const handleAddPromo = async () => {
    if (!title || !code || !discount) {
      return Alert.alert('Error', 'Semua kolom Promo wajib diisi.');
    }
    setAdding(true);
    const { error } = await supabase.from('promotions').insert([{ 
      title, 
      promo_code: code.toUpperCase().trim(),
      discount_percent: parseInt(discount, 10)
    }]);
    setAdding(false);

    if (error) {
      Alert.alert('Gagal Menambah', error.message);
    } else {
      setTitle('');
      setCode('');
      setDiscount('');
      fetchPromos();
    }
  };

  const handleDelete = (id, title) => {
    Alert.alert('Konfirmasi Hapus', `Yakin hapus promo "${title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase.from('promotions').delete().eq('id', id);
          if (error) Alert.alert('Gagal Hapus', error.message);
          fetchPromos();
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{flex: 1}}>
        <Text style={styles.cardName}>{item.title}</Text>
        <Text style={styles.cardCode}>Kode: {item.promo_code}</Text>
        <Text style={styles.cardDiscount}>Diskon: {item.discount_percent}%</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} style={styles.delBtn}>
        <Trash2 color="#ff4757" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Tambah Promosi Baru</Text>
        <TextInput style={styles.input} placeholder="Nama Promo (Cth: Lebaran Sale)" value={title} onChangeText={setTitle} />
        <View style={styles.row}>
          <TextInput style={[styles.input, {flex: 2, marginRight: 8}]} placeholder="KODE (Cth: MANTAP10)" value={code} onChangeText={setCode} autoCapitalize="characters" />
          <TextInput style={[styles.input, {flex: 1}]} placeholder="Diskon %" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddPromo} disabled={adding}>
          {adding ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.addBtnText}>Buat Promo</Text>}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#a29bfe" style={{ marginTop: 50 }} />
      ) : promos.length === 0 ? (
        <Text style={styles.emptyText}>Tidak ada promosi aktif.</Text>
      ) : (
        <FlatList
          data={promos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f2f6' },
  formContainer: { padding: 16, backgroundColor: '#fff', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#2f3542', marginBottom: 12 },
  row: { flexDirection: 'row' },
  input: { backgroundColor: '#f1f2f6', borderRadius: 8, padding: 12, marginBottom: 10 },
  addBtn: { backgroundColor: '#a29bfe', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#2f3542', marginBottom: 4 },
  cardCode: { fontSize: 14, color: '#ff4757', fontWeight: 'bold', marginBottom: 2 },
  cardDiscount: { fontSize: 12, color: '#747d8c' },
  delBtn: { padding: 8 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#747d8c' }
});
