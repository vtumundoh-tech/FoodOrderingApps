import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Minus, Plus, Trash2 } from 'lucide-react-native';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart, getTotalItems } = useCartStore();
  const user = useAuthStore(state => state.user);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    // 1. Create order
    const { data: orderParams, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      total_price: getTotalPrice(),
      status: 'pending'
    }).select().single();

    if (orderError) {
      Alert.alert('Gagal Checkout', orderError.message);
      setLoading(false);
      return;
    }

    // 2. Create order items
    const itemsToInsert = cart.map((item) => ({
      order_id: orderParams.id,
      food_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

    setLoading(false);

    if (itemsError) {
      Alert.alert('Gagal Checkout', itemsError.message);
    } else {
      clearCart();
      Alert.alert('Berhasil', 'Pesanan berhasil dibuat!');
      navigation.navigate('OrderHistory');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image_url || 'https://picsum.photos/400/300' }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
        <View style={styles.qtyContainer}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
            <Minus size={16} color="#333" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
            <Plus size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
        <Trash2 size={24} color="#ff4757" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keranjang belanja kosong</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Mulai Belanja</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({getTotalItems()} item)</Text>
              <Text style={styles.totalValue}>Rp {getTotalPrice().toLocaleString('id-ID')}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutBtn, loading && { opacity: 0.7 }]} 
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutText}>Checkout</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f2f6',
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  itemPrice: {
    fontSize: 14,
    color: '#ff4757',
    marginTop: 4,
    marginBottom: 8,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    backgroundColor: '#f1f2f6',
    padding: 6,
    borderRadius: 6,
  },
  qtyText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#747d8c',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  checkoutBtn: {
    backgroundColor: '#ff4757',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#747d8c',
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
