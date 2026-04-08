import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart } from 'lucide-react-native';

export default function FoodDetailScreen({ route, navigation }) {
  const { food } = route.params;
  const addToCart = useCartStore(state => state.addToCart);

  const handleAddToCart = () => {
    addToCart(food);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: food.image_url || 'https://picsum.photos/400/300' }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{food.name}</Text>
            <Text style={styles.price}>Rp {food.price.toLocaleString('id-ID')}</Text>
          </View>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>{food.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <ShoppingCart color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.addToCartText}>Tambah ke Keranjang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f3542',
    marginRight: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2f3542',
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    color: '#747d8c',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  addToCartBtn: {
    backgroundColor: '#ff4757',
    flexDirection: 'row',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
