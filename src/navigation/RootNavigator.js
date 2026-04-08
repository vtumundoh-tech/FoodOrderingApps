import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';
import CartScreen from '../screens/CartScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, setSession, setUser, setLoading } = useAuthStore();

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

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session && session.user ? (
          // MAIN APP STACK
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={({ navigation }) => ({
                headerShown: true,
                title: 'Food App',
                headerRight: () => (
                  <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
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
        ) : (
          // AUTH STACK
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
