import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const clearCart = useCartStore(state => state.clearCart);
  const [points, setPoints] = React.useState(0);

  useFocusEffect(
    React.useCallback(() => {
      if (user && !user.is_anonymous) {
        fetchPoints();
      }
    }, [user])
  );

  const fetchPoints = async () => {
    const { data } = await supabase.from('profiles').select('points').eq('id', user.id).single();
    if (data) {
      setPoints(data.points || 0);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Logout", 
          style: 'destructive',
          onPress: async () => {
            clearCart();
            await logout();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.is_anonymous ? 'Pelanggan Tamu' : (user?.user_metadata?.full_name || 'User')}</Text>
        <Text style={styles.email}>{user?.is_anonymous ? 'guest@local' : user?.email}</Text>
        
        {!user?.is_anonymous && (
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>🌟 {points.toLocaleString('id-ID')} Poin</Text>
          </View>
        )}
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={styles.menuText}>Riwayat Pesanan</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#dfe4ea',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff4757',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#747d8c',
  },
  menuContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#dfe4ea',
  },
  menuItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  menuText: {
    fontSize: 16,
    color: '#2f3542',
  },
  logoutBtn: {
    margin: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  logoutText: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsBadge: {
    marginTop: 12,
    backgroundColor: '#fff0f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffccd5',
  },
  pointsText: {
    color: '#ff4757',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
