import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminOrderScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneInputs, setPhoneInputs] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  const fetchAllOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, order_items(*, foods(name))')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      const now = new Date();
      let pastDate = new Date();

      if (filter === 'today') {
        pastDate.setHours(0, 0, 0, 0);
      } else if (filter === 'week') {
        pastDate.setDate(now.getDate() - 7);
      } else if (filter === 'month') {
        pastDate.setMonth(now.getMonth() - 1);
      }
      query = query.gte('created_at', pastDate.toISOString());
    }

    const { data, error } = await query;
    if (!error) {
      setOrders(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllOrders();
    }, [filter])
  );

  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      Alert.alert('Gagal Update', error.message);
    } else {
      fetchAllOrders();
    }
    setLoading(false);
  };

  const updatePaymentStatus = async (orderId) => {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId);

    if (error) {
      Alert.alert('Gagal Update', error.message);
    } else {
      fetchAllOrders();
    }
    setLoading(false);
  };

  const handleClaimPoints = async (order) => {
    const phone = phoneInputs[order.id];
    if (!phone) return Alert.alert('Error', 'Masukkan nomor HP pelanggan terlebih dahulu!');

    setLoading(true);
    const { data: profileList, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone.trim());

    if (profileErr || !profileList || profileList.length === 0) {
      setLoading(false);
      return Alert.alert('Gagal', 'Nomor HP tidak ditemukan di database member.');
    }

    const profile = profileList[0];
    let pointsToAdd = 100;
    if (order.total_price >= 500000) pointsToAdd = 9000;
    else if (order.total_price >= 200000) pointsToAdd = 2000;
    else if (order.total_price >= 100000) pointsToAdd = 1000;

    const newPoints = (profile.points || 0) + pointsToAdd;

    const { error: updateProfErr } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', profile.id);

    if (updateProfErr) {
      setLoading(false);
      return Alert.alert('Gagal Tambah Poin', updateProfErr.message);
    }

    await supabase.from('orders').update({ phone_claimed: phone.trim() }).eq('id', order.id);

    Alert.alert('Sukses!', `Berhasil menambahkan ${pointsToAdd} Poin ke akun Member (${phone}).`);
    setPhoneInputs({ ...phoneInputs, [order.id]: '' });
    fetchAllOrders();
  };

  const renderFilterButton = (id, label) => (
    <TouchableOpacity
      style={[styles.filterBtn, filter === id && styles.filterBtnActive]}
      onPress={() => setFilter(id)}
    >
      <Text style={[styles.filterText, filter === id && styles.filterTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderOrder = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const isClaimed = !!item.phone_claimed;

    const rawSubtotal = item.order_items ? item.order_items.reduce((sum, oi) => sum + (oi.price_at_time * oi.quantity), 0) : item.total_price;
    const pointsUsed = rawSubtotal > item.total_price ? rawSubtotal - item.total_price : 0;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>ID: {item.id.slice(0, 8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.dateText}>{formattedDate}</Text>

        <View style={styles.guestInfoBox}>
          <Text style={styles.guestInfoText}>👤 Nama: <Text style={{ fontWeight: 'bold' }}>{item.guest_name || 'Tanpa Nama'}</Text></Text>
          <Text style={styles.guestInfoText}>🪑 Meja: <Text style={{ fontWeight: 'bold' }}>{item.guest_table || 'Tidak Ada'}</Text></Text>
          <Text style={styles.guestInfoText}>💳 Bayar: <Text style={{ fontWeight: 'bold' }}>{item.payment_method?.toUpperCase() || '-'} ({item.payment_status})</Text></Text>
          {pointsUsed > 0 && (
            <Text style={styles.guestInfoText}>🌟 Poin Dipakai: <Text style={{ fontWeight: 'bold', color: '#ff4757' }}>- Rp {pointsUsed.toLocaleString('id-ID')}</Text></Text>
          )}
        </View>

        <View style={styles.itemsContainer}>
          {item.order_items && item.order_items.map((oi) => (
            <View key={oi.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{oi.quantity}x {oi.foods?.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.totalValue}>Total: Rp {item.total_price.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.actionRow}>
            {item.payment_status === 'unpaid' ? (
              <TouchableOpacity style={styles.actionBtnProcess} onPress={() => updatePaymentStatus(item.id)}>
                <Text style={styles.actionText}>Tandai Lunas</Text>
              </TouchableOpacity>
            ) : (
              item.status === 'pending' && (
                <TouchableOpacity style={styles.actionBtnProcess} onPress={() => updateOrderStatus(item.id, 'processed')}>
                  <Text style={styles.actionText}>Proses</Text>
                </TouchableOpacity>
              )
            )}

            {item.status === 'processed' && (
              <TouchableOpacity style={styles.actionBtnComplete} onPress={() => updateOrderStatus(item.id, 'completed')}>
                <Text style={styles.actionText}>Selesaikan</Text>
              </TouchableOpacity>
            )}
            {(item.status === 'pending' || item.status === 'processed') && (
              <TouchableOpacity style={styles.actionBtnCancel} onPress={() => updateOrderStatus(item.id, 'cancelled')}>
                <Text style={styles.actionText}>Batal</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Claim Points Box */}
        <View style={styles.pointsBox}>
          {isClaimed ? (
            <Text style={styles.pointsSuccessText}>✅ Poin telah diklaim untuk: {item.phone_claimed}</Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={styles.pointsInput}
                placeholder="No HP Member..."
                keyboardType="phone-pad"
                value={phoneInputs[item.id] || ''}
                onChangeText={(text) => setPhoneInputs({ ...phoneInputs, [item.id]: text })}
              />
              <TouchableOpacity style={styles.pointsBtn} onPress={() => handleClaimPoints(item)}>
                <Text style={styles.pointsBtnText}>Hadiahi Poin</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton('all', 'Semua')}
          {renderFilterButton('today', 'Hari Ini')}
          {renderFilterButton('week', '7 Hari')}
          {renderFilterButton('month', '30 Hari')}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff4757" style={{ marginTop: 50 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Belum ada pesanan masuk.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f2f6' },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dfe4ea' },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f2f6', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#ff4757' },
  filterText: { color: '#57606f', fontWeight: 'bold', fontSize: 13 },
  filterTextActive: { color: '#fff' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#747d8c' },
  orderCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontWeight: 'bold', color: '#2f3542' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  status_pending: { backgroundColor: '#ffa502' },
  status_processed: { backgroundColor: '#1e90ff' },
  status_completed: { backgroundColor: '#2ed573' },
  status_cancelled: { backgroundColor: '#ff4757' },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  dateText: { color: '#747d8c', fontSize: 12, marginBottom: 8 },
  guestInfoBox: { backgroundColor: '#f1f2f6', padding: 8, borderRadius: 8, marginBottom: 12 },
  guestInfoText: { fontSize: 13, color: '#2f3542', marginBottom: 2 },
  itemsContainer: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#dfe4ea', paddingVertical: 12, marginBottom: 12 },
  itemRow: { marginBottom: 4 },
  itemText: { color: '#57606f', fontSize: 14 },
  footer: { flexDirection: 'column', alignItems: 'stretch', marginBottom: 12 },
  totalValue: { color: '#ff4757', fontWeight: 'bold', fontSize: 16 },
  actionRow: { flexDirection: 'row' },
  actionBtnProcess: { backgroundColor: '#1e90ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  actionBtnComplete: { backgroundColor: '#2ed573', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  actionBtnCancel: { backgroundColor: '#ff4757', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  pointsBox: { backgroundColor: '#fff0f2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffccd5' },
  pointsInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 8, fontSize: 13, marginRight: 8, borderWidth: 1, borderColor: '#ffccd5' },
  pointsBtn: { backgroundColor: '#ff4757', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  pointsBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  pointsSuccessText: { color: '#2ed573', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  pointsUsedText: { color: '#ffa502', fontSize: 11, fontWeight: 'bold', marginTop: 4 }
});
