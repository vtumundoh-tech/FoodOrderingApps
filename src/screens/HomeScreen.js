import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const cartTotalItems = useCartStore(state => state.getTotalItems());

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error) {
      setCategories(data);
    }
  }

  async function fetchFoods(categoryId) {
    setLoading(true);
    let query = supabase.from('foods').select('*').eq('is_available', true);
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    const { data, error } = await query;
    if (!error) {
      setFoods(data);
    }
    setLoading(false);
  }

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryPill, selectedCategory === item.id && styles.categoryPillActive]}
      onPress={() => {
        const newCat = selectedCategory === item.id ? null : item.id;
        setSelectedCategory(newCat);
        fetchFoods(newCat);
      }}
    >
      <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFood = ({ item }) => (
    <TouchableOpacity 
      style={styles.foodCard}
      onPress={() => navigation.navigate('FoodDetail', { food: item })}
    >
      <Image source={{ uri: item.image_url || 'https://picsum.photos/400/300' }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Lapar?</Text>
          <Text style={styles.subtitle}>Pilih makanan kesukaanmu</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingCart color="#333" size={24} />
          {cartTotalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartTotalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff4757" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={foods}
          renderItem={renderFood}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#747d8c',
  },
  cartBtn: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginVertical: 12,
    height: 45,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    marginRight: 8,
    justifyContent: 'center',
  },
  categoryPillActive: {
    backgroundColor: '#ff4757',
  },
  categoryText: {
    color: '#57606f',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: 150,
  },
  foodInfo: {
    padding: 16,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 4,
  },
  foodPrice: {
    fontSize: 16,
    color: '#ff4757',
    fontWeight: '600',
  },
});
