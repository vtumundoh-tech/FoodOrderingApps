import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { User, LogOut } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';
import CartScreen from '../screens/CartScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminOrderScreen from '../screens/AdminOrderScreen';
import AdminCategoryScreen from '../screens/AdminCategoryScreen';
import AdminFoodListScreen from '../screens/AdminFoodListScreen';
import AdminFoodFormScreen from '../screens/AdminFoodFormScreen';

import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, setSession, setUser, setLoading, loading, logout, user } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#ff4757" />
      </View>
    );
  }

  const isAdmin = user?.email === 'adminbranch@gmail.com';

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session && session.user ? (
          isAdmin ? (
            // =========================
            // ADMIN STACK
            // =========================
            <>
              <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{
                  title: 'Terminal Admin Utama',
                  headerRight: () => (
                    <TouchableOpacity onPress={logout} style={{ marginRight: 10 }}>
                      <LogOut color="#ff4757" size={24} />
                    </TouchableOpacity>
                  ),
                }}
              />
              <Stack.Screen
                name="AdminOrder"
                component={AdminOrderScreen}
                options={{ title: 'Kelola Pesanan' }}
              />
              <Stack.Screen
                name="AdminCategory"
                component={AdminCategoryScreen}
                options={{ title: 'Kelola Kategori' }}
              />
              <Stack.Screen
                name="AdminFoodList"
                component={AdminFoodListScreen}
                options={{ title: 'Kelola Makanan' }}
              />
              <Stack.Screen
                name="AdminFoodForm"
                component={AdminFoodFormScreen}
                options={{ title: 'Formulir Makanan' }}
              />
            </>
          ) : (
            // =========================
            // USER STACK
            // =========================
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                  headerShown: true,
                  title: 'Kelompok 5: Food Ordering',
                  headerRight: () => (
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginRight: 10 }}>
                      <User color="#333" size={24} />
                    </TouchableOpacity>
                  ),
                })}
              />
              <Stack.Screen
                name="FoodDetail"
                component={FoodDetailScreen}
                options={{ title: 'Detail Makanan' }}
              />
              <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{ title: 'Keranjang' }}
              />
              <Stack.Screen
                name="OrderHistory"
                component={OrderHistoryScreen}
                options={{ title: 'Riwayat Pesanan' }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profil Saya' }}
              />
            </>
          )
        ) : (
          // =========================
          // AUTH STACK
          // =========================
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
