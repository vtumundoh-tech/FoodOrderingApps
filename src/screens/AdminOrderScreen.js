import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminOrderScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    setLoading(true);
    // Kita mengambil semua order dan men-join dengan user pemesan jika memungkinkan 
    // Tapi karena tabel auth.users tidak bisa di-join langsung via public, kita cukup urutkan.
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, foods(name))')
      .order('created_at', { ascending: false });
      
    if (!error) {
      setOrders(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllOrders();
    }, [])
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
      fetchAllOrders(); // refresh data
    }
    setLoading(false);
  };

  const renderOrder = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>ID: {item.id.slice(0, 8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{formattedDate} • User: {item.user_id.slice(0, 5)}</Text>
        
        <View style={styles.itemsContainer}>
          {item.order_items && item.order_items.map((oi) => (
            <View key={oi.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{oi.quantity}x {oi.foods?.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.totalValue}>Rp {item.total_price.toLocaleString('id-ID')}</Text>
          <View style={styles.actionRow}>
            {item.status === 'pending' && (
              <TouchableOpacity style={styles.actionBtnProcess} onPress={() => updateOrderStatus(item.id, 'processed')}>
                <Text style={styles.actionText}>Proses Order</Text>
              </TouchableOpacity>
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
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
  dateText: { color: '#747d8c', fontSize: 12, marginBottom: 12 },
  itemsContainer: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f2f6', paddingVertical: 12, marginBottom: 12 },
  itemRow: { marginBottom: 4 },
  itemText: { color: '#57606f', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalValue: { color: '#ff4757', fontWeight: 'bold', fontSize: 16 },
  actionRow: { flexDirection: 'row' },
  actionBtnProcess: { backgroundColor: '#1e90ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  actionBtnComplete: { backgroundColor: '#2ed573', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  actionBtnCancel: { backgroundColor: '#ff4757', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
