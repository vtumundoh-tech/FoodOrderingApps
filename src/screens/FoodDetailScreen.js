import React, { useState, useRef, useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Check } from 'lucide-react-native';

export default function FoodDetailScreen({ route, navigation }) {
  const { food } = route.params;
  const addToCart = useCartStore(state => state.addToCart);
  const cartTotalItems = useCartStore(state => state.getTotalItems());
  
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.headerCartBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingCart color="#333" size={24} />
          {cartTotalItems > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{cartTotalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, cartTotalItems]);

  const handleAddToCart = () => {
    addToCart(food);
    
    // Tampilkan popup animasi
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1000), // Pop up bertahan sedetik
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start(() => {
      setShowSuccess(false);
    });
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

      {/* Pop-up Sukses Animasi (Lingkaran Centang) */}
      {showSuccess && (
        <Animated.View style={[styles.successPopup, { opacity: fadeAnim }]}>
          <View style={styles.successCircle}>
            <Check color="#fff" size={40} />
          </View>
        </Animated.View>
      )}

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
  headerCartBtn: {
    position: 'relative',
    marginRight: 10,
    padding: 4,
  },
  headerBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  successPopup: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(46, 213, 115, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
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
