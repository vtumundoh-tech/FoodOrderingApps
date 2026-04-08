import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, foods(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) {
      setOrders(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const renderOrder = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
        <Text style={styles.dateText}>{formattedDate}</Text>
        
        <View style={styles.itemsContainer}>
          {item.order_items && item.order_items.map((oi) => (
            <View key={oi.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{oi.quantity}x {oi.foods?.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.totalText}>Total Belanja</Text>
          <Text style={styles.totalValue}>Rp {item.total_price.toLocaleString('id-ID')}</Text>
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
          <Text style={styles.emptyText}>Belum ada riwayat pesanan.</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#747d8c',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#2f3542',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  status_pending: { backgroundColor: '#ffa502' },
  status_processed: { backgroundColor: '#1e90ff' },
  status_completed: { backgroundColor: '#2ed573' },
  status_cancelled: { backgroundColor: '#ff4757' },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#747d8c',
    fontSize: 12,
    marginBottom: 12,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f2f6',
    paddingVertical: 12,
    marginBottom: 12,
  },
  itemRow: {
    marginBottom: 4,
  },
  itemText: {
    color: '#57606f',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    color: '#2f3542',
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#ff4757',
    fontWeight: 'bold',
  },
});
