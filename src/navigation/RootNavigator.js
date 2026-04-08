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
import AdminOrderScreen from '../screens/AdminOrderScreen';

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
            <Stack.Screen
              name="AdminOrder"
              component={AdminOrderScreen}
              options={{
                title: 'Monitoring Pesanan',
                headerRight: () => (
                  <TouchableOpacity onPress={logout} style={{ marginRight: 10 }}>
                    <LogOut color="#ff4757" size={24} />
                  </TouchableOpacity>
                ),
              }}
            />
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
                  title: 'Food App',
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
