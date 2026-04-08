import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { ClipboardList, LayoutList, UtensilsCrossed } from 'lucide-react-native';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}> Halo {user?.user_metadata?.full_name || 'Admin'}, </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Panel Kontrol Utama</Text>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminOrder')}>
        <View style={[styles.iconBox, { backgroundColor: '#eccc68' }]}>
          <ClipboardList color="#fff" size={30} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Kelola Pesanan Pelanggan</Text>
          <Text style={styles.cardDesc}>Terima, proses, dan batalkan invoice pesanan masuk.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminCategory')}>
        <View style={[styles.iconBox, { backgroundColor: '#7bed9f' }]}>
          <LayoutList color="#fff" size={30} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Kelola Kategori Menu</Text>
          <Text style={styles.cardDesc}>Atur daftar klasifikasi makanan (Snack, Minuman, dll).</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminFoodList')}>
        <View style={[styles.iconBox, { backgroundColor: '#ff6b81' }]}>
          <UtensilsCrossed color="#fff" size={30} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Kelola Katalog Makanan</Text>
          <Text style={styles.cardDesc}>Tambah, ubah, dan hapus foto beserta harga menu makanan.</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  email: {
    fontSize: 14,
    color: '#747d8c',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#57606f',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#747d8c',
    lineHeight: 18,
  },
});
