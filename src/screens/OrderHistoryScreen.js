import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const user = useAuthStore(state => state.user);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, order_items(*, foods(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Terapkan Filter Tanggal
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
      fetchOrders();
    }, [filter])
  );

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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

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

        <View style={styles.itemsContainer}>
          {item.order_items && item.order_items.map((oi) => (
            <View key={oi.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{oi.quantity}x {oi.foods?.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalText}>Total Belanja</Text>
            <Text style={styles.paymentMethodText}>💳 {item.payment_method?.toUpperCase()} ({item.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'})</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.totalValue}>Rp {item.total_price.toLocaleString('id-ID')}</Text>
            {pointsUsed > 0 && (
              <Text style={styles.pointsUsedText}>🌟 Poin Dipakai: - Rp {pointsUsed.toLocaleString('id-ID')}</Text>
            )}
          </View>
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#ff4757',
  },
  filterText: {
    color: '#57606f',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#fff',
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
  paymentMethodText: {
    fontSize: 12,
    color: '#747d8c',
    marginTop: 4,
  },
  pointsUsedText: {
    color: '#ffa502',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4
  }
});
